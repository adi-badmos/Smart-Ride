import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { User } from '../models/user.model.js';
import { SubscriptionPlan } from '../models/subscriptionPlan.model.js';
import { ROLES } from './constants.js';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@smartride.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'smartrideKaAdmin';

const PLANS = [
  {
    name: 'Monthly',
    description: 'Billed every month. Cancel anytime.',
    duration: 30,
    price: 2499,
    features: ['Daily pickup & drop', 'Fixed route & driver', 'Email support'],
  },
  {
    name: 'Quarterly',
    description: 'Billed every 3 months. Save over monthly.',
    duration: 90,
    price: 6999,
    features: ['Daily pickup & drop', 'Fixed route & driver', 'Priority email support'],
  },
  {
    name: 'Yearly',
    description: 'Billed annually. Best value.',
    duration: 365,
    price: 24999,
    features: ['Daily pickup & drop', 'Fixed route & driver', 'Priority support', '2 months free vs. monthly'],
  },
];

const run = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      phone: '0000000000',
      role: ROLES.ADMIN,
    });
    logger.info(`Seeded admin account -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (change this after first login)`);
  } else {
    logger.info('Admin account already exists — skipping.');
  }

  for (const plan of PLANS) {
    const exists = await SubscriptionPlan.findOne({ name: plan.name });
    if (!exists) {
      await SubscriptionPlan.create(plan);
      logger.info(`Seeded plan: ${plan.name}`);
    } else {
      logger.info(`Plan already exists: ${plan.name} — skipping.`);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});