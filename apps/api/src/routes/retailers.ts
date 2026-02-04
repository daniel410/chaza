import { FastifyInstance } from 'fastify';
import { prisma } from '@chaza/database';
import { Region } from '@chaza/shared';

interface RetailerQuerystring {
  region?: Region;
}

export async function retailerRoutes(fastify: FastifyInstance) {
  // Get all retailers
  fastify.get<{ Querystring: RetailerQuerystring }>('/', {
    schema: {
      tags: ['Retailers'],
      querystring: {
        type: 'object',
        properties: {
          region: { type: 'string', enum: ['US', 'CA'] },
        },
      },
    },
  }, async (request) => {
    const { region } = request.query;

    const retailers = await prisma.retailer.findMany({
      where: {
        isActive: true,
        ...(region && { region }),
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        displayName: true,
        region: true,
        type: true,
        logoUrl: true,
        websiteUrl: true,
      },
    });

    return { data: retailers };
  });

  // Get single retailer by slug
  fastify.get<{ Params: { slug: string } }>('/:slug', {
    schema: {
      tags: ['Retailers'],
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params;

    const retailer = await prisma.retailer.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        displayName: true,
        region: true,
        type: true,
        logoUrl: true,
        websiteUrl: true,
      },
    });

    if (!retailer) {
      return reply.status(404).send({ error: 'Retailer not found' });
    }

    return retailer;
  });

  // Get products available at a specific retailer
  fastify.get<{ Params: { slug: string }; Querystring: { page?: number; limit?: number } }>('/:slug/products', {
    schema: {
      tags: ['Retailers'],
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 },
        },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params;
    const { page = 1, limit = 20 } = request.query;
    const skip = (page - 1) * limit;

    const retailer = await prisma.retailer.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!retailer) {
      return reply.status(404).send({ error: 'Retailer not found' });
    }

    const [prices, total] = await Promise.all([
      prisma.price.findMany({
        where: {
          retailerId: retailer.id,
          inStock: true,
        },
        include: {
          product: {
            include: {
              brand: true,
            },
          },
          retailer: true,
        },
        skip,
        take: limit,
        orderBy: {
          currentPrice: 'asc',
        },
      }),
      prisma.price.count({
        where: {
          retailerId: retailer.id,
          inStock: true,
        },
      }),
    ]);

    const products = prices.map(price => ({
      ...price.product,
      price: {
        currentPrice: Number(price.currentPrice),
        originalPrice: price.originalPrice ? Number(price.originalPrice) : null,
        unitPrice: price.unitPrice ? Number(price.unitPrice) : null,
        unitMeasure: price.unitMeasure,
        inStock: price.inStock,
        isOnSale: price.isOnSale,
        productUrl: price.productUrl,
      },
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
}
