import { FastifyInstance } from 'fastify';
import { prisma } from '@chaza/database';
import { SearchQuerySchema, Region, ProductCategory } from '@chaza/shared';

export async function searchRoutes(fastify: FastifyInstance) {
  // Search products
  fastify.get('/', {
    schema: {
      tags: ['Search'],
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 1 },
          category: { type: 'string' },
          brand: { type: 'string' },
          region: { type: 'string', enum: ['US', 'CA'] },
          minPrice: { type: 'number' },
          maxPrice: { type: 'number' },
          inStockOnly: { type: 'boolean', default: false },
          sortBy: { 
            type: 'string', 
            enum: ['price_asc', 'price_desc', 'name', 'relevance'],
            default: 'relevance',
          },
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 20, maximum: 100 },
        },
        required: ['q'],
      },
    },
  }, async (request, reply) => {
    try {
      const query = SearchQuerySchema.parse(request.query);
      const { q, category, brand, region, minPrice, maxPrice, inStockOnly, sortBy, page, limit } = query;
      const skip = (page - 1) * limit;

      // Build search conditions
      const where: any = {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { brand: { name: { contains: q, mode: 'insensitive' } } },
        ],
      };

      if (category) {
        where.category = category;
      }
      if (brand) {
        where.brand = { slug: brand };
      }
      if (region) {
        where.regions = { has: region };
      }

      // Price filters need a subquery approach
      let priceFilter: any = {};
      if (region) {
        priceFilter.retailer = { region };
      }
      if (inStockOnly) {
        priceFilter.inStock = true;
      }

      // Build order by
      let orderBy: any = { name: 'asc' };
      if (sortBy === 'name') {
        orderBy = { name: 'asc' };
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            brand: true,
            prices: {
              where: Object.keys(priceFilter).length > 0 ? priceFilter : undefined,
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
          orderBy,
        }),
        prisma.product.count({ where }),
      ]);

      // Filter by price range and transform
      let filteredProducts = products.map(product => {
        let prices = product.prices.map(p => ({
          ...p,
          currentPrice: Number(p.currentPrice),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          unitPrice: p.unitPrice ? Number(p.unitPrice) : null,
        }));

        // Apply price filters
        if (minPrice !== undefined) {
          prices = prices.filter(p => p.currentPrice >= minPrice);
        }
        if (maxPrice !== undefined) {
          prices = prices.filter(p => p.currentPrice <= maxPrice);
        }

        const lowestPrice = prices.length > 0 ? prices[0] : null;

        return {
          ...product,
          prices,
          lowestPrice,
        };
      });

      // Filter out products with no matching prices
      if (minPrice !== undefined || maxPrice !== undefined || inStockOnly) {
        filteredProducts = filteredProducts.filter(p => p.prices.length > 0);
      }

      // Sort by price if requested
      if (sortBy === 'price_asc') {
        filteredProducts.sort((a, b) => {
          if (!a.lowestPrice) return 1;
          if (!b.lowestPrice) return -1;
          return a.lowestPrice.currentPrice - b.lowestPrice.currentPrice;
        });
      } else if (sortBy === 'price_desc') {
        filteredProducts.sort((a, b) => {
          if (!a.lowestPrice) return 1;
          if (!b.lowestPrice) return -1;
          return b.lowestPrice.currentPrice - a.lowestPrice.currentPrice;
        });
      }

      return {
        query: q,
        data: filteredProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + limit < total,
        },
      };
    } catch (error: any) {
      return reply.status(400).send({ 
        error: 'Invalid query', 
        details: error.errors || error.message,
      });
    }
  });

  // Get search suggestions (autocomplete)
  fastify.get('/suggestions', {
    schema: {
      tags: ['Search'],
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string', minLength: 2 },
          limit: { type: 'number', default: 10, maximum: 20 },
        },
        required: ['q'],
      },
    },
  }, async (request: any) => {
    const { q, limit = 10 } = request.query;

    const [products, brands] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          name: true,
          slug: true,
          category: true,
        },
        take: limit,
      }),
      prisma.brand.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          name: true,
          slug: true,
        },
        take: 5,
      }),
    ]);

    return {
      products: products.map(p => ({
        type: 'product',
        name: p.name,
        slug: p.slug,
        category: p.category,
      })),
      brands: brands.map(b => ({
        type: 'brand',
        name: b.name,
        slug: b.slug,
      })),
    };
  });

  // Get popular/trending searches
  fastify.get('/trending', {
    schema: {
      tags: ['Search'],
      querystring: {
        type: 'object',
        properties: {
          region: { type: 'string', enum: ['US', 'CA'] },
          limit: { type: 'number', default: 10, maximum: 20 },
        },
      },
    },
  }, async (request: any) => {
    const { limit = 10 } = request.query;

    // Get most searched terms from search history
    const trending = await prisma.searchHistory.groupBy({
      by: ['query'],
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: limit,
    });

    return {
      trending: trending.map(t => ({
        query: t.query,
        count: t._count.query,
      })),
    };
  });
}
