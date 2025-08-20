import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkShipping() {
  try {
    // Get Bonbon Coffee location
    const location = await prisma.merchantLocation.findFirst({
      where: {
        merchant: { slug: "bonbon-coffee" },
        slug: "central",
      },
    });

    if (!location) {
      console.log("Bonbon Coffee location not found");
      return;
    }

    // Get products for this location
    const products = await prisma.product.findMany({
      where: {
        category: {
          menu: {
            locationId: location.id,
          },
        },
      },
      select: {
        name: true,
        canShip: true,
      },
    });

    console.log("🚚 SHIPPABLE PRODUCTS (coffee beans):");
    const shippableProducts = products.filter((p) => p.canShip);

    console.log("📦 NON-SHIPPABLE PRODUCTS (desserts, drinks, etc.):");
    const nonShippableProducts = products.filter((p) => !p.canShip);

    console.log("\n🚚 SHIPPABLE PRODUCTS (coffee beans):");
    shippableProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
    });

    console.log(
      `\n📦 NON-SHIPPABLE PRODUCTS (${nonShippableProducts.length} items):`
    );
    nonShippableProducts.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
    });

    if (nonShippableProducts.length > 10) {
      console.log(
        `... and ${
          nonShippableProducts.length - 10
        } more non-shippable products`
      );
    }

    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Shippable products: ${shippableProducts.length}`);
    console.log(`❌ Non-shippable products: ${nonShippableProducts.length}`);
    console.log(
      `📦 Total products: ${
        shippableProducts.length + nonShippableProducts.length
      }`
    );
  } catch (error) {
    console.error("Error checking shipping:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkShipping();
