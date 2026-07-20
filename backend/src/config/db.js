import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects to MongoDB Atlas with retry logic.
 * Deliberately does NOT call process.exit() here — that decision belongs
 * to server.js. Keeping this function side-effect-free on failure keeps
 * it unit-testable in isolation.
 */
export const connectDB = async (retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.MONGO_URI);
      logger.info(`MongoDB connected: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) {
        throw err;
      }
      await wait(RETRY_DELAY_MS);
    }
  }
  return null;
};