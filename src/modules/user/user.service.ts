// src/modules/user/user.service.ts
import bcrypt from 'bcryptjs';
import { UserModel } from './user.model';
import { IUser, IUserInput } from './user.interface';
import { logger } from '../../config/logger';

export class UserService {
  async createUser(input: IUserInput): Promise<IUser> {
    try {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = new UserModel({
        ...input,
        password: hashedPassword
      });
      return await user.save();
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  async updateUser(id: string, input: Partial<IUserInput>): Promise<IUser | null> {
    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }
    return UserModel.findByIdAndUpdate(id, input, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}