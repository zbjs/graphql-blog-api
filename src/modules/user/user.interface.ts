// src/modules/user/user.interface.ts
export interface IUser {
    id: string;
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IUserInput {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
  }
  