# Chaza - Price Comparison Service

A web and mobile web application for comparing prices of household items, baby products, and beverages across major retailers in the US and Canada.

## Features

- **Price Comparison**: Compare prices across Walmart, Amazon, Costco, Target, and Shoppers Drug Mart
- **Multi-Region Support**: US and Canada with region-specific pricing (USD/CAD)
- **User Accounts**: Save favorites, set price alerts, and manage shopping lists
- **Price Alerts**: Get notified when prices drop below your target
- **Price History**: Track price changes over time
- **Unit Pricing**: Compare prices per unit (per diaper, per oz, etc.)
- **Daily Updates**: Automated price scraping and updates

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + pnpm |
| **Web Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend API** | Fastify, Node.js, TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **State Management** | Zustand, React Query |
| **Authentication** | JWT |

## Project Structure

```
chaza/
├── apps/
│   ├── api/                    # Fastify backend API
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   │   ├── products.ts
│   │   │   │   ├── search.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── alerts.ts
│   │   │   │   └── retailers.ts
│   │   │   ├── scrapers/       # Retailer data scrapers
│   │   │   │   ├── walmart.ts
│   │   │   │   ├── amazon.ts
│   │   │   │   └── costco.ts
│   │   │   ├── jobs/           # Scheduled jobs
│   │   │   │   ├── price-update.ts
│   │   │   │   └── price-alerts.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── web/                    # Next.js web application
│       ├── app/                # App router pages
│       │   ├── page.tsx        # Homepage
│       │   ├── search/         # Search results
│       │   ├── product/[slug]/ # Product detail
│       │   ├── login/          # Authentication
│       │   └── register/
│       ├── components/
│       │   ├── ui/             # Base UI components
│       │   ├── layout/         # Header, Footer
│       │   ├── product/        # Product cards/grids
│       │   └── search/         # Search components
│       ├── lib/                # Utilities
│       │   ├── api.ts          # API client
│       │   ├── store.ts        # Zustand stores
│       │   └── utils.ts
│       └── package.json
│
├── packages/
│   ├── database/               # Prisma schema & client
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema
│   │   └── src/
│   │       ├── client.ts       # Prisma client
│   │       ├── index.ts
│   │       └── seed.ts         # Seed data
│   │
│   └── shared/                 # Shared types & utilities
│       └── src/
│           └── types.ts        # Shared TypeScript types
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Docker (optional, for running PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   cd ~/Workspace/projects/chaza
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment files**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. **Start PostgreSQL**
   
   Using Docker:
   ```bash
   docker run --name chaza-postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=chaza \
     -p 5432:5432 \
     -d postgres:15
   ```
   
   Or use an existing PostgreSQL instance and update `DATABASE_URL` in `apps/api/.env`.

5. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Push schema to database
   pnpm db:push
   
   # Seed with sample data
   pnpm --filter @chaza/database db:seed
   ```

6. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Web app: http://localhost:3000
   - API server: http://localhost:3001
   - API docs: http://localhost:3001/docs

## Environment Variables

### API (`apps/api/.env`)

```env
# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chaza?schema=public"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS
CORS_ORIGIN=http://localhost:3000

# Job Scheduler
ENABLE_SCHEDULER=false

# Amazon Product Advertising API (Optional)
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_TAG=

# Walmart Affiliate API (Optional)
WALMART_API_KEY=
WALMART_AFFILIATE_ID=
```

### Web (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Run linting across all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm clean` | Clean all build artifacts |

## API Endpoints

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:slug` - Get product details
- `GET /api/products/:slug/history` - Get price history
- `GET /api/products/category/:category` - List products by category

### Search
- `GET /api/search?q=query` - Search products
- `GET /api/search/suggestions?q=query` - Get autocomplete suggestions
- `GET /api/search/trending` - Get trending searches

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login
- `GET /api/users/me` - Get current user
- `PATCH /api/users/me/preferences` - Update preferences
- `GET /api/users/me/favorites` - List favorites
- `POST /api/users/me/favorites` - Add to favorites
- `DELETE /api/users/me/favorites/:productId` - Remove from favorites

### Alerts
- `GET /api/alerts` - List user's price alerts
- `POST /api/alerts` - Create price alert
- `PATCH /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Retailers
- `GET /api/retailers` - List retailers
- `GET /api/retailers/:slug` - Get retailer details
- `GET /api/retailers/:slug/products` - List retailer's products

## Database Schema

### Core Models
- **User** - User accounts with preferences
- **Product** - Products with UPC, brand, category, size info
- **Price** - Current prices per product per retailer
- **PriceHistory** - Historical price records
- **Retailer** - Retailer information and API config
- **Brand** - Product brands

### User Features
- **Favorite** - User's favorited products
- **PriceAlert** - Price drop/stock alerts
- **ShoppingList** - User shopping lists
- **SearchHistory** - Search query history

## Supported Retailers

| Retailer | Region | Data Source |
|----------|--------|-------------|
| Walmart | US, CA | API + Scraper |
| Amazon | US, CA | Product Advertising API |
| Costco | US, CA | Web Scraper |
| Target | US | Web Scraper |
| Shoppers Drug Mart | CA | Web Scraper |

## Product Categories

- **Baby**: Diapers, Formula, Baby Food, Wipes, Baby Care
- **Beverages**: Soda, Water, Juice, Sports Drinks
- **Household**: Cleaning, Paper Products, Laundry
- **Personal Care**
- **Pet**: Food, Supplies
- **Snacks**

## Deployment

### Recommended AWS Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CloudFront CDN                       │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   Amplify / Vercel  │         │   API Gateway       │
│   (Next.js Web)     │         │   + ECS Fargate     │
└─────────────────────┘         │   (Fastify API)     │
                                └──────────┬──────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
          ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
          │   RDS PostgreSQL │    │   ElastiCache   │    │   S3 Bucket     │
          └─────────────────┘    │   (Redis)       │    │   (Images)      │
                                 └─────────────────┘    └─────────────────┘
```

### Estimated Monthly Cost (Medium Scale)
- EC2/ECS: ~$150-200
- RDS PostgreSQL: ~$100-150
- ElastiCache: ~$50-100
- S3 + CloudFront: ~$30-50
- **Total: ~$400-600/month**

## Future Enhancements

- [ ] React Native mobile app
- [ ] Price prediction ML model
- [ ] Browser extension
- [ ] Barcode scanner
- [ ] Store locator with local pricing
- [ ] Community reviews
- [ ] Deal aggregation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
# chaza
# chaza
