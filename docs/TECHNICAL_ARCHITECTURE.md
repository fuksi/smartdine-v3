# SmartDine v3 - Technical Architecture

## 🏗️ System Architecture Overview

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Customer UI   │  │    Admin UI     │  │   Mobile UI     │ │
│  │   (Next.js)     │  │   (Next.js)     │  │  (Responsive)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Order API     │  │   Menu API      │  │   Auth API      │ │
│  │   (REST)        │  │   (REST)        │  │   (JWT)         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Order Service  │  │  Menu Service   │  │  Auth Service   │ │
│  │  (TypeScript)   │  │  (TypeScript)   │  │  (TypeScript)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PostgreSQL    │  │   Prisma ORM    │  │   File Storage  │ │
│  │   (Database)    │  │   (Type-safe)   │  │  (DigitalOcean) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
Customer Order Flow:
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Browse    │ → │  Customize  │ → │    Cart     │ → │   Checkout  │
│   Products  │   │   Options   │   │  Management │   │  & Payment  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
       │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Product    │   │   Option    │   │    Cart     │   │   Order     │
│  Database   │   │  Validation │   │    Store    │   │  Creation   │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

## 🛠️ Technology Stack

### Frontend Technologies

- **Framework**: Next.js 15.4.6 with App Router
- **React**: 19.1.0 (Latest stable)
- **TypeScript**: Full type coverage
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI (Accessible component library)
- **Icons**: Lucide React
- **State Management**: Zustand (Cart management)
- **Build Tool**: Turbopack (Next.js bundler)

### Backend Technologies

- **Runtime**: Node.js
- **API**: Next.js API Routes (REST)
- **Database**: PostgreSQL (Production-ready)
- **ORM**: Prisma (Type-safe database access)
- **Authentication**: JWT with custom implementation
- **File Storage**: DigitalOcean Spaces (S3-compatible)

### Payment & Communication

- **Payment Processing**: Stripe (Cards + Webhooks)
- **Email Service**: Resend (Transactional emails)
- **SMS Service**: Pushbullet (OTP delivery)
- **Phone Validation**: libphonenumber-js

### Development & DevOps

- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Database Management**: Prisma Studio
- **Version Control**: Git
- **Deployment**: Vercel-ready configuration

## 📊 Database Schema

### Core Entity Relationships

```
Merchant (Restaurant Brand)
├── MerchantLocation (Individual Stores)
│   ├── Menu
│   │   └── Category
│   │       └── Product
│   │           └── ProductOption
│   │               └── ProductOptionValue
│   ├── Order
│   │   └── OrderItem
│   │       └── OrderItemOption
│   ├── AdminUser
│   └── OpeningHour
├── AdminUser (Brand-level access)
└── StampCard (Loyalty program)
```

### Key Database Models

#### Merchant Model

```typescript
model Merchant {
  id          String             @id @default(uuid())
  name        String             // Restaurant brand name
  slug        String             @unique
  description String?
  logoUrl     String?
  isActive    Boolean            @default(true)
  locations   MerchantLocation[]
  adminUsers  AdminUser[]
}
```

#### Product Model

```typescript
model Product {
  id          String          @id @default(uuid())
  categoryId  String
  name        String
  description String?
  price       Decimal         // Precise decimal for currency
  imageUrl    String?
  isAvailable Boolean         @default(true)
  sortOrder   Int             @default(0)
  options     ProductOption[] // Customization options
  orderItems  OrderItem[]
}
```

#### Order Model

```typescript
model Order {
  id                   String      @id @default(uuid())
  displayId            Int         @unique @default(autoincrement())
  locationId           String
  customerName         String
  customerPhone        String
  customerEmail        String?
  totalAmount          Decimal
  status               OrderStatus
  paymentStatus        PaymentStatus
  paymentMethod        PaymentMethod
  fulfilmentType       FulfilmentType
  estimatedPickupTime  DateTime?
  items                OrderItem[]
}
```

## 🔧 API Architecture

### REST API Endpoints

#### Order Management

