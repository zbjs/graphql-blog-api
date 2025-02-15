// src/index.ts
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { authMiddleware } from './middleware/auth.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import {typeDefs} from './modules/user/user.graphql'

// Import resolvers from modules
import { userResolver } from './modules/user/user.resolver';
// import { postResolver } from './modules/post/post.resolver';
// import { commentResolver } from './modules/comment/comment.resolver';

// Load environment variables
dotenv.config();

async function startServer() {
  try {
    const app = express();
    
    // Apply basic middleware
    app.use(cors());
    app.use(helmet());
    app.use(json());

    // Connect to database
    await connectDatabase();

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs: [
        // Merge type definitions from all modules
        typeDefs
        // ...require('./modules/post/post.graphql'),
        // ...require('./modules/comment/comment.graphql'),
      ],
      resolvers: [
        userResolver,
        // postResolver,
        // commentResolver
      ],
    });

    // Start Apollo Server
    await server.start();

    // Apply Apollo middleware
    app.use(
      '/graphql',
      authMiddleware,
      expressMiddleware(server, {
        context: async ({ req }) => ({
          req,
          user: req.user, // Set by auth middleware
        }),
      })
    );

    // Error handling
    app.use(errorMiddleware);

    // Start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();