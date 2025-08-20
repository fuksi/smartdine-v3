import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed data for Bonbon Coffee based on typical coffee shop offerings
 * This creates a new merchant, location, and complete menu structure
 */
export async function seedBonbonCoffee() {
  try {
    console.log("☕ Starting Bonbon Coffee seed...");

    // Create or find Bonbon Coffee merchant
    let merchant = await prisma.merchant.findUnique({
      where: { slug: "bonbon-coffee" },
    });

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          name: "Bonbon Coffee",
          slug: "bonbon-coffee",
          description:
            "Premium coffee and light bites in the heart of Helsinki",
          logoUrl: null, // Will be updated with Digital Ocean URL
          isActive: true,
        },
      });
      console.log("✓ Created merchant:", merchant.name);
    } else {
      console.log("✓ Merchant already exists:", merchant.name);
    }

    // Create or find Helsinki location
    let location = await prisma.merchantLocation.findUnique({
      where: {
        merchantId_slug: {
          merchantId: merchant.id,
          slug: "helsinki-center",
        },
      },
    });

    if (!location) {
      location = await prisma.merchantLocation.create({
        data: {
          merchantId: merchant.id,
          name: "Helsinki Center",
          slug: "helsinki-center",
          address: "Aleksanterinkatu 15, 00100 Helsinki", // Typical Helsinki location
          phone: "+358 9 123 4567",
          email: "helsinki@bonboncoffee.fi",
          isActive: true,
        },
      });
      console.log("✓ Created location:", location.name);
    } else {
      console.log("✓ Location already exists:", location.name);
    }

    // Create menu
    let menu = await prisma.menu.findFirst({
      where: { locationId: location.id },
    });

    if (!menu) {
      menu = await prisma.menu.create({
        data: {
          locationId: location.id,
          name: "Bonbon Coffee Menu",
          isActive: true,
        },
      });
      console.log("✓ Created menu");
    }

    // Define categories with typical coffee shop offerings
    const categories = [
      {
        name: "Coffee & Espresso",
        description: "Premium coffee drinks and espresso-based beverages",
        sortOrder: 1,
        canShip: false,
        products: [
          {
            name: "Espresso",
            description: "Rich and bold espresso shot",
            price: 2.5,
            canShip: false,
            sortOrder: 1,
          },
          {
            name: "Americano",
            description: "Espresso with hot water",
            price: 3.5,
            canShip: false,
            sortOrder: 2,
          },
          {
            name: "Cappuccino",
            description: "Espresso with steamed milk and foam",
            price: 4.5,
            canShip: false,
            sortOrder: 3,
          },
          {
            name: "Latte",
            description: "Espresso with steamed milk",
            price: 4.8,
            canShip: false,
            sortOrder: 4,
          },
          {
            name: "Flat White",
            description: "Double espresso with steamed milk",
            price: 5.2,
            canShip: false,
            sortOrder: 5,
          },
          {
            name: "Cortado",
            description: "Espresso with equal parts warm milk",
            price: 4.8,
            canShip: false,
            sortOrder: 6,
          },
        ],
      },
      {
        name: "Specialty Drinks",
        description: "Unique coffee creations and seasonal specials",
        sortOrder: 2,
        canShip: false,
        products: [
          {
            name: "Iced Coffee",
            description: "Cold brew coffee served over ice",
            price: 4.2,
            canShip: false,
            sortOrder: 1,
          },
          {
            name: "Mocha",
            description: "Espresso with chocolate and steamed milk",
            price: 5.5,
            canShip: false,
            sortOrder: 2,
          },
          {
            name: "Caramel Macchiato",
            description: "Espresso with vanilla, steamed milk and caramel",
            price: 5.8,
            canShip: false,
            sortOrder: 3,
          },
          {
            name: "Chai Latte",
            description: "Spiced tea with steamed milk",
            price: 5.2,
            canShip: false,
            sortOrder: 4,
          },
        ],
      },
      {
        name: "Pastries & Sweets",
        description: "Fresh baked goods and sweet treats",
        sortOrder: 3,
        canShip: true,
        products: [
          {
            name: "Croissant",
            description: "Buttery, flaky French pastry",
            price: 3.5,
            canShip: true,
            sortOrder: 1,
          },
          {
            name: "Pain au Chocolat",
            description: "Croissant filled with dark chocolate",
            price: 4.2,
            canShip: true,
            sortOrder: 2,
          },
          {
            name: "Cinnamon Roll",
            description: "Soft pastry with cinnamon and sugar",
            price: 4.8,
            canShip: true,
            sortOrder: 3,
          },
          {
            name: "Blueberry Muffin",
            description: "Fresh muffin with blueberries",
            price: 4.5,
            canShip: true,
            sortOrder: 4,
          },
          {
            name: "Chocolate Brownie",
            description: "Rich chocolate brownie",
            price: 5.2,
            canShip: true,
            sortOrder: 5,
          },
        ],
      },
      {
        name: "Sandwiches & Light Meals",
        description: "Fresh sandwiches and light meal options",
        sortOrder: 4,
        canShip: true,
        products: [
          {
            name: "Avocado Toast",
            description:
              "Sourdough bread with fresh avocado, tomato, and herbs",
            price: 8.5,
            canShip: true,
            sortOrder: 1,
          },
          {
            name: "Grilled Panini",
            description: "Grilled sandwich with ham, cheese, and tomato",
            price: 9.2,
            canShip: true,
            sortOrder: 2,
          },
          {
            name: "Chicken Caesar Wrap",
            description:
              "Grilled chicken with caesar dressing in tortilla wrap",
            price: 10.5,
            canShip: true,
            sortOrder: 3,
          },
          {
            name: "Vegetarian Wrap",
            description: "Fresh vegetables and hummus in whole wheat wrap",
            price: 9.8,
            canShip: true,
            sortOrder: 4,
          },
        ],
      },
      {
        name: "Tea & Other Beverages",
        description: "Premium teas and non-coffee beverages",
        sortOrder: 5,
        canShip: false,
        products: [
          {
            name: "English Breakfast Tea",
            description: "Classic black tea blend",
            price: 3.2,
            canShip: false,
            sortOrder: 1,
          },
          {
            name: "Earl Grey Tea",
            description: "Black tea with bergamot oil",
            price: 3.5,
            canShip: false,
            sortOrder: 2,
          },
          {
            name: "Green Tea",
            description: "Delicate green tea",
            price: 3.5,
            canShip: false,
            sortOrder: 3,
          },
          {
            name: "Hot Chocolate",
            description: "Rich hot chocolate with whipped cream",
            price: 4.8,
            canShip: false,
            sortOrder: 4,
          },
          {
            name: "Fresh Orange Juice",
            description: "Freshly squeezed orange juice",
            price: 4.5,
            canShip: false,
            sortOrder: 5,
          },
        ],
      },
    ];

    // Create categories and products
    for (const categoryData of categories) {
      let category = await prisma.category.findFirst({
        where: { menuId: menu.id, name: categoryData.name },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            menuId: menu.id,
            name: categoryData.name,
            description: categoryData.description,
            sortOrder: categoryData.sortOrder,
            canShip: categoryData.canShip,
            isActive: true,
          },
        });
        console.log(`✓ Created category: ${category.name}`);
      }

      // Create products for this category
      for (const productData of categoryData.products) {
        const existingProduct = await prisma.product.findFirst({
          where: { categoryId: category.id, name: productData.name },
        });

        if (!existingProduct) {
          await prisma.product.create({
            data: {
              categoryId: category.id,
              name: productData.name,
              description: productData.description,
              price: productData.price,
              canShip: productData.canShip,
              sortOrder: productData.sortOrder,
              isAvailable: true,
            },
          });
          console.log(`  ✓ Created product: ${productData.name}`);
        }
      }
    }

    // Create product options (milk types, sizes, etc.)
    await createCoffeeOptions(menu.id);

    console.log("☕ Bonbon Coffee seed completed successfully!");
    return { merchant, location, menu };
  } catch (error) {
    console.error("❌ Error seeding Bonbon Coffee:", error);
    throw error;
  }
}

