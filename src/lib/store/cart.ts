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
  // Store carts per restaurant location
  cartsByLocation: Record<
    string,
    {
      items: CartItem[];
      fulfilmentType: "PICKUP" | "SHIPPING";
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
    }
  >;
  // Current active location context
  currentLocationId: string | null;
  merchantSlug: string | null;
  locationSlug: string | null;

  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearCartForLocation: (locationId: string) => void;
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
  setFulfilmentType: (type: "PICKUP" | "SHIPPING") => void;
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

// Selector functions to get current cart data
export const getCurrentCart = (state: CartState) => {
  const { currentLocationId, cartsByLocation } = state;
  if (!currentLocationId) return null;
  return cartsByLocation[currentLocationId] || null;
};

export const getCurrentItems = (state: CartState) => {
  const currentCart = getCurrentCart(state);
  return currentCart?.items || [];
};

export const getCurrentFulfilmentType = (state: CartState) => {
  const currentCart = getCurrentCart(state);
  return currentCart?.fulfilmentType || "PICKUP";
};

export const getCurrentCustomerInfo = (state: CartState) => {
  const currentCart = getCurrentCart(state);
  return currentCart?.customerInfo || null;
};

export const getCurrentShippingAddress = (state: CartState) => {
  const currentCart = getCurrentCart(state);
  return currentCart?.shippingAddress || null;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartsByLocation: {},
      currentLocationId: null,
      merchantSlug: null,
      locationSlug: null,

      addItem: (item) => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const currentCart = state.cartsByLocation[currentLocationId] || {
            items: [],
            fulfilmentType: "PICKUP" as const,
            customerInfo: null,
            shippingAddress: null,
          };

          const existingItemIndex = currentCart.items.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              JSON.stringify(cartItem.options) === JSON.stringify(item.options)
          );

          let updatedItems;
          if (existingItemIndex >= 0) {
            updatedItems = [...currentCart.items];
            updatedItems[existingItemIndex].quantity += item.quantity;
          } else {
            updatedItems = [...currentCart.items, item];
          }

          return {
            cartsByLocation: {
              ...state.cartsByLocation,
              [currentLocationId]: {
                ...currentCart,
                items: updatedItems,
              },
            },
          };
        });
      },

      removeItem: (itemId) => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const currentCart = state.cartsByLocation[currentLocationId];
          if (!currentCart) return state;

          return {
            cartsByLocation: {
              ...state.cartsByLocation,
              [currentLocationId]: {
                ...currentCart,
                items: currentCart.items.filter((item) => item.id !== itemId),
              },
            },
          };
        });
      },

      updateQuantity: (itemId, quantity) => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const currentCart = state.cartsByLocation[currentLocationId];
          if (!currentCart) return state;

          return {
            cartsByLocation: {
              ...state.cartsByLocation,
              [currentLocationId]: {
                ...currentCart,
                items: currentCart.items
                  .map((item) =>
                    item.id === itemId ? { ...item, quantity } : item
                  )
                  .filter((item) => item.quantity > 0),
              },
            },
          };
        });
      },

      clearCart: () => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const newCartsByLocation = { ...state.cartsByLocation };
          delete newCartsByLocation[currentLocationId];

          return {
            cartsByLocation: newCartsByLocation,
          };
        });
      },

      clearCartForLocation: (locationId) => {
        set((state) => {
          const newCartsByLocation = { ...state.cartsByLocation };
          delete newCartsByLocation[locationId];

          return {
            cartsByLocation: newCartsByLocation,
          };
        });
      },

      setLocation: (locationId, merchantSlug, locationSlug) => {
        set({
          currentLocationId: locationId,
          merchantSlug,
          locationSlug,
        });
      },

      setCustomerInfo: (info) => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const currentCart = state.cartsByLocation[currentLocationId] || {
            items: [],
            fulfilmentType: "PICKUP" as const,
            customerInfo: null,
            shippingAddress: null,
          };

          return {
            cartsByLocation: {
              ...state.cartsByLocation,
              [currentLocationId]: {
                ...currentCart,
                customerInfo: info,
              },
            },
          };
        });
      },

      setFulfilmentType: (type) => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const currentCart = state.cartsByLocation[currentLocationId] || {
            items: [],
            fulfilmentType: "PICKUP" as const,
            customerInfo: null,
            shippingAddress: null,
          };

          return {
            cartsByLocation: {
              ...state.cartsByLocation,
              [currentLocationId]: {
                ...currentCart,
                fulfilmentType: type,
              },
            },
          };
        });
      },

      setShippingAddress: (address) => {
        const { currentLocationId } = get();
        if (!currentLocationId) return;

        set((state) => {
          const currentCart = state.cartsByLocation[currentLocationId] || {
            items: [],
            fulfilmentType: "PICKUP" as const,
            customerInfo: null,
            shippingAddress: null,
          };

          return {
            cartsByLocation: {
              ...state.cartsByLocation,
              [currentLocationId]: {
                ...currentCart,
                shippingAddress: address,
              },
            },
          };
        });
      },

      canAllItemsBeShipped: () => {
        const { currentLocationId, cartsByLocation } = get();
        if (!currentLocationId) return false;
        const currentCart = cartsByLocation[currentLocationId];
        if (!currentCart) return false;
        return canItemsBeShipped(currentCart.items);
      },

      getTotalPrice: () => {
        const { currentLocationId, cartsByLocation } = get();
        if (!currentLocationId) return 0;
        const currentCart = cartsByLocation[currentLocationId];
        if (!currentCart) return 0;

        return currentCart.items.reduce((total, item) => {
          const optionsPrice = item.options.reduce(
            (sum, option) => sum + option.priceModifier,
            0
          );
          return total + (item.price + optionsPrice) * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        const { currentLocationId, cartsByLocation } = get();
        if (!currentLocationId) return 0;
        const currentCart = cartsByLocation[currentLocationId];
        if (!currentCart) return 0;

        return currentCart.items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      getShippingCost: () => {
        const { currentLocationId, cartsByLocation } = get();
        if (!currentLocationId) return 0;
        const currentCart = cartsByLocation[currentLocationId];
        if (!currentCart || currentCart.fulfilmentType !== "SHIPPING") return 0;

        const subtotal = currentCart.items.reduce((total, item) => {
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
