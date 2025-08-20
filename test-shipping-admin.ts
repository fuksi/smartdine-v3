import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateShippingSettings() {
  try {
    console.log("Updating shipping settings for categories and products...");

    // Update all categories to enable shipping
    const categoriesResult = await prisma.category.updateMany({
      data: { canShip: true },
    });
    console.log(
      `Updated ${categoriesResult.count} categories to enable shipping`
    );

    // Update specific products to enable shipping
    const productsResult = await prisma.product.updateMany({
      where: {
        name: {
          in: [
            "Build Your Own Sandwich",
            "Premium Gourmet Burger",
            "Coca Cola",
          ],
        },
      },
      data: { canShip: true },
    });
    console.log(`Updated ${productsResult.count} products to enable shipping`);

    // Show current shipping status
    console.log("\nCurrent shipping status:");
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, canShip: true },
    });

    for (const category of categories) {
      console.log(`Category: ${category.name} - Can Ship: ${category.canShip}`);
    }

    const products = await prisma.product.findMany({
      select: { id: true, name: true, canShip: true },
      take: 10, // Just show first 10
    });

    for (const product of products) {
      console.log(`Product: ${product.name} - Can Ship: ${product.canShip}`);
    }
  } catch (error) {
    console.error("Error updating shipping settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateShippingSettings();
