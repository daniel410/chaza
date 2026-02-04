'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Bell, User, Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { RegionSelector } from './region-selector';

interface HeaderProps {
  region?: 'CA' | 'US';
}

export function Header({ region }: HeaderProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Build nav items based on region
  const regionPrefix = region ? `/${region.toLowerCase()}` : '';
  const navItems = [
    { href: `${regionPrefix || '/'}`, label: 'Home' },
    { href: `${regionPrefix}/categories`, label: 'Categories' },
    { href: `${regionPrefix || ''}/deals`, label: 'Deals' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
         {/* Logo */}
         <Link href={regionPrefix || '/'} className="mr-6 flex items-center space-x-2">
           <ShoppingCart className="h-6 w-6 text-primary" />
           <span className="hidden font-bold sm:inline-block text-xl">
             Chaza
           </span>
         </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href
                  ? 'text-foreground'
                  : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 px-4 md:px-8">
          <form action={`${regionPrefix}/search`} method="GET" className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              placeholder="Search for products..."
              className="w-full pl-10 md:max-w-md lg:max-w-lg"
            />
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <RegionSelector />

           {user ? (
             <>
               <Button variant="ghost" size="icon" asChild>
                 <Link href={`${regionPrefix}/favorites`}>
                   <Heart className="h-5 w-5" />
                   <span className="sr-only">Favorites</span>
                 </Link>
               </Button>
               <Button variant="ghost" size="icon" asChild>
                 <Link href={`${regionPrefix}/alerts`}>
                   <Bell className="h-5 w-5" />
                   <span className="sr-only">Alerts</span>
                 </Link>
               </Button>
               <Button variant="ghost" size="icon" asChild>
                 <Link href={`${regionPrefix}/account`}>
                   <User className="h-5 w-5" />
                   <span className="sr-only">Account</span>
                 </Link>
               </Button>
             </>
           ) : (
             <>
               <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                 <Link href={`${regionPrefix}/login`}>Sign In</Link>
               </Button>
               <Button size="sm" asChild>
                 <Link href={`${regionPrefix}/register`}>Sign Up</Link>
               </Button>
             </>
           )}

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
