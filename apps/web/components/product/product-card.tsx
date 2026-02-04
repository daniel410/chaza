'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ExternalLink, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, calculateSavings } from '@chaza/shared';
import { cn } from '@/lib/utils';

interface PriceInfo {
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
}

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    brand: { name: string; slug: string } | null;
    category: string;
    size: number | null;
    sizeUnit: string | null;
    packSize: number;
    prices: PriceInfo[];
    lowestPrice: PriceInfo | null;
  };
  showAllPrices?: boolean;
  onFavorite?: (productId: string) => void;
  isFavorited?: boolean;
}

export function ProductCard({
  product,
  showAllPrices = false,
  onFavorite,
  isFavorited = false,
}: ProductCardProps) {
  const { lowestPrice, prices } = product;

  const displayPrices = showAllPrices ? prices : prices.slice(0, 3);
  const hasMorePrices = prices.length > 3 && !showAllPrices;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Product Image */}
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square bg-muted">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </Link>

        {/* Favorite Button */}
        {onFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 bg-background/80 backdrop-blur-sm',
              isFavorited && 'text-red-500'
            )}
            onClick={(e) => {
              e.preventDefault();
              onFavorite(product.id);
            }}
          >
            <Heart className={cn('h-5 w-5', isFavorited && 'fill-current')} />
          </Button>
        )}

        {/* Sale Badge */}
        {lowestPrice?.isOnSale && (
          <Badge variant="success" className="absolute top-2 left-2">
            <TrendingDown className="h-3 w-3 mr-1" />
            Sale
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Brand */}
        {product.brand && (
          <Link
            href={`/brand/${product.brand.slug}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {product.brand.name}
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold mt-1 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Size Info */}
        {product.size && product.sizeUnit && (
          <p className="text-sm text-muted-foreground mt-1">
            {product.size} {product.sizeUnit}
            {product.packSize > 1 && ` (${product.packSize}-pack)`}
          </p>
        )}

        {/* Lowest Price */}
        {lowestPrice && (
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(lowestPrice.currentPrice, lowestPrice.currency)}
              </span>
              {lowestPrice.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(lowestPrice.originalPrice, lowestPrice.currency)}
                </span>
              )}
            </div>
            {lowestPrice.originalPrice && (
              <p className="text-sm text-success font-medium">
                Save{' '}
                {
                  calculateSavings(
                    lowestPrice.currentPrice,
                    lowestPrice.originalPrice
                  ).percentage
                }
                %
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              at {lowestPrice.retailer.displayName}
            </p>
            {lowestPrice.unitPrice && lowestPrice.unitMeasure && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(lowestPrice.unitPrice, lowestPrice.currency)}{' '}
                {lowestPrice.unitMeasure}
              </p>
            )}
          </div>
        )}

        {/* Price Comparison */}
        {displayPrices.length > 1 && (
          <div className="mt-4 space-y-2 border-t pt-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">
              Compare Prices
            </h4>
            {displayPrices.map((price) => (
              <div
                key={price.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  {price.retailer.logoUrl && (
                    <Image
                      src={price.retailer.logoUrl}
                      alt={price.retailer.name}
                      width={16}
                      height={16}
                      className="rounded"
                    />
                  )}
                  <span className="truncate max-w-[100px]">
                    {price.retailer.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-medium',
                      price.id === lowestPrice?.id && 'text-success'
                    )}
                  >
                    {formatPrice(price.currentPrice, price.currency)}
                  </span>
                  {!price.inStock && (
                    <Badge variant="outline" className="text-xs">
                      Out of stock
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {hasMorePrices && (
              <Link
                href={`/product/${product.slug}`}
                className="text-xs text-primary hover:underline block text-center mt-2"
              >
                +{prices.length - 3} more retailers
              </Link>
            )}
          </div>
        )}

        {/* No prices available */}
        {prices.length === 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            Price unavailable
          </p>
        )}

        {/* CTA Button */}
        {lowestPrice && (
          <Button asChild className="w-full mt-4" size="sm">
            <a
              href={lowestPrice.productUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View at {lowestPrice.retailer.displayName}
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
