import { Router } from 'express';
import { body, param } from 'express-validator';

/**
 * Controllers
 */
import likeBlog from '@/controllers/v1/like/like_blog';
import unlikeBlog from '@/controllers/v1/like/unlike_blog';

/**
 * Middlewares
 */
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';

const router = Router();

router.post(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog ID'),
//   body('userId')
//     .notEmpty()
//     .withMessage('User ID is required')
//     .isMongoId()
//     .withMessage('Invalid user ID'),
  validationError,
  likeBlog,
);

router.delete(
  '/blog/:blogId',
  authenticate,
  authorize(['admin', 'user']),
  param('blogId').isMongoId().withMessage('Invalid blog ID'),
  validationError,
  unlikeBlog,
);

export default router;
