// src/models/User.ts
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  bio: String,
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

export const User = model<IUser>('User', userSchema);