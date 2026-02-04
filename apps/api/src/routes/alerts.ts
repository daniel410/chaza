import { FastifyInstance } from 'fastify';
import { prisma } from '@chaza/database';
import { CreateAlertSchema, AlertType } from '@chaza/shared';

export async function alertRoutes(fastify: FastifyInstance) {
  // Get user's price alerts
  fastify.get('/', {
    schema: {
      tags: ['Alerts'],
      security: [{ bearerAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20 },
        },
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any) => {
    const userId = request.user.id;
    const { isActive, page = 1, limit = 20 } = request.query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { region: true },
    });

    const [alerts, total] = await Promise.all([
      prisma.priceAlert.findMany({
        where,
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
                take: 1,
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.priceAlert.count({ where }),
    ]);

    const alertsWithPrices = alerts.map(alert => ({
      ...alert,
      targetPrice: alert.targetPrice ? Number(alert.targetPrice) : null,
      product: {
        ...alert.product,
        lowestPrice: alert.product.prices.length > 0 ? {
          ...alert.product.prices[0],
          currentPrice: Number(alert.product.prices[0].currentPrice),
        } : null,
      },
    }));

    return {
      data: alertsWithPrices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  });

  // Create a price alert
  fastify.post('/', {
    schema: {
      tags: ['Alerts'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          alertType: { type: 'string', enum: ['PRICE_DROP', 'PRICE_CHANGE', 'BACK_IN_STOCK', 'DEAL'] },
          targetPrice: { type: 'number' },
          channels: { 
            type: 'array', 
            items: { type: 'string', enum: ['EMAIL', 'PUSH', 'SMS'] },
          },
        },
        required: ['productId', 'alertType', 'channels'],
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;

    try {
      const data = CreateAlertSchema.parse(request.body);

      // Check if product exists
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        return reply.status(404).send({ error: 'Product not found' });
      }

      // Check for existing alert
      const existing = await prisma.priceAlert.findUnique({
        where: {
          userId_productId_alertType: {
            userId,
            productId: data.productId,
            alertType: data.alertType as any,
          },
        },
      });

      if (existing) {
        return reply.status(409).send({ 
          error: 'Alert already exists for this product and type',
          alertId: existing.id,
        });
      }

      // Validate target price for PRICE_DROP alerts
      if (data.alertType === 'PRICE_DROP' && !data.targetPrice) {
        return reply.status(400).send({ 
          error: 'Target price is required for price drop alerts',
        });
      }

      const alert = await prisma.priceAlert.create({
        data: {
          userId,
          productId: data.productId,
          alertType: data.alertType as any,
          targetPrice: data.targetPrice,
          channels: data.channels as any,
          isActive: true,
        },
        include: {
          product: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      return {
        ...alert,
        targetPrice: alert.targetPrice ? Number(alert.targetPrice) : null,
      };
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Invalid alert data', 
        details: error.errors || error.message,
      });
    }
  });

  // Update an alert
  fastify.patch<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Alerts'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: {
        type: 'object',
        properties: {
          targetPrice: { type: 'number' },
          channels: { 
            type: 'array', 
            items: { type: 'string', enum: ['EMAIL', 'PUSH', 'SMS'] },
          },
          isActive: { type: 'boolean' },
        },
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;
    const { id } = request.params;
    const { targetPrice, channels, isActive } = request.body;

    // Check alert ownership
    const alert = await prisma.priceAlert.findFirst({
      where: { id, userId },
    });

    if (!alert) {
      return reply.status(404).send({ error: 'Alert not found' });
    }

    const updated = await prisma.priceAlert.update({
      where: { id },
      data: {
        ...(targetPrice !== undefined && { targetPrice }),
        ...(channels !== undefined && { channels }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return {
      ...updated,
      targetPrice: updated.targetPrice ? Number(updated.targetPrice) : null,
    };
  });

  // Delete an alert
  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Alerts'],
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
    preHandler: [(fastify as any).authenticate],
  }, async (request: any, reply) => {
    const userId = request.user.id;
    const { id } = request.params;

    // Check alert ownership
    const alert = await prisma.priceAlert.findFirst({
      where: { id, userId },
    });

    if (!alert) {
      return reply.status(404).send({ error: 'Alert not found' });
    }

    await prisma.priceAlert.delete({
      where: { id },
    });

    return { message: 'Alert deleted' };
  });
}
