import { v2 as cloudinary } from 'cloudinary';

import { logger } from '@/lib/winston';
import config from '@/config';

import User from '@/models/user';
import Blog from '@/models/blog';

import type { Request, Response } from 'express';
import { configDotenv } from 'dotenv';

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogId = req.params.blogId;
    const userId = req.userId;

    const user = await User.findById(userId).select('role').lean().exec();
    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .lean()
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    if (blog.author !== userId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'You are not authorized to delete this blog',
      });
      logger.warn(
        'A user tried to delete a blog without proper authorization',
        {
          userId,
        },
      );
      return;
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);
    logger.info('Blog banner has been deleted from cloudinary', {
      publicId: blog.banner.publicId,
    });

    await Blog.deleteOne({ _id: blogId });
    logger.info('A blog has been deleted', {
      userId,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error while deleting a blog', error);
  }
};

export default deleteBlog;
