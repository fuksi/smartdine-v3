import { prisma } from "@/lib/db";

/**
 * Generate a unique 4-digit display ID for orders
 * Range: 1000-9999 (4-digit numbers)
 * This is for display purposes only and should not be used for identification or deep linking
 */
export async function generateOrderDisplayId(): Promise<number> {
  const maxAttempts = 50; // Prevent infinite loops
  let attempts = 0;

  while (attempts < maxAttempts) {
    // Generate random 4-digit number (1000-9999)
    const displayId = Math.floor(Math.random() * 9000) + 1000;

    try {
      // Check if this displayId already exists
      const existingOrder = await prisma.order.findUnique({
        where: { displayId },
        select: { id: true },
      });

      if (!existingOrder) {
        return displayId;
      }
    } catch (error) {
      console.error("Error checking displayId uniqueness:", error);
    }

    attempts++;
  }

  // Fallback: if we can't find a unique ID after many attempts,
  // use timestamp-based approach as fallback
  const timestamp = Date.now();
  const fallbackId = parseInt(timestamp.toString().slice(-4));

  // Ensure it's still 4 digits
  return fallbackId < 1000 ? fallbackId + 1000 : fallbackId;
}

/**
 * Format display ID for consistent presentation
 * Adds leading zeros if needed and formats nicely
 */
export function formatDisplayId(displayId: number): string {
  return displayId.toString().padStart(4, "0");
}
