import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '@chaza/database';
import { ProductCategory, Region } from '@chaza/shared';

interface ProductParams {
  slug: string;
}

interface ProductQuerystring {
  region?: Region;
  category?: ProductCategory;
  brand?: string;
  page?: number;
  limit?: number;
}

export async function productRoutes(fastify: FastifyInstance) {
  // Get all products with optional filters
  fastify.get<{ Querystring: ProductQuerystring }>('/', {
    schema: {
      tags: ['Products'],
      querystring: {
        type: 'object',
        properties: {
          region: { type: 'string', enum: ['US', 'CA'] },
          category: { type: 'string' },
          brand: { type: 'string' },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 },
        },
      },
    },
  }, async (request) => {
    const { region, category, brand, page = 1, limit = 20 } = request.query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (region) {
      where.regions = { has: region };
    }
    if (category) {
      where.category = category;
    }
    if (brand) {
      where.brand = { slug: brand };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          prices: {
            where: {
              retailer: region ? { region } : undefined,
            },
            include: {
              retailer: true,
            },
            orderBy: {
              currentPrice: 'asc',
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform data to include lowest price
    const productsWithLowestPrice = products.map(product => {
      const lowestPrice = product.prices.length > 0 ? product.prices[0] : null;
      return {
        ...product,
        prices: product.prices.map(p => ({
          ...p,
          currentPrice: Number(p.currentPrice),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
        })),
        lowestPrice: lowestPrice ? {
          ...lowestPrice,
          currentPrice: Number(lowestPrice.currentPrice),
          originalPrice: lowestPrice.originalPrice ? Number(lowestPrice.originalPrice) : null,
          unitPrice: lowestPrice.unitPrice ? Number(lowestPrice.unitPrice) : null,
        } : null,
      };
    });

    return {
      data: productsWithLowestPrice,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  });

  // Get single product by slug
  fastify.get<{ Params: ProductParams; Querystring: { region?: Region } }>('/:slug', {
    schema: {
      tags: ['Products'],
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
    const { region } = request.query;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        prices: {
          where: {
            retailer: region ? { region } : undefined,
          },
          include: {
            retailer: true,
          },
          orderBy: {
            currentPrice: 'asc',
          },
        },
      },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    const lowestPrice = product.prices.length > 0 ? product.prices[0] : null;

    return {
      ...product,
      prices: product.prices.map(p => ({
        ...p,
        currentPrice: Number(p.currentPrice),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
      })),
      lowestPrice: lowestPrice ? {
        ...lowestPrice,
        currentPrice: Number(lowestPrice.currentPrice),
        originalPrice: lowestPrice.originalPrice ? Number(lowestPrice.originalPrice) : null,
        unitPrice: lowestPrice.unitPrice ? Number(lowestPrice.unitPrice) : null,
      } : null,
    };
  });

  // Get price history for a product
  fastify.get<{ Params: ProductParams; Querystring: { days?: number } }>('/:slug/history', {
    schema: {
      tags: ['Products'],
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
          days: { type: 'number', default: 30, maximum: 365 },
        },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params;
    const { days = 30 } = request.query;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return reply.status(404).send({ error: 'Product not found' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await prisma.priceHistory.findMany({
      where: {
        productId: product.id,
        recordedAt: { gte: startDate },
      },
      include: {
        price: {
          include: {
            retailer: true,
          },
        },
      },
      orderBy: {
        recordedAt: 'asc',
      },
    });

    // Group by retailer
    const historyByRetailer: Record<string, any[]> = {};
    
    for (const entry of history) {
      const retailerSlug = entry.price.retailer.slug;
      if (!historyByRetailer[retailerSlug]) {
        historyByRetailer[retailerSlug] = [];
      }
      historyByRetailer[retailerSlug].push({
        date: entry.recordedAt.toISOString(),
        price: Number(entry.recordedPrice),
        wasOnSale: entry.wasOnSale,
      });
    }

    return {
      productId: product.id,
      days,
      history: historyByRetailer,
    };
  });

  // Get products by category
  fastify.get('/category/:category', {
    schema: {
      tags: ['Products'],
      params: {
        type: 'object',
        properties: {
          category: { type: 'string' },
        },
        required: ['category'],
      },
    },
  }, async (request: FastifyRequest<{ Params: { category: string }; Querystring: ProductQuerystring }>, reply) => {
    const { category } = request.params;
    const { region } = request.query;
    const page = Number(request.query.page) || 1;
    const limit = Number(request.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validate category
    if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
      return reply.status(400).send({ error: 'Invalid category' });
    }

    const where: any = {
      isActive: true,
      category,
    };

    if (region) {
      where.regions = { has: region };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          prices: {
            where: {
              retailer: region ? { region } : undefined,
            },
            include: {
              retailer: true,
            },
            orderBy: {
              currentPrice: 'asc',
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithLowestPrice = products.map(product => {
      const lowestPrice = product.prices.length > 0 ? product.prices[0] : null;
      return {
        ...product,
        prices: product.prices.map(p => ({
          ...p,
          currentPrice: Number(p.currentPrice),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
        })),
        lowestPrice: lowestPrice ? {
          ...lowestPrice,
          currentPrice: Number(lowestPrice.currentPrice),
          originalPrice: lowestPrice.originalPrice ? Number(lowestPrice.originalPrice) : null,
          unitPrice: lowestPrice.unitPrice ? Number(lowestPrice.unitPrice) : null,
        } : null,
      };
    });

    return {
      data: productsWithLowestPrice,
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
