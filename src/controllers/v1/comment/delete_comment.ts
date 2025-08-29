import { logger } from '@/lib/winston';

import Blog from '@/models/blog';
import Comment from '@/models/comment';
import User from '@/models/user';

import type { Request, Response } from 'express';

const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const currentUserId = req.userId;

  try {
    const comment = await Comment.findById(commentId)
      .select('userId blogId')
      .lean()
      .exec();

    if (!comment) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Comment not found',
      });
      return;
    }

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      res.status(404).json({
        code: 'NotFound',
        message: 'Blog not found',
      });
      return;
    }

    const user = await User.findById(currentUserId)
      .select('role')
      .lean()
      .exec();

    // Only the comment owner or an admin can delete the comment
    if (comment.userId !== currentUserId && user?.role !== 'admin') {
      res.status(403).json({
        code: 'AuthorizationError',
        message: 'You are not authorized to delete this comment',
      });
      logger.warn('A user tried to delete a comment they do not own', {
        userId: currentUserId,
        commentId,
      });
      return;
    }

    await Comment.deleteOne({ _id: commentId });
    logger.info('Comment deleted successfully', { commentId });

    blog.commentsCount--;
    await blog.save();
    logger.info('Blog comments count decremented', {
      blogId: blog._id,
      commentsCount: blog.commentsCount,
    });

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal server error',
      error,
    });
    logger.error('Error while deleting a comment', error);
  }
};

export default deleteComment;
