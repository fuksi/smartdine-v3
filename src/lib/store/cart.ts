import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
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
  customerInfo: {
    name: string;
    phone: string;
    email: string;
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
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      locationId: null,
      merchantSlug: null,
      locationSlug: null,
      customerInfo: null,

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
        });
      },

      setLocation: (locationId, merchantSlug, locationSlug) => {
        set({ locationId, merchantSlug, locationSlug });
      },

      setCustomerInfo: (info) => {
        set({ customerInfo: info });
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
    }),
    {
      name: "cart-storage",
    }
  )
);
