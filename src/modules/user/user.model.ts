// src/modules/user/user.model.ts
import { Schema, model } from 'mongoose';
import { IUser } from './user.interface';

const userSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  firstName: String,
  lastName: String,
  role: { 
    type: String, 
    enum: ['USER', 'ADMIN'], 
    default: 'USER' 
  }
}, {
  timestamps: true,
  versionKey: false
});

export const UserModel = model<IUser>('User', userSchema);