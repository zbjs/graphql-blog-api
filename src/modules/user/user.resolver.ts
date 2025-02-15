// src/modules/user/user.resolver.ts
import { UserService } from './user.service';
import { IUser, IUserInput } from './user.interface';

const userService = new UserService();

export const userResolver = {
  Query: {
    getUser: async (_: any, { id }: { id: string }) => {
      return userService.getUserById(id);
    },
    getUserByEmail: async (_: any, { email }: { email: string }) => {
      return userService.getUserByEmail(email);
    }
  },
  Mutation: {
    createUser: async (_: any, { input }: { input: IUserInput }) => {
      return userService.createUser(input);
    },
    updateUser: async (_: any, { id, input }: { id: string, input: Partial<IUserInput> }) => {
      return userService.updateUser(id, input);
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      return userService.deleteUser(id);
    }
  }
};