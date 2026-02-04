'use client';

import { ProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  brand: { name: string; slug: string } | null;
  category: string;
  size: number | null;
  sizeUnit: string | null;
  packSize: number;
  prices: any[];
  lowestPrice: any | null;
}

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onFavorite?: (productId: string) => void;
  favoritedIds?: string[];
}

export function ProductGrid({
  products,
  loading = false,
  onFavorite,
  favoritedIds = [],
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onFavorite={onFavorite}
          isFavorited={favoritedIds.includes(product.id)}
        />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-24" />
        <div className="pt-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    </div>
  );
}
