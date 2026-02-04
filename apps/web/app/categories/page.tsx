'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryGroups, CategoryLabels, ProductCategory } from '@chaza/shared';

// Category icons and colors mapping
const categoryConfig: Record<ProductCategory, { icon: string; bgColor: string }> = {
  BABY_DIAPERS: { icon: '👶', bgColor: 'bg-pink-100 dark:bg-pink-900/20' },
  BABY_FORMULA: { icon: '🍼', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
  BABY_FOOD: { icon: '🥣', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  BABY_WIPES: { icon: '🧻', bgColor: 'bg-teal-100 dark:bg-teal-900/20' },
  BABY_CARE: { icon: '🧴', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
  BEVERAGES_SODA: { icon: '🥤', bgColor: 'bg-red-100 dark:bg-red-900/20' },
  BEVERAGES_WATER: { icon: '💧', bgColor: 'bg-cyan-100 dark:bg-cyan-900/20' },
  BEVERAGES_JUICE: { icon: '🧃', bgColor: 'bg-amber-100 dark:bg-amber-900/20' },
  BEVERAGES_SPORTS: { icon: '⚡', bgColor: 'bg-lime-100 dark:bg-lime-900/20' },
  HOUSEHOLD_CLEANING: { icon: '🧹', bgColor: 'bg-green-100 dark:bg-green-900/20' },
  HOUSEHOLD_PAPER: { icon: '🧻', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' },
  HOUSEHOLD_LAUNDRY: { icon: '👕', bgColor: 'bg-indigo-100 dark:bg-indigo-900/20' },
  PERSONAL_CARE: { icon: '🪥', bgColor: 'bg-rose-100 dark:bg-rose-900/20' },
  PET_FOOD: { icon: '🐕', bgColor: 'bg-amber-100 dark:bg-amber-900/20' },
  PET_SUPPLIES: { icon: '🐾', bgColor: 'bg-emerald-100 dark:bg-emerald-900/20' },
  SNACKS: { icon: '🍿', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
  OTHER: { icon: '📦', bgColor: 'bg-gray-100 dark:bg-gray-900/20' },
};

// Group display names
const groupLabels: Record<keyof typeof CategoryGroups, { name: string; description: string }> = {
  Baby: {
    name: 'Baby & Infant',
    description: 'Diapers, formula, baby food, wipes, and baby care products',
  },
  Beverages: {
    name: 'Beverages',
    description: 'Soda, water, juice, and sports drinks',
  },
  Household: {
    name: 'Household',
    description: 'Cleaning supplies, paper products, and laundry essentials',
  },
  Personal: {
    name: 'Personal Care',
    description: 'Shampoo, toothpaste, deodorant, and skincare',
  },
  Pets: {
    name: 'Pet Supplies',
    description: 'Pet food and supplies for dogs and cats',
  },
  Other: {
    name: 'Other',
    description: 'Snacks and miscellaneous items',
  },
};

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 md:py-16">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold">All Categories</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Browse products by category and find the best prices
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container space-y-12">
            {(Object.keys(CategoryGroups) as Array<keyof typeof CategoryGroups>).map(
              (groupKey) => {
                const categories = CategoryGroups[groupKey];
                const groupInfo = groupLabels[groupKey];

                return (
                  <div key={groupKey}>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold">{groupInfo.name}</h2>
                      <p className="text-muted-foreground mt-1">{groupInfo.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {categories.map((category) => {
                        const config = categoryConfig[category];
                        const label = CategoryLabels[category];

                        return (
                          <Link
                            key={category}
                            href={`/category/${category.toLowerCase()}`}
                          >
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                              <CardContent className="p-6 text-center">
                                <div
                                  className={`${config.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                                >
                                  <span className="text-3xl">{config.icon}</span>
                                </div>
                                <h3 className="font-medium">{label}</h3>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
