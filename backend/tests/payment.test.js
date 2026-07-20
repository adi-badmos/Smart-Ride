import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { SubscriptionPlan } from '../src/models/subscriptionPlan.model.js';
import { Subscription } from '../src/models/subscription.model.js';
import { Payment } from '../src/models/payment.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
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

const createPlan = async (price = 1000) =>
  SubscriptionPlan.create({ name: 'Monthly', duration: 30, price, features: ['test'] });

describe('Payment: mock-pay', () => {
  it('transitions PAYMENT_PENDING -> WAITING_ASSIGNMENT and creates a captured mock Payment', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan(1500);

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;

    const res = await agent.post('/api/v1/payments/mock-pay').send({ subscriptionId: subId });

    expect(res.status).toBe(200);
    expect(res.body.data.subscription.status).toBe('WAITING_ASSIGNMENT');
    expect(res.body.data.payment.method).toBe('mock');
    expect(res.body.data.payment.status).toBe('captured');
    expect(res.body.data.payment.amount).toBe(1500);
    expect(res.body.data.payment.razorpayOrderId).toBeNull();

    const subscriptionInDb = await Subscription.findById(subId);
    expect(subscriptionInDb.paymentId.toString()).toBe(res.body.data.payment._id);

    const paymentCount = await Payment.countDocuments({ subscription: subId });
    expect(paymentCount).toBe(1);
  });

  it('rejects paying for a subscription that is not PAYMENT_PENDING', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;

    // Pay once — moves it to WAITING_ASSIGNMENT
    await agent.post('/api/v1/payments/mock-pay').send({ subscriptionId: subId });

    // Paying again should be rejected
    const res = await agent.post('/api/v1/payments/mock-pay').send({ subscriptionId: subId });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it("rejects paying for another user's subscription", async () => {
    const agentA = request.agent(app);
    await registerAndLogin(agentA, { email: 'usera@example.com' });
    const plan = await createPlan();

    const createRes = await agentA.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;

    const agentB = request.agent(app);
    await registerAndLogin(agentB, { email: 'userb@example.com' });

    const res = await agentB.post('/api/v1/payments/mock-pay').send({ subscriptionId: subId });

    expect(res.status).toBe(404);
  });

  it('rejects a request with an invalid subscriptionId', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);

    const res = await agent.post('/api/v1/payments/mock-pay').send({ subscriptionId: 'not-an-id' });

    expect(res.status).toBe(400);
  });
});