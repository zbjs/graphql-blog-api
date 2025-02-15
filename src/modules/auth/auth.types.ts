// src/modules/auth/auth.types.ts
import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  username: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  username: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}