import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { verifyAccessToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';

import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'AuthenticationError',
      message: 'Access denied, no token provided',
    });
    return;
  }

  const [_, token] = authHeader.split(' ');

  try {
    const jwtPayload = verifyAccessToken(token) as {
      userId: Types.ObjectId;
    };
    
    req.userId = jwtPayload.userId;

    return next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Access token expired, please login again',
      });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        code: 'AuthenticationError',
        message: 'Invalid access token',
      });
    }

    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error during authentication', error);
  }
};

export default authenticate;
