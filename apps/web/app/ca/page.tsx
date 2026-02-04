'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart, TrendingDown, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/search/search-bar';
import { CategoryLabels, ProductCategory } from '@chaza/shared';

const popularCategories = [
  { 
    category: ProductCategory.BABY_DIAPERS, 
    icon: '👶', 
    color: 'bg-pink-100 dark:bg-pink-900/20' 
  },
  { 
    category: ProductCategory.BABY_FORMULA, 
    icon: '🍼', 
    color: 'bg-blue-100 dark:bg-blue-900/20' 
  },
  { 
    category: ProductCategory.BEVERAGES_SODA, 
    icon: '🥤', 
    color: 'bg-red-100 dark:bg-red-900/20' 
  },
  { 
    category: ProductCategory.BEVERAGES_WATER, 
    icon: '💧', 
    color: 'bg-cyan-100 dark:bg-cyan-900/20' 
  },
  { 
    category: ProductCategory.HOUSEHOLD_CLEANING, 
    icon: '🧹', 
    color: 'bg-green-100 dark:bg-green-900/20' 
  },
  { 
    category: ProductCategory.HOUSEHOLD_PAPER, 
    icon: '🧻', 
    color: 'bg-yellow-100 dark:bg-yellow-900/20' 
  },
];

const retailers = [
  { name: 'Walmart', logo: '🏪' },
  { name: 'Amazon', logo: '📦' },
  { name: 'Costco', logo: '🛒' },
  { name: 'Shoppers', logo: '💊' },
  { name: 'Well.ca', logo: '🎁' },
];

const features = [
  {
    icon: <Search className="h-8 w-8" />,
    title: 'Search & Compare',
    description: 'Find the best prices across multiple retailers with one search.',
  },
  {
    icon: <TrendingDown className="h-8 w-8" />,
    title: 'Track Price History',
    description: 'See how prices change over time and buy at the right moment.',
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: 'Price Alerts',
    description: 'Get notified when prices drop on your favorite products.',
  },
];

export default function CAHomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header region="CA" />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Compare Prices in Canada.{' '}
                <span className="text-primary">Save Money.</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Find the best deals on household items, baby products, and everyday essentials 
                across major retailers in Canada. All prices in CAD.
              </p>
              
              {/* Search Bar */}
              <div className="mt-10 max-w-xl mx-auto">
                <SearchBar large autoFocus />
              </div>

              {/* Quick Links */}
               <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                 <span className="text-sm text-muted-foreground">Popular:</span>
                 {['Pampers', 'Baby Formula', 'Coca-Cola', 'Water'].map((term) => (
                   <Link
                     key={term}
                     href={`/ca/search?q=${encodeURIComponent(term)}`}
                     className="text-sm text-primary hover:underline"
                   >
                     {term}
                   </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Retailers Section */}
        <section className="border-y bg-muted/30 py-8">
          <div className="container">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Comparing prices across top retailers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {retailers.map((retailer) => (
                <div key={retailer.name} className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-2xl">{retailer.logo}</span>
                  <span className="font-medium">{retailer.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Popular Categories</h2>
                <p className="text-muted-foreground mt-2">Browse products by category</p>
              </div>
              <Link href="/ca/categories">
                <Button variant="outline">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularCategories.map((cat) => (
                <Link key={cat.category} href={`/ca/category/${cat.category.toLowerCase()}`}>
                  <div className="rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="p-6 text-center">
                      <div className={`${cat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className="text-3xl">{cat.icon}</span>
                      </div>
                      <h3 className="font-medium text-sm">
                        {CategoryLabels[cat.category as keyof typeof CategoryLabels]}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why Use Chaza?</h2>
              <p className="text-muted-foreground mt-2">Save time and money on your regular purchases</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm text-center">
                  <div className="p-6 pt-8 pb-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="rounded-lg border shadow-sm bg-primary text-primary-foreground">
              <div className="p-6 py-12 px-8 md:px-16 text-center">
                <h2 className="text-3xl font-bold mb-4">Start Saving Today</h2>
                <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                  Create a free account to set up price alerts, save your favorite products, and never miss a deal again.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/ca/register">Create Free Account</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/ca/search">Start Comparing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
