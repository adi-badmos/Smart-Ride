import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { SubscriptionPlan } from '../src/models/subscriptionPlan.model.js';
import { Route } from '../src/models/route.model.js';
import { Subscription } from '../src/models/subscription.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
  await SubscriptionPlan.deleteMany({});
  await Route.deleteMany({});
  await Subscription.deleteMany({});
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

const createAdminAgent = async () => {
  await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
    phone: '1111111111',
    role: 'admin',
  });
  const agent = request.agent(app);
  await agent.post('/api/v1/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  return agent;
};

const createPlan = async () =>
  SubscriptionPlan.create({ name: 'Monthly', duration: 30, price: 1000, features: ['test'] });

const createRoute = async (capacity = 2) =>
  Route.create({
    name: 'Test Route',
    city: 'Test City',
    pickupPoints: [
      { name: 'Stop A', address: 'Addr A', order: 0 },
      { name: 'Stop B', address: 'Addr B', order: 1 },
    ],
    destination: { address: 'Destination Addr' },
    schedule: { departureTime: '08:00', arrivalTime: '09:00', operatingDays: ['mon', 'tue'] },
    capacity,
  });

describe('Subscription: creation', () => {
  it('creates a subscription in PAYMENT_PENDING status', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();

    const res = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });

    expect(res.status).toBe(201);
    expect(res.body.data.subscription.status).toBe('PAYMENT_PENDING');
  });

  it('rejects creation with an invalid plan id', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await agent.post('/api/v1/subscriptions').send({
      planId: fakeId,
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PLAN');
  });

  it('rejects creation with a missing address', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();

    const res = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: '' },
      desiredDestination: { address: 'Dest Addr' },
    });

    expect(res.status).toBe(400);
  });
});

describe('Subscription: cancellation rules', () => {
  it('rejects cancelling a PAYMENT_PENDING subscription', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;

    const res = await agent.put(`/api/v1/subscriptions/${subId}/cancel`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('allows cancelling a WAITING_ASSIGNMENT subscription', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;

    // Manually flip to WAITING_ASSIGNMENT — mock-pay is Phase 7
    await Subscription.findByIdAndUpdate(subId, { status: 'WAITING_ASSIGNMENT' });

    const res = await agent.put(`/api/v1/subscriptions/${subId}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.data.subscription.status).toBe('CANCELLED');
  });

  it("rejects a user cancelling another user's subscription", async () => {
    const agentA = request.agent(app);
    await registerAndLogin(agentA, { email: 'usera@example.com' });
    const plan = await createPlan();
    const createRes = await agentA.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;
    await Subscription.findByIdAndUpdate(subId, { status: 'WAITING_ASSIGNMENT' });

    const agentB = request.agent(app);
    await registerAndLogin(agentB, { email: 'userb@example.com' });

    const res = await agentB.put(`/api/v1/subscriptions/${subId}/cancel`);
    expect(res.status).toBe(404); // ownership-scoped query returns not-found, never leaks existence
  });
});

describe('Admin: subscription assignment', () => {
  it('assigns a route + pickup point and activates the subscription', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const route = await createRoute();

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;
    await Subscription.findByIdAndUpdate(subId, { status: 'WAITING_ASSIGNMENT' });

    const adminAgent = await createAdminAgent();
    const pickupPointId = route.pickupPoints[0]._id.toString();

    const res = await adminAgent.put(`/api/v1/admin/subscriptions/${subId}/assign`).send({
      routeId: route._id.toString(),
      pickupPointId,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.subscription.status).toBe('ACTIVE');
    expect(res.body.data.subscription.route).toBe(route._id.toString());
    expect(res.body.data.subscription.assignedPickupPoint).toBe(pickupPointId);
  });

  it('rejects a pickup point that does not belong to the selected route', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const route = await createRoute();
    const otherRoute = await createRoute();

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id;
    await Subscription.findByIdAndUpdate(subId, { status: 'WAITING_ASSIGNMENT' });

    const adminAgent = await createAdminAgent();

    const res = await adminAgent.put(`/api/v1/admin/subscriptions/${subId}/assign`).send({
      routeId: route._id.toString(),
      pickupPointId: otherRoute.pickupPoints[0]._id.toString(), // belongs to a DIFFERENT route
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PICKUP_POINT');
  });

  it('rejects assignment for a subscription that is not WAITING_ASSIGNMENT', async () => {
    const agent = request.agent(app);
    await registerAndLogin(agent);
    const plan = await createPlan();
    const route = await createRoute();

    const createRes = await agent.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const subId = createRes.body.data.subscription._id; // still PAYMENT_PENDING

    const adminAgent = await createAdminAgent();

    const res = await adminAgent.put(`/api/v1/admin/subscriptions/${subId}/assign`).send({
      routeId: route._id.toString(),
      pickupPointId: route.pickupPoints[0]._id.toString(),
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('does not block assignment when the route is already at capacity (soft check)', async () => {
    const agent1 = request.agent(app);
    await registerAndLogin(agent1, { email: 'rider1@example.com' });
    const agent2 = request.agent(app);
    await registerAndLogin(agent2, { email: 'rider2@example.com' });

    const plan = await createPlan();
    const route = await createRoute(1); // capacity of 1

    const sub1Res = await agent1.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const sub1Id = sub1Res.body.data.subscription._id;
    await Subscription.findByIdAndUpdate(sub1Id, { status: 'WAITING_ASSIGNMENT' });

    const sub2Res = await agent2.post('/api/v1/subscriptions').send({
      planId: plan._id.toString(),
      homeAddress: { address: 'Home Addr' },
      desiredDestination: { address: 'Dest Addr' },
    });
    const sub2Id = sub2Res.body.data.subscription._id;
    await Subscription.findByIdAndUpdate(sub2Id, { status: 'WAITING_ASSIGNMENT' });

    const adminAgent = await createAdminAgent();

    await adminAgent.put(`/api/v1/admin/subscriptions/${sub1Id}/assign`).send({
      routeId: route._id.toString(),
      pickupPointId: route.pickupPoints[0]._id.toString(),
    });

    const res = await adminAgent.put(`/api/v1/admin/subscriptions/${sub2Id}/assign`).send({
      routeId: route._id.toString(),
      pickupPointId: route.pickupPoints[1]._id.toString(),
    });

    expect(res.status).toBe(200);
    expect(res.body.data.subscription.status).toBe('ACTIVE');
    expect(res.body.data.occupancyWarning).not.toBeNull();
  });
});