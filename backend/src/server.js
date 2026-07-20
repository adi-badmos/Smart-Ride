import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';

let server;

const start = async () => {
  try {
    await connectDB();
    server = app.listen(env.PORT, () => {
      logger.info(`Smart Ride API listening on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1); // exit lives here, NOT inside connectDB()
  }
};

start();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});