// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../modules/auth/auth.service';
import { JWTPayload, UserRole } from '../modules/auth/auth.types';
import { logger } from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
      };
    }
  }
}

export class AuthError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

const authService = new AuthService();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthError(
        'Invalid authorization header format',
        'INVALID_AUTH_FORMAT'
      );
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AuthError(
        'No token provided',
        'NO_TOKEN'
      );
    }

    const payload = authService.verifyToken(token);

    // Add user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', {
     
      path: req.path,
      method: req.method
    });

    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
      return;
    }

    res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

// Role-based access control middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthError(
        'Authentication required',
        'AUTH_REQUIRED'
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthError(
        'Insufficient permissions',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    next();
  };
};

// Protected route middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AuthError(
      'Authentication required',
      'AUTH_REQUIRED'
    );
  }
  next();
};