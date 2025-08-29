import { v2 as cloudinary } from 'cloudinary';

import { logger } from '@/lib/winston';

import User from '@/models/user';
import Blog from '@/models/blog';

import type { Request, Response } from 'express';

const deleteCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;
  try {
    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();
    const publicIds = blogs.map((blog) => blog.banner.publicId);

    await cloudinary.api.delete_resources(publicIds);
    logger.info(
      'All blog banners of the user have been deleted from cloudinary',
      {
        publicIds,
      },
    );

    await Blog.deleteMany({ author: userId });
    logger.info('All blogs of the user have been deleted', {
      userId,
      blogs,
    });

    await User.findByIdAndDelete({ _id: userId });
    logger.info('A user account has been deleted', {
      userId,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error while deleting current user account', error);
  }
};

export default deleteCurrentUser;
