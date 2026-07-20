import { body } from 'express-validator';

export const createComplaintRules = [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['service', 'driver', 'route', 'payment', 'other']).withMessage('Invalid complaint type'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

export const updateComplaintRules = [
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('adminResponse').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];