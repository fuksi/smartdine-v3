import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ensures complete menu data exists for all locations
 * This should be called after the basic merchant/location/admin data is seeded
 */
export async function ensureCompleteMenuData() {
  try {
    console.log("🍽️ Ensuring complete menu data...");

    // Get all locations that don't have complete menu data
    const locations = await prisma.merchantLocation.findMany({
      include: {
        merchant: true,
        menu: {
          include: {
            categories: {
              include: {
                products: {
                  include: {
                    options: {
                      include: {
                        optionValues: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    for (const location of locations) {
      console.log(`📍 Processing location: ${location.name}`);

      // Create menu if it doesn't exist
      let menu = location.menu;
      if (!menu) {
        const newMenu = await prisma.menu.create({
          data: {
            locationId: location.id,
            name: "Main Menu",
            isActive: true,
          },
        });
        menu = { ...newMenu, categories: [] };
        console.log("  ✓ Created menu");
      }

      // Ensure we have the basic categories
      const requiredCategories = [
        { name: "Pizza", description: "Fresh handmade pizzas", sortOrder: 1 },
        { name: "Grill", description: "Grilled specialties", sortOrder: 2 },
        { name: "Drinks", description: "Beverages and drinks", sortOrder: 3 },
      ];

      const categoryMap = new Map();

      for (const catData of requiredCategories) {
        let category = await prisma.category.findFirst({
          where: { menuId: menu.id, name: catData.name },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              menuId: menu.id,
              ...catData,
              isActive: true,
            },
          });
          console.log(`    ✓ Created category: ${category.name}`);
        }

        categoryMap.set(catData.name, category);
      }

      // Ensure we have some basic products
      const basicProducts = [
        {
          category: "Pizza",
          name: "Margherita",
          description: "Classic pizza with tomato sauce, mozzarella, and basil",
          price: 12.5,
          sortOrder: 1,
        },
        {
          category: "Pizza",
          name: "Pepperoni",
          description: "Pizza with tomato sauce, mozzarella, and pepperoni",
          price: 14.9,
          sortOrder: 2,
        },
        {
          category: "Grill",
          name: "Classic Burger",
          description: "Beef patty with lettuce, tomato, onion, and sauce",
          price: 13.5,
          sortOrder: 1,
        },
        {
          category: "Drinks",
          name: "Coca Cola",
          description: "Classic cola drink",
          price: 2.5,
          sortOrder: 1,
        },
      ];

      for (const prodData of basicProducts) {
        const category = categoryMap.get(prodData.category);

        let product = await prisma.product.findFirst({
          where: { categoryId: category.id, name: prodData.name },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              categoryId: category.id,
              name: prodData.name,
              description: prodData.description,
              price: prodData.price,
              imageUrl: null,
              isAvailable: true,
              sortOrder: prodData.sortOrder,
            },
          });
          console.log(`      ✓ Created product: ${product.name}`);

          // Add basic size option for pizzas and drinks
          if (prodData.category === "Pizza" || prodData.category === "Drinks") {
            const option = await prisma.productOption.create({
              data: {
                productId: product.id,
                name: "Size",
                description: `Choose your ${prodData.category.toLowerCase()} size`,
                type: "RADIO",
                isRequired: true,
                sortOrder: 1,
              },
            });

            const sizeValues =
              prodData.category === "Pizza"
                ? [
                    {
                      name: "Small (25cm)",
                      priceModifier: 0,
                      isDefault: true,
                      sortOrder: 1,
                    },
                    {
                      name: "Medium (30cm)",
                      priceModifier: 3,
                      isDefault: false,
                      sortOrder: 2,
                    },
                    {
                      name: "Large (35cm)",
                      priceModifier: 6,
                      isDefault: false,
                      sortOrder: 3,
                    },
                  ]
                : [
                    {
                      name: "Small (0.33L)",
                      priceModifier: 0,
                      isDefault: true,
                      sortOrder: 1,
                    },
                    {
                      name: "Large (0.5L)",
                      priceModifier: 1,
                      isDefault: false,
                      sortOrder: 2,
                    },
                  ];

            await prisma.productOptionValue.createMany({
              data: sizeValues.map((v) => ({
                optionId: option.id,
                ...v,
              })),
            });

            console.log(`        ✓ Added size options`);
          }
        }
      }
    }

    console.log("✅ Menu data verification completed");
  } catch (error) {
    console.error("❌ Error ensuring menu data:", error);
    throw error;
  }
}

// Allow this to be run as a standalone script
if (require.main === module) {
  ensureCompleteMenuData()
    .then(() => {
      console.log("Menu data setup completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