```
POST   /api/orders              - Create new order
GET    /api/orders/{id}         - Get order details
PUT    /api/orders/{id}         - Update order status
GET    /api/orders              - List orders (admin)
POST   /api/orders/cod          - Create cash order
```

#### Menu Management

```
GET    /api/menu/{locationId}        - Get menu structure
POST   /api/menu/categories          - Create category
PUT    /api/menu/categories/{id}     - Update category
DELETE /api/menu/categories/{id}     - Delete category
POST   /api/menu/products            - Create product
PUT    /api/menu/products/{id}       - Update product
DELETE /api/menu/products/{id}       - Delete product
```

#### Authentication

```
POST   /api/auth/send-otp       - Send OTP to phone
POST   /api/auth/verify-otp     - Verify OTP and login
POST   /api/auth/logout         - End session
GET    /api/auth/me             - Get current user
```

#### Payment Processing

```
POST   /api/stripe/checkout     - Create Stripe session
POST   /api/stripe/webhook      - Handle payment webhooks
GET    /api/stripe/status       - Check payment status
```

### API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Example Success Response
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "displayId": 1001,
      "status": "PLACED",
      "totalAmount": "25.50"
    }
  },
  "message": "Order created successfully"
}

// Example Error Response
{
  "success": false,
  "error": "Invalid order data",
  "message": "Phone number is required"
}
```

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── app/                     # Next.js App Router
│   ├── (customer)/         # Customer-facing pages
│   │   ├── cart/           # Shopping cart page
│   │   ├── your-order/     # Order tracking page
│   │   └── restaurant/     # Restaurant menu pages
│   ├── admin/              # Admin dashboard
│   │   ├── orders/         # Order management
│   │   ├── menu/           # Menu management
│   │   └── analytics/      # Restaurant analytics
│   └── api/                # API endpoints
├── components/             # Reusable components
│   ├── layout/            # Layout components
│   ├── ui/                # Base UI components
│   ├── product-card.tsx   # Product display
│   └── product-modal.tsx  # Product customization
└── lib/                   # Utilities and config
    ├── store/             # Zustand stores
    ├── db.ts              # Prisma client
    └── types.ts           # TypeScript definitions
```

### State Management

#### Cart Store (Zustand)

```typescript
interface CartStore {
  items: CartItem[];
  locationId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearCartForLocation: (locationId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
```

#### Local Storage Persistence

- Cart state persisted across browser sessions
- Location-specific cart isolation
- Automatic cart cleanup after successful orders

### UI Component Library

#### Base Components (Radix UI)

- **Accessible**: WCAG-compliant components
- **Customizable**: Tailwind CSS styling
- **Type-safe**: Full TypeScript support
- **Consistent**: Unified design system

#### Custom Components

- **ProductCard**: Product display with options
- **ProductModal**: Detailed product customization
- **CartButton**: Mobile and desktop cart access
- **OrderTracking**: Real-time order status

## 🔐 Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Secure session management
- **Phone Verification**: OTP-based authentication
- **Role-based Access**: Customer vs Admin permissions
- **Session Management**: 30-day expiration with refresh

### Data Protection

- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: React's built-in sanitization
- **CSRF Protection**: Next.js built-in CSRF protection

### Payment Security

- **PCI Compliance**: Stripe handles sensitive card data
- **Webhook Verification**: Signed webhook payloads
- **Secure Communication**: HTTPS enforcement
- **Payment State Management**: Secure order state tracking

## 📈 Performance Architecture

### Frontend Optimization

- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Reduced bundle sizes
- **Image Optimization**: Next.js automatic image optimization
- **Caching Strategy**: Browser and CDN caching

### Backend Optimization

- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Reduced payload sizes
- **Error Handling**: Graceful failure management

### Monitoring & Analytics

- **Performance Metrics**: Core Web Vitals tracking
- **Error Tracking**: Comprehensive error logging
- **User Analytics**: Order and usage patterns
- **Database Monitoring**: Query performance tracking

---

_Technical architecture documentation - Updated August 2025_
