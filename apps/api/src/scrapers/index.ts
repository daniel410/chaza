export { BaseScraper, ScraperResult, ScrapedProduct, ScraperConfig } from './base';
export { WalmartScraper } from './walmart';
export { AmazonScraper } from './amazon';
export { CostcoScraper } from './costco';

import { WalmartScraper } from './walmart';
import { AmazonScraper } from './amazon';
import { CostcoScraper } from './costco';
import { BaseScraper } from './base';

export type RetailerSlug = 
  | 'walmart-us' 
  | 'walmart-ca' 
  | 'amazon-us' 
  | 'amazon-ca' 
  | 'costco-us' 
  | 'costco-ca'
  | 'target-us'
  | 'shoppers-ca';

export function getScraperForRetailer(retailerSlug: RetailerSlug): BaseScraper | null {
  switch (retailerSlug) {
    case 'walmart-us':
      return new WalmartScraper('US');
    case 'walmart-ca':
      return new WalmartScraper('CA');
    case 'amazon-us':
      return new AmazonScraper('US');
    case 'amazon-ca':
      return new AmazonScraper('CA');
    case 'costco-us':
      return new CostcoScraper('US');
    case 'costco-ca':
      return new CostcoScraper('CA');
    default:
      console.warn(`No scraper available for retailer: ${retailerSlug}`);
      return null;
  }
}

// List of all supported retailers for reference
export const SUPPORTED_RETAILERS: { slug: RetailerSlug; name: string; region: string }[] = [
  { slug: 'walmart-us', name: 'Walmart US', region: 'US' },
  { slug: 'walmart-ca', name: 'Walmart Canada', region: 'CA' },
  { slug: 'amazon-us', name: 'Amazon.com', region: 'US' },
  { slug: 'amazon-ca', name: 'Amazon.ca', region: 'CA' },
  { slug: 'costco-us', name: 'Costco US', region: 'US' },
  { slug: 'costco-ca', name: 'Costco Canada', region: 'CA' },
  { slug: 'target-us', name: 'Target', region: 'US' },
  { slug: 'shoppers-ca', name: 'Shoppers Drug Mart', region: 'CA' },
];
