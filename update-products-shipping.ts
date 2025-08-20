import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateProductsForShipping() {
  try {
    // Update some products to be shippable
    const updatedProducts = await prisma.product.updateMany({
      where: {
        OR: [
          { name: { contains: "Coca Cola" } },
          { name: { contains: "Build Your Own Sandwich" } },
          { name: { contains: "Premium Gourmet Burger" } },
        ],
      },
      data: {
        canShip: true,
      },
    });

    console.log(`Updated ${updatedProducts.count} products to be shippable`);

    // Show which products are now shippable
    const shippableProducts = await prisma.product.findMany({
      where: { canShip: true },
      select: { name: true, canShip: true },
    });

    console.log("Shippable products:");
    shippableProducts.forEach((product) => {
      console.log(`- ${product.name}`);
    });
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductsForShipping();
