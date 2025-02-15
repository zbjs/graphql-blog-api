// src/modules/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUser, JWTPayload, AuthResponse, UserRole } from './auth.types';
import { UserModel } from '../user/user.model';
import { logger } from '../../config/logger';

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET is not set in environment variables');
      throw new Error('JWT_SECRET must be set');
    }
    this.JWT_SECRET = jwtSecret;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  private generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role as UserRole
    };

    try {
      return jwt.sign(
        payload,
        this.JWT_SECRET,
        {
          expiresIn: this.JWT_EXPIRES_IN,
          algorithm: 'HS256', // Explicitly specify the algorithm
          audience: process.env.JWT_AUDIENCE || 'blog-api',
          issuer: process.env.JWT_ISSUER || 'blog-api',
          jwtid: crypto.randomUUID() // Unique identifier for the JWT
        }
      );
    } catch (error) {
      logger.error('Token generation failed:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user
      const user = await UserModel.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role as UserRole
        }
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256'], // Only allow HS256 algorithm
        audience: process.env.JWT_AUDIENCE || 'blog-api',
        issuer: process.env.JWT_ISSUER || 'blog-api'
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  // Optional: Method to validate token without throwing errors
  validateToken(token: string): { valid: boolean; payload?: JWTPayload } {
    try {
      const payload = this.verifyToken(token);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }
}