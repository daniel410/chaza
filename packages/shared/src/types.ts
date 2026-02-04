import { z } from 'zod';

// ============================================
// ENUMS (mirror Prisma enums for frontend use)
// ============================================

export const Region = {
  US: 'US',
  CA: 'CA',
} as const;
export type Region = (typeof Region)[keyof typeof Region];

export const ProductCategory = {
  BABY_DIAPERS: 'BABY_DIAPERS',
  BABY_FORMULA: 'BABY_FORMULA',
  BABY_FOOD: 'BABY_FOOD',
  BABY_WIPES: 'BABY_WIPES',
  BABY_CARE: 'BABY_CARE',
  BEVERAGES_SODA: 'BEVERAGES_SODA',
  BEVERAGES_WATER: 'BEVERAGES_WATER',
  BEVERAGES_JUICE: 'BEVERAGES_JUICE',
  BEVERAGES_SPORTS: 'BEVERAGES_SPORTS',
  HOUSEHOLD_CLEANING: 'HOUSEHOLD_CLEANING',
  HOUSEHOLD_PAPER: 'HOUSEHOLD_PAPER',
  HOUSEHOLD_LAUNDRY: 'HOUSEHOLD_LAUNDRY',
  PERSONAL_CARE: 'PERSONAL_CARE',
  PET_FOOD: 'PET_FOOD',
  PET_SUPPLIES: 'PET_SUPPLIES',
  SNACKS: 'SNACKS',
  OTHER: 'OTHER',
} as const;
export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export const AlertType = {
  PRICE_DROP: 'PRICE_DROP',
  PRICE_CHANGE: 'PRICE_CHANGE',
  BACK_IN_STOCK: 'BACK_IN_STOCK',
  DEAL: 'DEAL',
} as const;
export type AlertType = (typeof AlertType)[keyof typeof AlertType];

// ============================================
// CATEGORY HELPERS
// ============================================

export const CategoryGroups = {
  Baby: [
    ProductCategory.BABY_DIAPERS,
    ProductCategory.BABY_FORMULA,
    ProductCategory.BABY_FOOD,
    ProductCategory.BABY_WIPES,
    ProductCategory.BABY_CARE,
  ],
  Beverages: [
    ProductCategory.BEVERAGES_SODA,
    ProductCategory.BEVERAGES_WATER,
    ProductCategory.BEVERAGES_JUICE,
    ProductCategory.BEVERAGES_SPORTS,
  ],
  Household: [
    ProductCategory.HOUSEHOLD_CLEANING,
    ProductCategory.HOUSEHOLD_PAPER,
    ProductCategory.HOUSEHOLD_LAUNDRY,
  ],
  Personal: [ProductCategory.PERSONAL_CARE],
  Pets: [ProductCategory.PET_FOOD, ProductCategory.PET_SUPPLIES],
  Other: [ProductCategory.SNACKS, ProductCategory.OTHER],
} as const;

export const CategoryLabels: Record<ProductCategory, string> = {
  BABY_DIAPERS: 'Diapers',
  BABY_FORMULA: 'Baby Formula',
  BABY_FOOD: 'Baby Food',
  BABY_WIPES: 'Baby Wipes',
  BABY_CARE: 'Baby Care',
  BEVERAGES_SODA: 'Soda & Soft Drinks',
  BEVERAGES_WATER: 'Water',
  BEVERAGES_JUICE: 'Juice',
  BEVERAGES_SPORTS: 'Sports Drinks',
  HOUSEHOLD_CLEANING: 'Cleaning Supplies',
  HOUSEHOLD_PAPER: 'Paper Products',
  HOUSEHOLD_LAUNDRY: 'Laundry',
  PERSONAL_CARE: 'Personal Care',
  PET_FOOD: 'Pet Food',
  PET_SUPPLIES: 'Pet Supplies',
  SNACKS: 'Snacks',
  OTHER: 'Other',
};

// ============================================
// ZOD SCHEMAS (for API validation)
// ============================================

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  category: z.nativeEnum(ProductCategory).optional(),
  brand: z.string().optional(),
  region: z.nativeEnum(Region).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStockOnly: z.boolean().optional().default(false),
  sortBy: z.enum(['price_asc', 'price_desc', 'name', 'relevance']).optional().default('relevance'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const CreateAlertSchema = z.object({
  productId: z.string(),
  alertType: z.nativeEnum(AlertType),
  targetPrice: z.number().positive().optional(),
  channels: z.array(z.enum(['EMAIL', 'PUSH', 'SMS'])).min(1),
});

export type CreateAlert = z.infer<typeof CreateAlertSchema>;

export const UserPreferencesSchema = z.object({
  region: z.nativeEnum(Region),
  zipCode: z.string().optional(),
  preferredRetailers: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ProductWithPrices {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: { id: string; name: string; slug: string } | null;
  category: ProductCategory;
  imageUrl: string | null;
  size: number | null;
  sizeUnit: string | null;
  packSize: number;
  prices: PriceInfo[];
  lowestPrice: PriceInfo | null;
}

export interface PriceInfo {
  id: string;
  retailer: {
    id: string;
    name: string;
    slug: string;
    displayName: string;
    logoUrl: string | null;
  };
  currentPrice: number;
  originalPrice: number | null;
  currency: string;
  unitPrice: number | null;
  unitMeasure: string | null;
  inStock: boolean;
  isOnSale: boolean;
  productUrl: string;
  lastCheckedAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  wasOnSale: boolean;
}

export interface RetailerInfo {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  region: Region;
  logoUrl: string | null;
  websiteUrl: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatUnitPrice(unitPrice: number, unitMeasure: string, currency: string = 'USD'): string {
  const formatted = new Intl.NumberFormat(currency === 'CAD' ? 'en-CA' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(unitPrice);
  return `${formatted} ${unitMeasure}`;
}

export function calculateSavings(currentPrice: number, originalPrice: number): {
  amount: number;
  percentage: number;
} {
  const amount = originalPrice - currentPrice;
  const percentage = Math.round((amount / originalPrice) * 100);
  return { amount, percentage };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getRegionCurrency(region: Region): string {
  return region === 'CA' ? 'CAD' : 'USD';
}
