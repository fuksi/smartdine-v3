import { useCartStore } from "@/lib/store/cart";

// Mock the persist middleware to avoid localStorage issues in tests
jest.mock("zustand/middleware", () => ({
  persist: (fn: unknown) => fn,
  subscribeWithSelector: (fn: unknown) => fn,
}));

describe("Cart Store - Merchant Based Architecture", () => {
  beforeEach(() => {
    // Reset the store before each test
    useCartStore.getState().clearCart();
  });

  test("should initialize with empty cart", () => {
    const state = useCartStore.getState();

    expect(state.cartsByMerchant).toEqual({});
    expect(state.currentMerchantId).toBeNull();
    expect(state.merchantSlug).toBeNull();
  });

  test("should set merchant context", () => {
    const { setLocation } = useCartStore.getState();

    setLocation("merchant-123", "uuno-pizza");

    const state = useCartStore.getState();
    expect(state.currentMerchantId).toBe("merchant-123");
    expect(state.merchantSlug).toBe("uuno-pizza");
  });

  test("should add item to merchant cart", () => {
    const { setLocation, addItem } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Add item
    const testItem = {
      id: "item-1",
      productId: "product-1",
      name: "Margherita Pizza",
      price: 12.5,
      quantity: 1,
      options: [],
    };

    addItem(testItem);

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"]).toBeDefined();
    expect(state.cartsByMerchant["merchant-123"].items).toHaveLength(1);
    expect(state.cartsByMerchant["merchant-123"].items[0]).toEqual(testItem);
  });

  test("should update item quantity", () => {
    const { setLocation, addItem, updateQuantity } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Add item
    const testItem = {
      id: "item-1",
      productId: "product-1",
      name: "Margherita Pizza",
      price: 12.5,
      quantity: 1,
      options: [],
    };

    addItem(testItem);
    updateQuantity("item-1", 3);

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"].items[0].quantity).toBe(3);
  });

  test("should remove item from cart", () => {
    const { setLocation, addItem, removeItem } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Add item
    const testItem = {
      id: "item-1",
      productId: "product-1",
      name: "Margherita Pizza",
      price: 12.5,
      quantity: 1,
      options: [],
    };

    addItem(testItem);
    removeItem("item-1");

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"].items).toHaveLength(0);
  });

  test("should calculate total price correctly", () => {
    const { setLocation, addItem, getTotalPrice } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Add items
    addItem({
      id: "item-1",
      productId: "product-1",
      name: "Margherita Pizza",
      price: 12.5,
      quantity: 2,
      options: [],
    });

    addItem({
      id: "item-2",
      productId: "product-2",
      name: "Pepperoni Pizza",
      price: 14.5,
      quantity: 1,
      options: [],
    });

    const total = getTotalPrice();
    expect(total).toBe(39.5); // (12.50 * 2) + (14.50 * 1)
  });

  test("should set customer information", () => {
    const { setLocation, setCustomerInfo } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Set customer info
    const customerInfo = {
      name: "John Doe",
      phone: "+358401234567",
      email: "john@example.com",
    };

    setCustomerInfo(customerInfo);

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"].customerInfo).toEqual(
      customerInfo
    );
  });

  test("should set fulfillment type", () => {
    const { setLocation, setFulfilmentType } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Set fulfillment type
    setFulfilmentType("SHIPPING");

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"].fulfilmentType).toBe(
      "SHIPPING"
    );
  });

  test("should set shipping address", () => {
    const { setLocation, setShippingAddress } = useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Set shipping address
    const address = {
      street: "123 Test Street",
      postalCode: "00100",
      city: "Helsinki",
    };

    setShippingAddress(address);

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"].shippingAddress).toEqual(
      address
    );
  });

  test("should clear cart for specific merchant", () => {
    const { setLocation, addItem, clearCartForMerchant } =
      useCartStore.getState();

    // Add items to two different merchants
    setLocation("merchant-123", "uuno-pizza");
    addItem({
      id: "item-1",
      productId: "product-1",
      name: "Margherita Pizza",
      price: 12.5,
      quantity: 1,
      options: [],
    });

    setLocation("merchant-456", "another-restaurant");
    addItem({
      id: "item-2",
      productId: "product-2",
      name: "Burger",
      price: 10.0,
      quantity: 1,
      options: [],
    });

    // Clear cart for first merchant only
    clearCartForMerchant("merchant-123");

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"]).toBeUndefined();
    expect(state.cartsByMerchant["merchant-456"]).toBeDefined();
    expect(state.cartsByMerchant["merchant-456"].items).toHaveLength(1);
  });

  test("should handle backward compatibility with clearCartForLocation", () => {
    const { setLocation, addItem, clearCartForLocation } =
      useCartStore.getState();

    // Set merchant context
    setLocation("merchant-123", "uuno-pizza");

    // Add item
    addItem({
      id: "item-1",
      productId: "product-1",
      name: "Margherita Pizza",
      price: 12.5,
      quantity: 1,
      options: [],
    });

    // Clear using the backward compatibility method
    clearCartForLocation("merchant-123");

    const state = useCartStore.getState();
    expect(state.cartsByMerchant["merchant-123"]).toBeUndefined();
  });
});
