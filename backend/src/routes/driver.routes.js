import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import {
  registerDriverRules,
  updateDriverProfileRules,
  documentUploadRules,
} from '../validators/driver.validator.js';
import {
  getMyRoute,
  getMyCommuters,
  registerDriverHandler,
  getMyDriverProfileHandler,
  updateMyDriverProfileHandler,
  uploadDocumentHandler,
} from '../controllers/driver.controller.js';
import { getMyPayouts } from '../controllers/payout.controller.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.post('/register', registerDriverRules, validate, registerDriverHandler);

router.use(protect, authorize(ROLES.DRIVER));

router.get('/my-route', getMyRoute);
router.get('/my-commuters', getMyCommuters);
router.get('/my-payouts', getMyPayouts);
router.get('/profile', getMyDriverProfileHandler);
router.put('/profile', updateDriverProfileRules, validate, updateMyDriverProfileHandler);
router.post('/documents', upload.single('document'), documentUploadRules, validate, uploadDocumentHandler);

export default router;