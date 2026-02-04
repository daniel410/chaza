'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RegionSelectorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Select Your Region
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Choose your region to see prices and products available in your area
              </p>

              {/* Region Selection */}
              <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
                {/* USA Region */}
                <Link href="/us" className="flex-1">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">🇺🇸</div>
                      <h2 className="text-2xl font-bold mb-2">United States</h2>
                      <p className="text-muted-foreground mb-6">
                        Browse products and prices available in the USA
                      </p>
                      <Button size="lg" className="w-full">
                        Shop in USD
                      </Button>
                    </CardContent>
                  </Card>
                </Link>

                {/* Canada Region */}
                <Link href="/ca" className="flex-1">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-8 text-center">
                      <div className="text-6xl mb-4">🇨🇦</div>
                      <h2 className="text-2xl font-bold mb-2">Canada</h2>
                      <p className="text-muted-foreground mb-6">
                        Browse products and prices available in Canada
                      </p>
                      <Button size="lg" className="w-full">
                        Shop in CAD
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why Choose Chaza?</h2>
              <p className="text-muted-foreground mt-2">Compare prices and save money on everyday purchases</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-lg border bg-card p-6">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-muted-foreground">
                  Compare prices across all major retailers in your region
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Fast Search</h3>
                <p className="text-muted-foreground">
                  Find the products you need instantly with our powerful search
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold mb-2">Price Alerts</h3>
                <p className="text-muted-foreground">
                  Get notified when prices drop on your favorite products
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