async function createCoffeeOptions(menuId: string) {
  console.log("☕ Creating coffee options...");

  // Get coffee categories and their products
  const coffeeCategories = await prisma.category.findMany({
    where: {
      menuId: menuId,
      name: { in: ["Coffee & Espresso", "Specialty Drinks"] },
    },
    include: { products: true },
  });

  // Collect all coffee products
  const coffeeProducts: Array<{ id: string; name: string }> = [];
  for (const category of coffeeCategories) {
    coffeeProducts.push(...category.products);
  }

  // Create options for each coffee product
  for (const product of coffeeProducts) {
    // Create Size option for this product
    const sizeOption = await prisma.productOption.create({
      data: {
        productId: product.id,
        name: "Size",
        description: "Choose your size",
        type: "RADIO",
        isRequired: true,
        sortOrder: 1,
      },
    });

    const sizeValues = [
      { name: "Small", priceModifier: 0, isDefault: true, sortOrder: 1 },
      { name: "Medium", priceModifier: 0.5, isDefault: false, sortOrder: 2 },
      { name: "Large", priceModifier: 1.0, isDefault: false, sortOrder: 3 },
    ];

    for (const sizeValue of sizeValues) {
      await prisma.productOptionValue.create({
        data: {
          optionId: sizeOption.id,
          ...sizeValue,
        },
      });
    }

    // Create Milk Type option for this product (if it's a milk-based drink)
    const milkBasedDrinks = [
      "Cappuccino",
      "Latte",
      "Flat White",
      "Cortado",
      "Mocha",
      "Caramel Macchiato",
      "Chai Latte",
    ];
    if (milkBasedDrinks.includes(product.name)) {
      const milkOption = await prisma.productOption.create({
        data: {
          productId: product.id,
          name: "Milk Type",
          description: "Choose your milk",
          type: "RADIO",
          isRequired: false,
          sortOrder: 2,
        },
      });

      const milkValues = [
        {
          name: "Regular Milk",
          priceModifier: 0,
          isDefault: true,
          sortOrder: 1,
        },
        {
          name: "Oat Milk",
          priceModifier: 0.6,
          isDefault: false,
          sortOrder: 2,
        },
        {
          name: "Almond Milk",
          priceModifier: 0.6,
          isDefault: false,
          sortOrder: 3,
        },
        {
          name: "Soy Milk",
          priceModifier: 0.5,
          isDefault: false,
          sortOrder: 4,
        },
        {
          name: "Lactose-Free Milk",
          priceModifier: 0.3,
          isDefault: false,
          sortOrder: 5,
        },
      ];

      for (const milkValue of milkValues) {
        await prisma.productOptionValue.create({
          data: {
            optionId: milkOption.id,
            ...milkValue,
          },
        });
      }
    }

    // Create Extra Shots option for espresso-based drinks
    const espressoBasedDrinks = [
      "Espresso",
      "Americano",
      "Cappuccino",
      "Latte",
      "Flat White",
      "Cortado",
      "Mocha",
      "Caramel Macchiato",
    ];
    if (espressoBasedDrinks.includes(product.name)) {
      const shotsOption = await prisma.productOption.create({
        data: {
          productId: product.id,
          name: "Extra Shots",
          description: "Add extra espresso shots",
          type: "RADIO",
          isRequired: false,
          sortOrder: 3,
        },
      });

      const shotValues = [
        { name: "No Extra", priceModifier: 0, isDefault: true, sortOrder: 1 },
        { name: "+1 Shot", priceModifier: 0.7, isDefault: false, sortOrder: 2 },
        {
          name: "+2 Shots",
          priceModifier: 1.4,
          isDefault: false,
          sortOrder: 3,
        },
      ];

      for (const shotValue of shotValues) {
        await prisma.productOptionValue.create({
          data: {
            optionId: shotsOption.id,
            ...shotValue,
          },
        });
      }
    }
  }

  console.log("✓ Created coffee options for all products");
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedBonbonCoffee()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
