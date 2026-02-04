'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Bell,
  ExternalLink,
  Share2,
  ChevronRight,
  TrendingDown,
  Check,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productsApi } from '@/lib/api';
import { formatPrice, calculateSavings, CategoryLabels } from '@chaza/shared';
import { cn } from '@/lib/utils';

export default function USProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug, 'US'],
    queryFn: () => productsApi.getBySlug(slug, 'US'),
    enabled: !!slug,
  });

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header region="US" />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The product you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild className="mt-6">
              <Link href="/us">Go Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const p = product as any;
  const lowestPrice = p.lowestPrice;
  const prices = p.prices || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header region="US" />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b">
          <div className="container py-3">
            <nav className="flex items-center text-sm text-muted-foreground">
              <Link href="/us" className="hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <Link
                href={`/us/category/${p.category?.toLowerCase()}`}
                className="hover:text-foreground"
              >
                {CategoryLabels[p.category as keyof typeof CategoryLabels] || p.category}
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-foreground truncate max-w-[200px]">
                {p.name}
              </span>
            </nav>
          </div>
        </div>

        {/* 50/50 Layout: Image+Description | Price Panel */}
        <div className="container py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column (50%): Image and Description */}
            <div>
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden sticky top-24">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      className="object-contain p-8"
                      priority
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image available
                    </div>
                  )}
                  {lowestPrice?.isOnSale && (
                    <Badge
                      variant="success"
                      className="absolute top-4 left-4 text-sm"
                    >
                      <TrendingDown className="h-4 w-4 mr-1" />
                      On Sale
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {p.description && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{p.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column (50%): Product Info and Pricing */}
            <div className="space-y-6">
              {/* Brand */}
              {p.brand && (
                <Link
                  href={`/us/brand/${p.brand.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {p.brand.name}
                </Link>
              )}

              {/* Name */}
              <h1 className="text-3xl font-bold mt-2">{p.name}</h1>

              {/* Size Info */}
              {p.size && p.sizeUnit && (
                <p className="text-muted-foreground mt-2">
                  {p.size} {p.sizeUnit}
                  {p.packSize > 1 && ` (${p.packSize}-pack)`}
                </p>
              )}

              {/* Best Price Highlight */}
              {lowestPrice && (
                <Card className="border-primary">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          Best Price at {lowestPrice.retailer.displayName}
                        </p>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="text-4xl font-bold text-primary">
                            {formatPrice(
                              lowestPrice.currentPrice,
                              lowestPrice.currency
                            )}
                          </span>
                          {lowestPrice.originalPrice && (
                            <span className="text-xl text-muted-foreground line-through">
                              {formatPrice(
                                lowestPrice.originalPrice,
                                lowestPrice.currency
                              )}
                            </span>
                          )}
                        </div>
                        {lowestPrice.originalPrice && (
                          <p className="text-success font-medium mt-1">
                            Save{' '}
                            {formatPrice(
                              lowestPrice.originalPrice - lowestPrice.currentPrice,
                              lowestPrice.currency
                            )}{' '}
                            (
                            {
                              calculateSavings(
                                lowestPrice.currentPrice,
                                lowestPrice.originalPrice
                              ).percentage
                            }
                            % off)
                          </p>
                        )}
                        {lowestPrice.unitPrice && lowestPrice.unitMeasure && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatPrice(
                              lowestPrice.unitPrice,
                              lowestPrice.currency
                            )}{' '}
                            {lowestPrice.unitMeasure}
                          </p>
                        )}
                      </div>
                      <Button size="lg" asChild>
                        <a
                          href={lowestPrice.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Buy Now
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Favorites
                </Button>
                <Button variant="outline" className="flex-1">
                  <Bell className="mr-2 h-4 w-4" />
                  Set Price Alert
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* All Prices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compare All Prices</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {prices.map((price: any, index: number) => (
                      <div
                        key={price.id}
                        className={cn(
                          'flex items-center justify-between p-4',
                          index === 0 && 'bg-success/5'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {price.retailer.logoUrl && (
                            <Image
                              src={price.retailer.logoUrl}
                              alt={price.retailer.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">
                              {price.retailer.displayName}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              {price.inStock ? (
                                <span className="text-success flex items-center gap-1">
                                  <Check className="h-3 w-3" /> In Stock
                                </span>
                              ) : (
                                <span className="text-destructive flex items-center gap-1">
                                  <X className="h-3 w-3" /> Out of Stock
                                </span>
                              )}
                              {price.isOnSale && (
                                <Badge variant="success" className="text-xs">
                                  Sale
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-2">
                            <span
                              className={cn(
                                'text-xl font-bold',
                                index === 0 && 'text-success'
                              )}
                            >
                              {formatPrice(price.currentPrice, price.currency)}
                            </span>
                            {price.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(
                                  price.originalPrice,
                                  price.currency
                                )}
                              </span>
                            )}
                          </div>
                          {price.unitPrice && price.unitMeasure && (
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(price.unitPrice, price.currency)}{' '}
                              {price.unitMeasure}
                            </p>
                          )}
                          <Button
                            variant={index === 0 ? 'default' : 'outline'}
                            size="sm"
                            className="mt-2"
                            asChild
                          >
                            <a
                              href={price.productUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}

                    {prices.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground">
                        No prices available for this product in your region.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header region="US" />
      <main className="flex-1 container py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Image and Description */}
          <div className="space-y-8">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-40 w-full" />
          </div>
          {/* Right Column: Info */}
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-40 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
