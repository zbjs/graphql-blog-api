// src/models/Post.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  author: Types.ObjectId;
  categories: Types.ObjectId[];
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  tags: [String],
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  publishedAt: Date
}, { timestamps: true });

export const Post = model<IPost>('Post', postSchema);
