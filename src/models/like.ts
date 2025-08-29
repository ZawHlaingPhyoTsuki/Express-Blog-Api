import mongoose, { Schema, model, Types } from 'mongoose';

export interface ILike {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  commentId?: Types.ObjectId;
}

const likeSchema = new Schema<ILike>({
  blogId: {
    type: Schema.Types.ObjectId,
    ref: 'Blog',
    required: function () {
      return !this.commentId; // Required if commentId is not provided
    },
    validate: {
      validator: async function (value: Types.ObjectId) : Promise<boolean> {
        if (!value) return true; // Skip validation if no blogId is provided
        const blog = await mongoose.model('Blog').exists({ _id: value });
        return !!blog;
      },
      message: 'Blog does not exist',
    },
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    required: function () {
      return !this.blogId; // Required if blogId is not provided
    },
    validate: {
      validator: async function (value: Types.ObjectId): Promise<boolean> {
        if (!value) return true; // Skip validation if no commentId is provided
        const comment = await mongoose.model('Comment').exists({ _id: value });
        return !!comment;
      },
      message: 'Comment does not exist',
    },
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    validate: {
      validator: async function (value: Types.ObjectId): Promise<boolean> {
        const user = await mongoose.model('User').exists({ _id: value });
        return !!user; // Convert to boolean
      },
      message: 'User does not exist',
    },
  },
});

export default model<ILike>('Like', likeSchema);
