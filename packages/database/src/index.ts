// Re-export everything from Prisma Client
export * from '@prisma/client';

// Export the prisma client instance
export { prisma, default as db } from './client';

// Type helpers
export type { 
  User,
  Product,
  Price,
  PriceHistory,
  Retailer,
  Brand,
  Favorite,
  PriceAlert,
  ShoppingList,
  ShoppingListItem,
  SearchHistory,
  ScrapingJob,
  Account,
  Session,
} from '@prisma/client';
