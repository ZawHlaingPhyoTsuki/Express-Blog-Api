import { Schema, model, Types } from 'mongoose';

export interface IComment {
  userId: Types.ObjectId;
  blogId: Types.ObjectId;
  content: string;
}

const commentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  blogId: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, 'Blog ID is required'],
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [1000, 'Content cannot exceed 1000 characters'],
  },
});

export default model<IComment>('Comment', commentSchema);
