/**
 * Format a number as Euro currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "€12.50")
 */
export function formatEuro(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

/**
 * Format a number as Euro currency with explicit sign for modifiers
 * @param amount - The amount to format
 * @returns Formatted currency string with explicit sign (e.g., "+€2.50", "-€1.00")
 */
export function formatEuroModifier(amount: number): string {
  if (amount === 0) return "€0.00";
  const sign = amount > 0 ? "+" : "";
  return `${sign}€${amount.toFixed(2)}`;
}
