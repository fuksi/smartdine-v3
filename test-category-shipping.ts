import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCategoryShipping() {
  try {
    console.log("Testing category shipping toggle functionality...\n");

    // Get current category state
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        canShip: true,
        products: {
          select: { name: true, canShip: true },
        },
      },
    });

    console.log("Current category shipping status:");
    categories.forEach((category) => {
      console.log(
        `📁 ${category.name}: ${
          category.canShip ? "✅ Shippable" : "❌ No Shipping"
        }`
      );
      category.products.forEach((product) => {
        console.log(
          `  📦 ${product.name}: ${
            product.canShip ? "✅ Shippable" : "❌ No Shipping"
          }`
        );
      });
      console.log("");
    });

    // Find a category to test with
    const pizzaCategory = categories.find((c) => c.name === "Pizza");
    if (pizzaCategory) {
      console.log(`Testing toggle for "${pizzaCategory.name}" category...`);
      console.log(
        `Current state: ${pizzaCategory.canShip ? "Shippable" : "No Shipping"}`
      );
      console.log("You can now test the toggle in the admin UI!");
    }
  } catch (error) {
    console.error("Error testing category shipping:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoryShipping();
