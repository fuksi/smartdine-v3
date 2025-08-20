# Customer Authentication System

## Overview

SmartDine now includes a comprehensive customer authentication system using Finnish phone numbers and OTP (One-Time Password) verification via SMS.

## Features

### 🔐 **Phone Number Authentication**

- Finnish phone number validation (supports formats: `04X XXX XXXX`, `05X XXX XXXX`, `+358 4X XXX XXXX`)
- OTP-based login (no passwords required)
- SMS delivery via Pushbullet API

### 👤 **Customer Registration**

- Automatic account creation for new phone numbers
- Required: Phone number, First name
- Optional: Last name, Email address

### 🔒 **Session Management**

- 30-day session duration
- Secure token-based authentication
- Automatic session cleanup

## API Endpoints

### `POST /api/auth/send-otp`

Send OTP verification code to Finnish phone number.

**Request:**

```json
{
  "phone": "0401234567"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification code sent to your phone",
  "customerExists": false,
  "phone": "+358401234567"
}
```

### `POST /api/auth/verify-otp`

Verify OTP code and authenticate customer.

**Request (Existing Customer):**

```json
{
  "phone": "0401234567",
  "otp": "123456"
}
```

**Request (New Customer):**

```json
{
  "phone": "0401234567",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "customer": {
    "id": "uuid",
    "phone": "+358401234567",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "token": "session-token"
}
```

### `GET /api/auth/me`

Get current customer information.

**Headers:**

```
Authorization: Bearer <session-token>
```

**Response:**

```json
{
  "success": true,
  "customer": {
    "id": "uuid",
    "phone": "+358401234567",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

### `POST /api/auth/logout`

Logout customer and invalidate session.

**Headers:**

```
Authorization: Bearer <session-token>
```

## Components

### `<CustomerLogin />`

Complete login/signup flow component with:

- Phone number input with Finnish formatting
- OTP verification
- New customer registration form
- Error handling and validation

### `<CustomerAuthButton />`

Authentication button for navigation:

- Shows "Login" when not authenticated
- Shows customer name and logout when authenticated
- Opens login modal on click

### `<CustomerAuthProvider>`

React context provider for:

- Authentication state management
- Session persistence (localStorage)
- Auto-login on page refresh

## Database Schema

### Customer

```sql
model Customer {
  id          String           @id @default(uuid())
  phone       String           @unique
  firstName   String?
  lastName    String?
  email       String?
  isActive    Boolean          @default(true)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  orders      Order[]
  otpCodes    CustomerOTP[]
  sessions    CustomerSession[]
}
```

### CustomerSession

```sql
model CustomerSession {
  id         String   @id @default(uuid())
  customerId String
  token      String   @unique
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  customer   Customer @relation(fields: [customerId], references: [id])
}
```

### CustomerOTP

```sql
model CustomerOTP {
  id         String   @id @default(uuid())
  customerId String?
  phone      String
  code       String
  expiresAt  DateTime
  isUsed     Boolean  @default(false)
  createdAt  DateTime @default(now())
  customer   Customer? @relation(fields: [customerId], references: [id])
}
```

## Usage

### 1. Basic Authentication Hook

```tsx
import { useCustomerAuth } from "@/lib/auth/CustomerAuthProvider";

function MyComponent() {
  const { customer, isLoading, login, logout } = useCustomerAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!customer) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome, {customer.firstName}!<button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Login Modal

```tsx
import { CustomerLogin } from "@/components/customer-login";

function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal">
      <CustomerLogin onSuccess={onClose} />
    </div>
  );
}
```

### 3. Protected API Route

```tsx
import { getCustomerFromRequest } from "@/lib/auth/customer-auth";

export async function GET(request: NextRequest) {
  const customer = await getCustomerFromRequest(request);

  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Customer is authenticated
  return NextResponse.json({ data: "protected data" });
}
```

## Configuration

### Environment Variables

```env
# SMS Configuration (Pushbullet API for Finnish numbers only)
PUSHBULLET_API_KEY="your-pushbullet-api-key-here"
PUSHBULLET_DEVICE_ID="your-pushbullet-device-id-here"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smartdinev3"
```

### Setup

1. Configure Pushbullet API credentials
2. Run database migrations: `npx prisma db push`
3. Generate Prisma client: `npx prisma generate`
4. Wrap your app with `<CustomerAuthProvider>`

## Security Features

- ✅ Finnish phone number validation
- ✅ OTP expires in 10 minutes
- ✅ Session tokens expire in 30 days
- ✅ Automatic cleanup of expired OTPs
- ✅ Secure session token generation
- ✅ Input validation and sanitization
- ✅ Error handling without information leakage

## Integration Points

The customer authentication system integrates with:

- **Sticky Top Bar**: Shows login/logout button
- **Cart System**: Will require authentication for checkout
- **Order Management**: Links orders to authenticated customers
- **Restaurant Pages**: Available across all restaurant pages
