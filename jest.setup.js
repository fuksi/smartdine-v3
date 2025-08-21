const { jest } = require("@jest/globals");

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://user:password@localhost:5432/smartdinev3_test";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.NODE_ENV = "test";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
}));

// Mock Next.js dynamic imports
jest.mock("next/dynamic", () => () => {
  const DynamicComponent = () => null;
  DynamicComponent.displayName = "LoadableComponent";
  return DynamicComponent;
});

// Mock zustand stores
jest.mock("@/lib/store/cart", () => ({
  useCartStore: jest.fn(() => ({
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    getTotalPrice: jest.fn(() => 0),
    getTotalItems: jest.fn(() => 0),
  })),
}));
