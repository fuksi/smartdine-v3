import { create } from "zustand";
import { persist } from "zustand/middleware";
import { canItemsBeShipped, calculateShippingCost } from "@/lib/shipping";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  canShip?: boolean;
  options: {
    optionId: string;
    optionName: string;
    valueId: string;
    valueName: string;
    priceModifier: number;
  }[];
}

interface CartState {
  items: CartItem[];
  locationId: string | null;
  merchantSlug: string | null;
  locationSlug: string | null;
  fulfilmentType: 'PICKUP' | 'SHIPPING';
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  } | null;
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
  } | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setLocation: (
    locationId: string,
    merchantSlug?: string,
    locationSlug?: string
  ) => void;
  setCustomerInfo: (info: {
    name: string;
    phone: string;
    email: string;
  }) => void;
  setFulfilmentType: (type: 'PICKUP' | 'SHIPPING') => void;
  setShippingAddress: (address: {
    street: string;
    postalCode: string;
    city: string;
  }) => void;
  canAllItemsBeShipped: () => boolean;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getShippingCost: () => number;
  getTotalWithShipping: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      locationId: null,
      merchantSlug: null,
      locationSlug: null,
      fulfilmentType: 'PICKUP' as const,
      customerInfo: null,
      shippingAddress: null,

      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              JSON.stringify(cartItem.options) === JSON.stringify(item.options)
          );

          if (existingItemIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += item.quantity;
            return { items: updatedItems };
          } else {
            return { items: [...state.items, item] };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.id === itemId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          customerInfo: null,
          locationId: null,
          merchantSlug: null,
          locationSlug: null,
          fulfilmentType: 'PICKUP',
          shippingAddress: null,
        });
      },

      setLocation: (locationId, merchantSlug, locationSlug) => {
        set({ locationId, merchantSlug, locationSlug });
      },

      setCustomerInfo: (info) => {
        set({ customerInfo: info });
      },

      setFulfilmentType: (type) => {
        set({ fulfilmentType: type });
      },

      setShippingAddress: (address) => {
        set({ shippingAddress: address });
      },

      canAllItemsBeShipped: () => {
        const items = get().items;
        return canItemsBeShipped(items);
      },

      getTotalPrice: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const optionsPrice = item.options.reduce(
            (sum, option) => sum + option.priceModifier,
            0
          );
          return total + (item.price + optionsPrice) * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getShippingCost: () => {
        const { items, fulfilmentType } = get();
        if (fulfilmentType !== 'SHIPPING') return 0;
        
        const subtotal = items.reduce((total, item) => {
          const optionsPrice = item.options.reduce(
            (sum, option) => sum + option.priceModifier,
            0
          );
          return total + (item.price + optionsPrice) * item.quantity;
        }, 0);
        
        return calculateShippingCost(subtotal);
      },

      getTotalWithShipping: () => {
        const { getTotalPrice, getShippingCost } = get();
        return getTotalPrice() + getShippingCost();
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
