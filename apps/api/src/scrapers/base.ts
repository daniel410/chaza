import { PriceSourceType } from '@chaza/database';

export interface ScrapedProduct {
  retailerSku: string;
  name: string;
  brand?: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  inStock: boolean;
  productUrl: string;
  imageUrl?: string;
  upc?: string;
  size?: number;
  sizeUnit?: string;
  packSize?: number;
  category?: string;
}

export interface ScraperResult {
  success: boolean;
  products: ScrapedProduct[];
  errors: string[];
  totalProcessed: number;
  timestamp: Date;
}

export interface ScraperConfig {
  retailerSlug: string;
  baseUrl: string;
  rateLimit: number; // requests per minute
  userAgent?: string;
  proxy?: string;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected requestCount = 0;
  protected lastRequestTime = 0;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  protected async rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    const minInterval = (60 * 1000) / this.config.rateLimit;
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    const headers: HeadersInit = {
      'User-Agent': this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options?.headers,
    };

    return fetch(url, { ...options, headers });
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected parsePrice(priceString: string): number {
    // Remove currency symbols and parse
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  abstract scrapeProducts(query: string): Promise<ScraperResult>;
  abstract scrapeProductDetails(productUrl: string): Promise<ScrapedProduct | null>;
}
