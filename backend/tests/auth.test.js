import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  phone: '9876543210',
};

describe('Auth: Registration', () => {
  it('registers a new user and sets an access token cookie', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects registration with missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'bad@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('always assigns role "user" regardless of any role field sent', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validUser, role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('user');
  });
});

describe('Auth: Login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects login for a non-existent email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nouser@example.com', password: 'password123' });

    expect(res.status).toBe(401);
  });
});

describe('Auth: Logout & protected routes', () => {
  it('clears the cookie on logout', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/accessToken=;/);
  });

  it('rejects /users/me without a token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('allows /users/me with a valid token cookie', async () => {
    const agent = request.agent(app);
    await agent.post('/api/v1/auth/register').send(validUser);

    const res = await agent.get('/api/v1/users/me');
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });
});

describe('Auth: Refresh token rotation', () => {
  const extractCookie = (setCookieHeader, name) => {
    const line = setCookieHeader.find((c) => c.startsWith(`${name}=`));
    if (!line) return null;
    return line.match(new RegExp(`${name}=([^;]+)`))[1];
  };

  it('issues both accessToken and refreshToken cookies on registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    const cookies = res.headers['set-cookie'];
    expect(extractCookie(cookies, 'accessToken')).toBeTruthy();
    expect(extractCookie(cookies, 'refreshToken')).toBeTruthy();
  });

  it('rotates both tokens on a successful refresh', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const originalRefresh = extractCookie(registerRes.headers['set-cookie'], 'refreshToken');

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', `refreshToken=${originalRefresh}`);

    expect(refreshRes.status).toBe(200);
    const newRefresh = extractCookie(refreshRes.headers['set-cookie'], 'refreshToken');
    expect(newRefresh).toBeTruthy();
    expect(newRefresh).not.toBe(originalRefresh);
  });

  it('rejects reuse of an already-rotated refresh token', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const originalRefresh = extractCookie(registerRes.headers['set-cookie'], 'refreshToken');

    // First use rotates it successfully.
    await request(app).post('/api/v1/auth/refresh-token').set('Cookie', `refreshToken=${originalRefresh}`);

    // Replaying the now-stale original token must be rejected outright,
    // not silently accepted as if nothing happened.
    const reuseRes = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', `refreshToken=${originalRefresh}`);

    expect(reuseRes.status).toBe(401);
    expect(reuseRes.body.error.code).toBe('REFRESH_TOKEN_REUSE');
  });

  it('rejects a refresh request with no token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh-token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('NO_REFRESH_TOKEN');
  });

  it('clears the stored refresh token in the DB on logout', async () => {
    const registerRes = await request(app).post('/api/v1/auth/register').send(validUser);
    const refreshToken = extractCookie(registerRes.headers['set-cookie'], 'refreshToken');

    await request(app).post('/api/v1/auth/logout').set('Cookie', `refreshToken=${refreshToken}`);

    const postLogoutRefresh = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(postLogoutRefresh.status).toBe(401);
  });
});