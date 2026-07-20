import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';

let cachedTransporter = null;

// Credentials are considered "configured" if either SendGrid's API key is
// set, or a full SMTP host+user+pass triplet is set. Anything less falls
// back to logging — this is what lets Tier 1 satisfy "basic notification
// on key events" without blocking on external credentials.
const isEmailConfigured = () =>
  Boolean(env.SENDGRID_API_KEY) || Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  if (env.SENDGRID_API_KEY) {
    // SendGrid's SMTP relay — no separate SDK dependency needed.
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: env.SENDGRID_API_KEY },
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }

  return cachedTransporter;
};

// Two event types only, per Tier 1 scope. DRIVER_APPROVED is added here
// in Phase 10 alongside the driver-verification workflow — not before.
const TEMPLATES = {
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: (payload) => ({
    subject: 'Payment received — Smart Ride',
    text: `Hi ${payload.userName},\n\nWe've received your payment of ₹${payload.amount} for the ${payload.planName} plan. Your subscription is now waiting to be assigned a route and driver — we'll notify you as soon as that's done.\n\n— Smart Ride`,
  }),
  [NOTIFICATION_TYPES.DRIVER_ASSIGNED]: (payload) => ({
    subject: 'Your route is ready — Smart Ride',
    text: `Hi ${payload.userName},\n\nYou've been assigned to route "${payload.routeName}". Your pickup point is "${payload.pickupPointName}", departing at ${payload.departureTime}.\n\n— Smart Ride`,
  }),
  // Third type, added in Phase 10 alongside the driver-verification workflow.
  [NOTIFICATION_TYPES.DRIVER_APPROVED]: (payload) => ({
    subject: 'Your driver account has been approved — Smart Ride',
    text: `Hi ${payload.userName},\n\nGood news — your documents have been verified and your driver account is now approved. You're ready to be assigned a route.\n\n— Smart Ride`,
  }),
};

/**
 * Single entry point for every notification in the app (see Architecture
 * Decisions: Notification service). Calling code never changes between
 * tiers — only what happens inside "send" does: log now, real email once
 * credentials exist, with zero changes required at the call sites.
 */
export const send = async (type, payload) => {
  const buildTemplate = TEMPLATES[type];
  if (!buildTemplate) {
    logger.warn(`notificationService.send called with an unhandled type: ${type}`);
    return;
  }

  const { subject, text } = buildTemplate(payload);

  if (!isEmailConfigured()) {
    logger.info(
      `[NOTIFICATION:${type}] (no email credentials configured — logging only) To: ${payload.userEmail} | Subject: ${subject}\n${text}`
    );
    return;
  }

  try {
    const transporter = getTransporter();
    await transporter.sendMail({ from: env.EMAIL_FROM, to: payload.userEmail, subject, text });
    logger.info(`[NOTIFICATION:${type}] Email sent to ${payload.userEmail}`);
  } catch (err) {
    // The triggering action (payment/assignment) has already succeeded by
    // the time this runs — a notification failure must never roll that
    // back or bubble up as an error to the caller. Log and move on.
    logger.error(`[NOTIFICATION:${type}] Failed to send to ${payload.userEmail}: ${err.message}`);
  }
};