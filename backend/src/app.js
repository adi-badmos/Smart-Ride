import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { AppError } from './utils/AppError.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import vehicleRoutes from './routes/vehicle.routes.js';
import driverRoutes from './routes/driver.routes.js';
import routeRoutes from './routes/route.routes.js';
import planRoutes from './routes/plan.routes.js';
import planAdminRoutes from './routes/planAdmin.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import paymentWebhookRoutes from './routes/payment.webhook.js';
import attendanceRoutes from './routes/attendance.routes.js';
import complaintRoutes from './routes/complaint.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());

app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentWebhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/vehicles', vehicleRoutes);
app.use('/api/v1/admin/routes', routeRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/admin/plans', planAdminRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.send('Smart Ride API is running');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;