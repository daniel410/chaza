import { prisma, PriceSourceType, Prisma } from '@chaza/database';
import { getScraperForRetailer, RetailerSlug, ScrapedProduct } from '../scrapers';

interface PriceUpdateResult {
  retailerSlug: string;
  success: boolean;
  productsUpdated: number;
  pricesChanged: number;
  errors: string[];
  duration: number;
}

interface JobResult {
  startTime: Date;
  endTime: Date;
  retailers: PriceUpdateResult[];
  totalProductsUpdated: number;
  totalPricesChanged: number;
  totalErrors: number;
}

/**
 * Price Update Job
 * 
 * This job updates prices for all tracked products across all retailers.
 * It should be run on a schedule (e.g., daily at 2 AM).
 */
export class PriceUpdateJob {
  private jobId: string | null = null;

  async run(): Promise<JobResult> {
    const startTime = new Date();
    const results: PriceUpdateResult[] = [];

    console.log('[PriceUpdateJob] Starting price update job...');

    // Get all active retailers
    const retailers = await prisma.retailer.findMany({
      where: { isActive: true },
    });

    console.log(`[PriceUpdateJob] Found ${retailers.length} active retailers`);

    for (const retailer of retailers) {
      const result = await this.updateRetailerPrices(retailer.slug as RetailerSlug);
      results.push(result);

      // Add delay between retailers to avoid overwhelming servers
      await this.sleep(5000);
    }

    const endTime = new Date();

    const jobResult: JobResult = {
      startTime,
      endTime,
      retailers: results,
      totalProductsUpdated: results.reduce((sum, r) => sum + r.productsUpdated, 0),
      totalPricesChanged: results.reduce((sum, r) => sum + r.pricesChanged, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
    };

    console.log('[PriceUpdateJob] Job completed:', {
      duration: `${(endTime.getTime() - startTime.getTime()) / 1000}s`,
      productsUpdated: jobResult.totalProductsUpdated,
      pricesChanged: jobResult.totalPricesChanged,
      errors: jobResult.totalErrors,
    });

    return jobResult;
  }

  private async updateRetailerPrices(retailerSlug: RetailerSlug): Promise<PriceUpdateResult> {
    const startTime = Date.now();
    const result: PriceUpdateResult = {
      retailerSlug,
      success: false,
      productsUpdated: 0,
      pricesChanged: 0,
      errors: [],
      duration: 0,
    };

    console.log(`[PriceUpdateJob] Updating prices for ${retailerSlug}...`);

    try {
      // Get retailer from database
      const retailer = await prisma.retailer.findUnique({
        where: { slug: retailerSlug },
      });

      if (!retailer) {
        result.errors.push(`Retailer not found: ${retailerSlug}`);
        return result;
      }

      // Create a scraping job record
      const scrapingJob = await prisma.scrapingJob.create({
        data: {
          retailerId: retailer.id,
          status: 'running',
          startedAt: new Date(),
        },
      });

      this.jobId = scrapingJob.id;

      // Get all prices for this retailer that need updating
      const existingPrices = await prisma.price.findMany({
        where: { retailerId: retailer.id },
        include: { product: true },
      });

      console.log(`[PriceUpdateJob] Found ${existingPrices.length} products to update for ${retailerSlug}`);

      // Get scraper for this retailer
      const scraper = getScraperForRetailer(retailerSlug);

      if (!scraper) {
        result.errors.push(`No scraper available for ${retailerSlug}`);
        await this.updateJobStatus('failed', result.errors.join('; '));
        return result;
      }

      // Update prices for each product
      for (const price of existingPrices) {
        try {
          // In a real implementation, we would:
          // 1. Use the scraper to fetch updated price data
          // 2. Compare with existing price
          // 3. Update if changed
          // 4. Record price history

          const updatedData = await scraper.scrapeProductDetails(price.productUrl);

          if (updatedData) {
            const priceChanged = updatedData.currentPrice !== Number(price.currentPrice);

            // Update the price record
            await prisma.price.update({
              where: { id: price.id },
              data: {
                currentPrice: updatedData.currentPrice,
                originalPrice: updatedData.originalPrice || null,
                inStock: updatedData.inStock,
                lastCheckedAt: new Date(),
                ...(priceChanged && { lastChangedAt: new Date() }),
              },
            });

            result.productsUpdated++;

            // Record price history if price changed
            if (priceChanged) {
              await prisma.priceHistory.create({
                data: {
                  priceId: price.id,
                  productId: price.productId,
                  recordedPrice: updatedData.currentPrice,
                  wasOnSale: updatedData.originalPrice ? true : false,
                },
              });
              result.pricesChanged++;
            }
          } else {
            // Mark as checked even if scraping failed
            await prisma.price.update({
              where: { id: price.id },
              data: { lastCheckedAt: new Date() },
            });
            result.productsUpdated++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to update ${price.product.name}: ${errorMessage}`);
        }

        // Small delay between products
        await this.sleep(1000);
      }

      result.success = true;
      await this.updateJobStatus('completed');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(errorMessage);
      await this.updateJobStatus('failed', errorMessage);
      console.error(`[PriceUpdateJob] Error for ${retailerSlug}:`, errorMessage);
    }

    result.duration = Date.now() - startTime;
    console.log(`[PriceUpdateJob] Completed ${retailerSlug} in ${result.duration}ms`);

    return result;
  }

  private async updateJobStatus(status: string, errorLog?: string): Promise<void> {
    if (!this.jobId) return;

    await prisma.scrapingJob.update({
      where: { id: this.jobId },
      data: {
        status,
        completedAt: new Date(),
        errorLog,
      },
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Function to manually trigger price update for a specific retailer
export async function updateRetailerPrices(retailerSlug: RetailerSlug): Promise<PriceUpdateResult> {
  const job = new PriceUpdateJob();
  return job['updateRetailerPrices'](retailerSlug);
}

// Export a singleton instance for scheduled runs
export const priceUpdateJob = new PriceUpdateJob();
