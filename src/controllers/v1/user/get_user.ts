import { logger } from '@/lib/winston';
import config from '@/config';

import User from '@/models/user';

import type { Request, Response } from 'express';

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).select('-__v').lean().exec();

    if (!user) {
      logger.info('User not found', {
        userId,
      });
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error while getting a user', error);
  }
};

export default getUser;
