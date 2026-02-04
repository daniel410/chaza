import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { href: '/categories', label: 'Categories' },
      { href: '/deals', label: 'Deals' },
      { href: '/retailers', label: 'Retailers' },
    ],
    Support: [
      { href: '/help', label: 'Help Center' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/faq', label: 'FAQ' },
    ],
    Legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
    ],
  };

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Chaza</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Compare prices across major retailers and save money on your
              everyday purchases.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Chaza. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Prices updated daily
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
