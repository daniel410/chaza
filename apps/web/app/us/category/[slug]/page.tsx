'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductGrid } from '@/components/product/product-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { productsApi } from '@/lib/api';
import { CategoryLabels, ProductCategory } from '@chaza/shared';
import { useState } from 'react';

export default function USCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string).toUpperCase();
  
  const page = Number(searchParams.get('page')) || 1;
  const [sortBy, setSortBy] = useState('name');
  const limit = 24;

  const categoryLabel = CategoryLabels[slug as ProductCategory] || slug;
  const isValidCategory = Object.keys(CategoryLabels).includes(slug);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'category', slug, 'US', page, limit],
    queryFn: () =>
      productsApi.getAll({
        category: slug,
        region: 'US',
        page,
        limit,
      }),
    enabled: isValidCategory,
  });

  if (!isValidCategory) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header region="US" />
        <main className="flex-1 container py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Category Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The category you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild className="mt-6">
              <Link href="/us/categories">View All Categories</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const products = (data as any)?.data || [];
  const pagination = (data as any)?.pagination || { page: 1, totalPages: 1, total: 0 };

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
              <Link href="/us/categories" className="hover:text-foreground">
                Categories
              </Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-foreground">{categoryLabel}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
          <div className="container">
            <h1 className="text-3xl font-bold">{categoryLabel}</h1>
            {!isLoading && (
              <p className="text-muted-foreground mt-1">
                {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-8">
          <div className="container">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load products. Please try again.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found in this category.</p>
                <Button asChild className="mt-4">
                  <Link href="/us/categories">Browse Other Categories</Link>
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      asChild={page > 1}
                    >
                      {page > 1 ? (
                        <Link href={`/us/category/${slug.toLowerCase()}?page=${page - 1}`}>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Link>
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </>
                      )}
                    </Button>

                    <span className="text-sm text-muted-foreground px-4">
                      Page {page} of {pagination.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      asChild={page < pagination.totalPages}
                    >
                      {page < pagination.totalPages ? (
                        <Link href={`/us/category/${slug.toLowerCase()}?page=${page + 1}`}>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
