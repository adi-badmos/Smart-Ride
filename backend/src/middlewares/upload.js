import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Memory storage — file lands in req.file.buffer, never touches disk.
// Piped straight to Cloudinary from there (see utils/cloudinary.js).
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new AppError('Only JPEG, PNG, and PDF files are allowed', 400, 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

// Server-side validation — the frontend's `accept` attribute is a UX
// hint only and is never trusted on its own.
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});