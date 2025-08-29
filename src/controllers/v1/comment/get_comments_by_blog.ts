import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Comment from '@/models/comment';

import type { Request, Response } from 'express';
import type { IComment } from '@/models/comment';

const getCommentsByBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();

    if (!blog) {
      res.status(404).json({
        code: 'BlogNotFound',
        message: 'Blog not found',
      });
      return;
    }

    const allComments = await Comment.find({ blogId: blog._id })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    logger.info('Comments fetched successfully', { allComments });

    res.status(200).json({
      message: 'Comments fetched successfully',
      comments: allComments,
    });
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error while getting comments by a blog', error);
  }
};

export default getCommentsByBlog;
