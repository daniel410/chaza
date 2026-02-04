'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/search/search-bar';
import { ProductGrid } from '@/components/product/product-grid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { searchApi } from '@/lib/api';
import { CategoryLabels, ProductCategory } from '@chaza/shared';
import { Suspense } from 'react';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'relevance';
  const region = 'CA';

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, category, sortBy, region],
    queryFn: () => searchApi.search({
      q: query,
      category: category || undefined,
      region,
      sortBy,
    }),
    enabled: !!query,
  });

  const results = data as any;

  return (
    <div className="flex min-h-screen flex-col">
      <Header region="CA" />
      
      <main className="flex-1">
        {/* Search Header */}
        <section className="border-b bg-muted/30 py-6">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <SearchBar defaultValue={query} />
            </div>
          </div>
        </section>

        <div className="container py-8">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              {query && (
                <h1 className="text-2xl font-bold">
                  Results for &quot;{query}&quot;
                </h1>
              )}
              {results?.pagination && (
                <p className="text-muted-foreground mt-1">
                  {results.pagination.total} products found
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <Select defaultValue={category}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CategoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select defaultValue={sortBy}>
                <SelectTrigger className="w-[180px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {category && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filters:</span>
              <Badge variant="secondary" className="gap-1">
                {CategoryLabels[category as ProductCategory]}
                <button className="ml-1 hover:text-foreground">&times;</button>
              </Badge>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load results</p>
              <Button variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* No Query State */}
          {!query && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Enter a search term to find products
              </p>
            </div>
          )}

          {/* Results Grid */}
          {query && (
            <ProductGrid
              products={results?.data || []}
              loading={isLoading}
            />
          )}

          {/* Pagination */}
          {results?.pagination && results.pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={results.pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 text-sm text-muted-foreground">
                  Page {results.pagination.page} of {results.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!results.pagination.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CASearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
