# SmartDine v3 - Multi-Restaurant Ordering Platform

A Next.js-based platform for multiple restaurants to manage their menus and process click & collect orders.

## Features

### Customer Features
- Browse multiple restaurants and locations
- View detailed menus with categories and products
- Customize products with options (radio buttons and multi-select)
- Add items to cart with quantity control
- Place orders with customer information
- Real-time cart updates

### Restaurant Admin Features
- Dashboard overview
- Order management and tracking
- Menu management (coming soon)
- Restaurant settings (coming soon)

### Platform Features
- Multi-tenant architecture (merchant -> location -> menu structure)
- Product options with price modifiers
- Order status tracking
- SQLite database for local development
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Prisma ORM with SQLite
- **UI**: RadixUI components with Tailwind CSS
- **State Management**: Zustand for cart management
- **Icons**: Lucide React icons
- **Styling**: Tailwind CSS v4

## Database Schema

```
Merchant (restaurant brand)
├── MerchantLocation (individual restaurant locations)
    └── Menu
        └── Category
            └── Product
                └── ProductOption (radio/multiselect)
                    └── ProductOptionValue

Order
├── OrderItem
    └── OrderItemOption
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Customer interface: http://localhost:3000
   - Admin interface: http://localhost:3000/admin

## Sample Data

The seed script creates:
- **Uuno Pizza** restaurant with Jätkäsaari location
- Sample menu with Pizza, Grill, and Drinks categories
- Products with various options (sizes, extras, etc.)

## API Endpoints

- `POST /api/orders` - Create new order

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/orders/        # Order API endpoint
│   ├── admin/             # Admin interface
│   ├── cart/              # Shopping cart page
│   └── restaurant/        # Restaurant menu pages
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components (Button, Card, etc.)
│   ├── product-card.tsx  # Product display component
│   └── product-modal.tsx # Product customization modal
├── lib/                  # Utilities and configurations
│   ├── store/           # Zustand stores
│   ├── db.ts            # Prisma client
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
└── prisma/              # Database schema and seed
```

## Development

### Database Commands

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data
- `npx prisma studio` - Open database browser

### Build Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Future Enhancements

- [ ] Admin menu management interface
- [ ] Order status updates and notifications
- [ ] Payment integration
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Restaurant analytics dashboard
- [ ] Inventory management
- [ ] Customer order history

## License

This project is for demonstration purposes.
