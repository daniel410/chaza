'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchStore, useAuthStore } from '@/lib/store';
import { searchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  type: 'product' | 'brand';
  name: string;
  slug: string;
  category?: string;
}

interface SearchBarProps {
  large?: boolean;
  autoFocus?: boolean;
  defaultValue?: string;
}

export function SearchBar({ large = false, autoFocus = false, defaultValue = '' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { region } = useAuthStore();
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    products: SearchSuggestion[];
    brands: SearchSuggestion[];
  }>({ products: [], brands: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { recentSearches, addSearch, clearHistory } = useSearchStore();

  // Detect region from URL path
  const getRegionFromPath = () => {
    if (pathname.startsWith('/ca/')) return 'CA';
    if (pathname.startsWith('/us/')) return 'US';
    return region;
  };

  const currentRegion = getRegionFromPath();
  const searchPath = pathname.startsWith('/ca/') ? '/ca/search' : pathname.startsWith('/us/') ? '/us/search' : '/search';

  // Fetch suggestions on query change
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ products: [], brands: [] });
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const data = await searchApi.getSuggestions(query) as any;
        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    addSearch(searchQuery);
    router.push(`${searchPath}?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const regionPrefix = currentRegion === 'CA' ? '/ca' : currentRegion === 'US' ? '/us' : '';
    if (suggestion.type === 'product') {
      router.push(`${regionPrefix}/product/${suggestion.slug}`);
    } else {
      router.push(`${regionPrefix}/brand/${suggestion.slug}`);
    }
    setIsOpen(false);
  };

  const showDropdown = isOpen && (
    query.length >= 2 || 
    recentSearches.length > 0
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
          large ? 'h-5 w-5' : 'h-4 w-4'
        )} />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for products, brands..."
          autoFocus={autoFocus}
          className={cn(
            'pl-10',
            large && 'h-14 text-lg',
            query && 'pr-10'
          )}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Recent Searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((search) => (
                  <button
                    key={search}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {query.length >= 2 && (
            <>
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <>
                  {/* Products */}
                  {suggestions.products.length > 0 && (
                    <div className="p-3 border-b">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Products
                      </span>
                      <div className="mt-2 space-y-1">
                        {suggestions.products.map((product) => (
                          <button
                            key={product.slug}
                            onClick={() => handleSuggestionClick(product)}
                            className="block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                          >
                            {product.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands */}
                  {suggestions.brands.length > 0 && (
                    <div className="p-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Brands
                      </span>
                      <div className="mt-2 space-y-1">
                        {suggestions.brands.map((brand) => (
                          <button
                            key={brand.slug}
                            onClick={() => handleSuggestionClick(brand)}
                            className="block w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                          >
                            {brand.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {suggestions.products.length === 0 && suggestions.brands.length === 0 && (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        No results for &quot;{query}&quot;
                      </p>
                      <button
                        onClick={() => handleSearch(query)}
                        className="text-sm text-primary hover:underline mt-2"
                      >
                        Search anyway
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
