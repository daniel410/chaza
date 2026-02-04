import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '@chaza/database';
import bcrypt from 'bcryptjs';
import { UserPreferencesSchema, Region } from '@chaza/shared';

interface RegisterBody {
  email: string;
  password: string;
  name?: string;
  region?: Region;
}

interface LoginBody {
  email: string;
  password: string;
}

export async function userRoutes(fastify: FastifyInstance) {
  // Register new user
  fastify.post<{ Body: RegisterBody }>('/register', {
    schema: {
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          region: { type: 'string', enum: ['US', 'CA'], default: 'US' },
        },
        required: ['email', 'password'],
      },
    },
  }, async (request, reply) => {
    const { email, password, name, region = 'US' } = request.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        region: region as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        region: true,
        createdAt: true,
      },
    });

    // Create default shopping list
    await prisma.shoppingList.create({
      data: {
        userId: user.id,
        name: 'My List',
        isDefault: true,
      },
    });

    // Generate JWT token
    const token = fastify.jwt.sign({ 
      id: user.id, 
      email: user.email,
    }, { expiresIn: '7d' });

    return {
      user,
      token,
    };
  });

  // Login
  fastify.post<{ Body: LoginBody }>('/login', {
    schema: {
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = fastify.jwt.sign({ 
      id: user.id, 
      email: user.email,
    }, { expiresIn: '7d' });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        region: user.region,
      },
      token,
    };
  });

  // Get current user profile
  fastify.get('/me', {
    schema: {
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        region: true,
        zipCode: true,
        preferredRetailers: true,
        emailNotifications: true,
        pushNotifications: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            priceAlerts: true,
            shoppingLists: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return user;
  });

  // Update user preferences
  fastify.patch('/me/preferences', {
    schema: {
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          region: { type: 'string', enum: ['US', 'CA'] },
          zipCode: { type: 'string' },
          preferredRetailers: { type: 'array', items: { type: 'string' } },
          emailNotifications: { type: 'boolean' },
          pushNotifications: { type: 'boolean' },
        },
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const preferences = UserPreferencesSchema.partial().parse(request.body);

      const user = await prisma.user.update({
        where: { id: userId },
        data: preferences as any,
        select: {
          id: true,
          email: true,
          name: true,
          region: true,
          zipCode: true,
          preferredRetailers: true,
          emailNotifications: true,
          pushNotifications: true,
        },
      });

      return user;
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Invalid preferences', 
        details: error.errors || error.message,
      });
    }
  });

  // Get user favorites
  fastify.get('/me/favorites', {
    schema: {
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
        },
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any) => {
    const userId = request.user.id;
    const { page = 1, limit = 20 } = request.query;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { region: true },
    });

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              brand: true,
              prices: {
                where: {
                  retailer: { region: user?.region },
                },
                include: {
                  retailer: true,
                },
                orderBy: {
                  currentPrice: 'asc',
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    const products = favorites.map(fav => ({
      ...fav.product,
      favoriteId: fav.id,
      favoritedAt: fav.createdAt,
      prices: fav.product.prices.map(p => ({
        ...p,
        currentPrice: Number(p.currentPrice),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
      })),
      lowestPrice: fav.product.prices.length > 0 ? {
        ...fav.product.prices[0],
        currentPrice: Number(fav.product.prices[0].currentPrice),
        originalPrice: fav.product.prices[0].originalPrice ? Number(fav.product.prices[0].originalPrice) : null,
        unitPrice: fav.product.prices[0].unitPrice ? Number(fav.product.prices[0].unitPrice) : null,
      } : null,
    }));

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  });

  // Add to favorites
  fastify.post<{ Body: { productId: string } }>('/me/favorites', {
    schema: {
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
        },
        required: ['productId'],
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;
    const { productId } = request.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return reply.status(409).send({ error: 'Product already in favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: { userId, productId },
    });

    return { id: favorite.id, message: 'Added to favorites' };
  });

  // Remove from favorites
  fastify.delete<{ Params: { productId: string } }>('/me/favorites/:productId', {
    schema: {
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
        },
        required: ['productId'],
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;
    const { productId } = request.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (!favorite) {
      return reply.status(404).send({ error: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return { message: 'Removed from favorites' };
  });
}
