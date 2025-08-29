import { logger } from '@/lib/winston';

import Like from '@/models/like';
import Blog from '@/models/blog';

import type { Request, Response } from 'express';

const unlikeBlog = async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const userId = req.userId;

  try {
    const existingLike = await Like.findOne({ blogId, userId }).lean().exec();

    if (!existingLike) {
      res.status(400).json({
        code: 'BadRequest',
        message: 'You have not liked this blog',
      });
      return;
    }

    await Like.deleteOne({ blogId, userId }).exec();

    const blog = await Blog.findById(blogId).select('likesCount').exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    blog.likesCount--;
    await blog.save();

    logger.info('Blog unliked successfully', {
      userId,
      blogId,
      likesCount: blog.likesCount,
    });
    res.status(200).json({
      message: 'Blog unliked successfully',
      likesCount: blog.likesCount,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error while unliking a blog', error);
  }
};

export default unlikeBlog;
