import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Pin these BEFORE anything imports config/env.js (which only happens
// transitively, via the dynamic import of app.js in beforeAll). dotenv
// never overrides a process.env value that's already set, so this makes
// the HMAC secrets these tests rely on deterministic — independent of
// whatever real (or placeholder) values happen to be sitting in the
// developer's own .env. Without this, anyone who has already filled in
// a real RAZORPAY_KEY_SECRET sees this exact test fail, even though the
// underlying signature-verification logic in payment.service.js is
// correct — it's the test's assumption that was fragile, not the code.
process.env.RAZORPAY_KEY_ID = 'rzp_test_placeholder';
process.env.RAZORPAY_KEY_SECRET = 'placeholder_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'placeholder_webhook_secret';

let mongoServer;
let app;
let User, SubscriptionPlan, Subscription, Payment;

const FAKE_ORDER_ID = 'order_FAKE123';
const KEY_SECRET_FALLBACK = 'placeholder_secret';
const WEBHOOK_SECRET_FALLBACK = 'placeholder_webhook_secret';

beforeAll(async () => {
  jest.unstable_mockModule('../src/utils/razorpay.js', () => ({
    razorpay: {
      orders: {
        create: jest.fn(async ({ amount, currency, receipt }) => ({
          id: FAKE_ORDER_ID,
          amount,
          currency,
          receipt,
        })),
      },
    },
  }));

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  ({ default: app } = await import('../src/app.js'));
  ({ User } = await import('../src/models/user.model.js'));
  ({ SubscriptionPlan } = await import('../src/models/subscriptionPlan.model.js'));
  ({ Subscription } = await import('../src/models/subscription.model.js'));
  ({ Payment } = await import('../src/models/payment.model.js'));
});

afterEach(async () => {
  await User.deleteMany({});
  await SubscriptionPlan.deleteMany({});
  await Subscription.deleteMany({});
  await Payment.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const registerAndLogin = async (agent, overrides = {}) => {
  const payload = {
    name: 'Test Rider',
    email: 'rider@example.com',
    password: 'password123',
    phone: '9876543210',
    ...overrides,
  };
  await agent.post('/api/v1/auth/register').send(payload);
  return payload;
};

const createPlan = async (price = 1500) =>
  SubscriptionPlan.create({ name: 'Monthly', duration: 30, price, features: ['test'] });

const createSubscription = async (agent, plan) => {
  const res = await agent.post('/api/v1/subscriptions').send({
    planId: plan._id.toString(),
    homeAddress: { address: 'Home Addr' },
    desiredDestination: { address: 'Dest Addr' },
  });
  return res.body.data.subscription._id;
};

describe('Payment: create-order', () => {
  it('creates a Razorpay order and a Payment doc in "created" status', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan(1500);
    const subId = await createSubscription(agent, plan);

    const res = await agent.post('/api/v1/payments/create-order').send({ subscriptionId: subId });

    expect(res.status).toBe(201);
    expect(res.body.data.orderId).toBe(FAKE_ORDER_ID);
    expect(res.body.data.amount).toBe(150000);

    const payment = await Payment.findOne({ subscription: subId });
    expect(payment.method).toBe('razorpay');
    expect(payment.status).toBe('created');
    expect(payment.razorpayOrderId).toBe(FAKE_ORDER_ID);

    const subscription = await Subscription.findById(subId);
    expect(subscription.paymentId.toString()).toBe(payment._id.toString());
    expect(subscription.status).toBe('PAYMENT_PENDING');
  });

  it('rejects creating an order for a subscription that is not PAYMENT_PENDING', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const subId = await createSubscription(agent, plan);
    await Subscription.findByIdAndUpdate(subId, { status: 'WAITING_ASSIGNMENT' });

    const res = await agent.post('/api/v1/payments/create-order').send({ subscriptionId: subId });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });
});

describe('Payment: signature verification', () => {
  it('accepts a valid signature and marks the payment authorized', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const subId = await createSubscription(agent, plan);
    await agent.post('/api/v1/payments/create-order').send({ subscriptionId: subId });

    const paymentId = 'pay_FAKE999';
    const signature = crypto
      .createHmac('sha256', KEY_SECRET_FALLBACK)
      .update(`${FAKE_ORDER_ID}|${paymentId}`)
      .digest('hex');

    const res = await agent.post('/api/v1/payments/verify').send({
      razorpay_order_id: FAKE_ORDER_ID,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.verified).toBe(true);

    const payment = await Payment.findOne({ razorpayOrderId: FAKE_ORDER_ID });
    expect(payment.status).toBe('authorized');
    expect(payment.razorpayPaymentId).toBe(paymentId);
  });

  it('rejects a tampered signature', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const subId = await createSubscription(agent, plan);
    await agent.post('/api/v1/payments/create-order').send({ subscriptionId: subId });

    const res = await agent.post('/api/v1/payments/verify').send({
      razorpay_order_id: FAKE_ORDER_ID,
      razorpay_payment_id: 'pay_FAKE999',
      razorpay_signature: 'not_a_real_signature_at_all',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_SIGNATURE');

    const payment = await Payment.findOne({ razorpayOrderId: FAKE_ORDER_ID });
    expect(payment.status).toBe('created');
  });
});

describe('Webhook: payment.captured', () => {
  const buildCapturedPayload = (orderId, paymentId) =>
    JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: paymentId, order_id: orderId, amount: 150000 } } },
    });

  const signBody = (rawBody) =>
    crypto.createHmac('sha256', WEBHOOK_SECRET_FALLBACK).update(rawBody).digest('hex');

  it('transitions PAYMENT_PENDING -> WAITING_ASSIGNMENT and marks the payment captured', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const subId = await createSubscription(agent, plan);
    await agent.post('/api/v1/payments/create-order').send({ subscriptionId: subId });

    const rawBody = buildCapturedPayload(FAKE_ORDER_ID, 'pay_WEBHOOK1');
    const signature = signBody(rawBody);

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(rawBody);

    expect(res.status).toBe(200);

    const subscription = await Subscription.findById(subId);
    expect(subscription.status).toBe('WAITING_ASSIGNMENT');

    const payment = await Payment.findOne({ razorpayOrderId: FAKE_ORDER_ID });
    expect(payment.status).toBe('captured');
    expect(payment.razorpayPaymentId).toBe('pay_WEBHOOK1');
  });

  it('is idempotent on duplicate delivery of the same event', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const subId = await createSubscription(agent, plan);
    await agent.post('/api/v1/payments/create-order').send({ subscriptionId: subId });

    const rawBody = buildCapturedPayload(FAKE_ORDER_ID, 'pay_WEBHOOK2');
    const signature = signBody(rawBody);

    const first = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(rawBody);

    const second = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(rawBody);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const subscription = await Subscription.findById(subId);
    expect(subscription.status).toBe('WAITING_ASSIGNMENT');

    const paymentCount = await Payment.countDocuments({ razorpayOrderId: FAKE_ORDER_ID });
    expect(paymentCount).toBe(1);
  });

  it('rejects a webhook with an invalid signature', async () => {
    const rawBody = buildCapturedPayload(FAKE_ORDER_ID, 'pay_BADSIG');

    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', 'clearly_wrong_signature')
      .send(rawBody);

    expect(res.status).toBe(400);
  });
});