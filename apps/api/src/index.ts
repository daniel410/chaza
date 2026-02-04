import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';

import { productRoutes } from './routes/products';
import { retailerRoutes } from './routes/retailers';
import { searchRoutes } from './routes/search';
import { userRoutes } from './routes/users';
import { alertRoutes } from './routes/alerts';
import { healthRoutes } from './routes/health';
import { startScheduler, stopScheduler, scheduler } from './jobs';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

async function buildApp() {
  // Security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // JWT Authentication
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Chaza Price Comparison API',
        description: 'API for comparing prices across retailers',
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:3001',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Authentication decorator
  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // Optional authentication decorator (doesn't fail if no token)
  fastify.decorate('optionalAuth', async function (request: any) {
    try {
      await request.jwtVerify();
    } catch {
      // Token is invalid or missing, but we continue anyway
      request.user = null;
    }
  });

  // Register routes
  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(productRoutes, { prefix: '/api/products' });
  await fastify.register(retailerRoutes, { prefix: '/api/retailers' });
  await fastify.register(searchRoutes, { prefix: '/api/search' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(alertRoutes, { prefix: '/api/alerts' });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
    }

    return reply.status(error.statusCode || 500).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📚 API docs available at http://localhost:${port}/docs`);

    // Start job scheduler if enabled
    if (process.env.ENABLE_SCHEDULER === 'true') {
      console.log('🕐 Starting job scheduler...');
      startScheduler();
    }

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down...');
      stopScheduler();
      await app.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
