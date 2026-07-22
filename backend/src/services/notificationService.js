import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

let sendGridReady = false;
let cachedSmtpTransporter = null;

// Three states now: send via SendGrid's HTTP API, send via plain SMTP, or
// just log. SendGrid takes priority when both happen to be configured.
const getEmailChannel = () => {
  if (env.SENDGRID_API_KEY) return 'sendgrid-api';
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) return 'smtp';
  return null;
};

const getSmtpTransporter = () => {
  if (cachedSmtpTransporter) return cachedSmtpTransporter;
  cachedSmtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return cachedSmtpTransporter;
};

const TEMPLATES = {
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: (payload) => ({
    subject: 'Payment received — Smart Ride',
    text: `Hi ${payload.userName},\n\nWe've received your payment of ₹${payload.amount} for the ${payload.planName} plan. Your subscription is now waiting to be assigned a route and driver — we'll notify you as soon as that's done.\n\n— Smart Ride`,
  }),
  [NOTIFICATION_TYPES.DRIVER_ASSIGNED]: (payload) => ({
    subject: 'Your route is ready — Smart Ride',
    text: `Hi ${payload.userName},\n\nYou've been assigned to route "${payload.routeName}". Your pickup point is "${payload.pickupPointName}", departing at ${payload.departureTime}.\n\n— Smart Ride`,
  }),
  [NOTIFICATION_TYPES.DRIVER_APPROVED]: (payload) => ({
    subject: 'Your driver account has been approved — Smart Ride',
    text: `Hi ${payload.userName},\n\nGood news — your documents have been verified and your driver account is now approved. You're ready to be assigned a route.\n\n— Smart Ride`,
  }),
};

export const send = async (type, payload) => {
  const buildTemplate = TEMPLATES[type];
  if (!buildTemplate) {
    logger.warn(`notificationService.send called with an unhandled type: ${type}`);
    return;
  }

  const { subject, text } = buildTemplate(payload);
  const channel = getEmailChannel();

  if (!channel) {
    logger.info(
      `[NOTIFICATION:${type}] (no email credentials configured — logging only) To: ${payload.userEmail} | Subject: ${subject}\n${text}`
    );
    return;
  }

  try {
    if (channel === 'sendgrid-api') {
      // HTTPS API call (port 443) — deliberately NOT SMTP. Many hosts,
      // including Render's free tier, block outbound SMTP ports
      // 25/465/587 entirely, which is what caused the earlier
      // "Connection timeout" — the SMTP relay to smtp.sendgrid.net never
      // reached the network at all. The HTTP API sidesteps that
      // restriction completely since it's plain HTTPS.
      if (!sendGridReady) {
        sgMail.setApiKey(env.SENDGRID_API_KEY);
        sendGridReady = true;
      }
      await sgMail.send({ to: payload.userEmail, from: env.EMAIL_FROM, subject, text });
    } else {
      const transporter = getSmtpTransporter();
      await transporter.sendMail({ from: env.EMAIL_FROM, to: payload.userEmail, subject, text });
    }
    logger.info(`[NOTIFICATION:${type}] Email sent to ${payload.userEmail} via ${channel}`);
  } catch (err) {
    logger.error(`[NOTIFICATION:${type}] Failed to send to ${payload.userEmail}: ${err.message}`);
  }
};