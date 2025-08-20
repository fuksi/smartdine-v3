// Shipping utilities for Finland delivery

export const SHIPPING_CONFIG = {
  FIXED_SHIPPING_COST: 7.0, // €7 fixed shipping cost
  FREE_SHIPPING_THRESHOLD: 50.0, // Free shipping over €50
  SUPPORTED_COUNTRY: "FI", // Only Finland shipping
} as const;

export function calculateShippingCost(subtotal: number): number {
  if (subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_CONFIG.FIXED_SHIPPING_COST;
}

export function canItemsBeShipped(
  items: Array<{ canShip?: boolean }>
): boolean {
  return items.length > 0 && items.every((item) => item.canShip === true);
}

export interface ShippingCalculation {
  subtotal: number;
  shippingCost: number;
  totalWithShipping: number;
  isFreeShipping: boolean;
}

export function calculateOrderTotals(
  items: Array<{ price: number; quantity: number; canShip?: boolean }>,
  options?: Array<{ priceModifier: number; quantity: number }>
): ShippingCalculation {
  // Calculate subtotal
  let subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Add option modifiers if provided
  if (options) {
    subtotal += options.reduce((total, option) => {
      return total + option.priceModifier * option.quantity;
    }, 0);
  }

  // Calculate shipping cost
  const shippingCost = calculateShippingCost(subtotal);
  const totalWithShipping = subtotal + shippingCost;
  const isFreeShipping = shippingCost === 0;

  return {
    subtotal,
    shippingCost,
    totalWithShipping,
    isFreeShipping,
  };
}

export function isValidFinnishPostalCode(postalCode: string): boolean {
  // Finnish postal codes are 5 digits
  const cleanCode = postalCode.replace(/\s/g, "");
  return /^\d{5}$/.test(cleanCode);
}

export function validateShippingAddress(address: {
  street: string;
  postalCode: string;
  city: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!address.street.trim()) {
    errors.push("Street address is required");
  }

  if (!address.postalCode.trim()) {
    errors.push("Postal code is required");
  } else if (!isValidFinnishPostalCode(address.postalCode)) {
    errors.push("Postal code must be 5 digits");
  }

  if (!address.city.trim()) {
    errors.push("City is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
