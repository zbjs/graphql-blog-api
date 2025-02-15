// src/models/Comment.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  post: Types.ObjectId;
  author: Types.ObjectId;
  parentComment?: Types.ObjectId;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

export const Comment = model<IComment>('Comment', commentSchema);