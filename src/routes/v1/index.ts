/**
 * Node modules
 */
import { Router } from 'express';

const router = Router();

/**
 * Routes
 */
import authRoutes from '@/routes/v1/auth';
import userRoute from '@/routes/v1/user';
import blogRoute from '@/routes/v1/blog';
import likeRoute from '@/routes/v1/like';
import commentRoute from '@/routes/v1/comment';

/**
 * Root route
 */
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API is live',
    status: 'ok',
    version: '1.0.0',
    docs: 'http://docs.blog-api.codewithsadee.com',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoute);
router.use('/blogs', blogRoute);
router.use('/likes', likeRoute);
router.use('/comments', commentRoute); 

export default router;
