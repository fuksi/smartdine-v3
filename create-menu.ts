import { PrismaClient, ProductOptionType } from "@prisma/client";

const prisma = new PrismaClient();

async function createMenuData() {
  try {
    console.log("=== CREATING COMPLETE MENU DATA ===\n");

    // Get the location
    const location = await prisma.merchantLocation.findFirst();
    if (!location) {
      console.log("❌ No location found! Run main seed first.");
      return;
    }

    console.log(`✓ Using location: ${location.name}`);

    // Create menu
    let menu = await prisma.menu.findFirst({
      where: { locationId: location.id },
    });

    if (!menu) {
      menu = await prisma.menu.create({
        data: {
          locationId: location.id,
          name: "Main Menu",
          isActive: true,
        },
      });
      console.log("✓ Created menu:", menu.name);
    } else {
      console.log("✓ Menu already exists:", menu.name);
    }

    // Create categories
    const categories = [
      { name: "Pizza", description: "Fresh handmade pizzas", sortOrder: 1 },
      { name: "Grill", description: "Grilled specialties", sortOrder: 2 },
      { name: "Drinks", description: "Beverages and drinks", sortOrder: 3 },
    ];

    const createdCategories: Record<string, { id: string; name: string }> = {};

    for (const cat of categories) {
      let category = await prisma.category.findFirst({
        where: { menuId: menu.id, name: cat.name },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            menuId: menu.id,
            name: cat.name,
            description: cat.description,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
        console.log("✓ Created category:", category.name);
      } else {
        console.log("✓ Category already exists:", category.name);
      }

      createdCategories[cat.name] = category;
    }

    // Create products with comprehensive data
    const products = [
      // Pizza products
      {
        categoryName: "Pizza",
        name: "Margherita",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.5,
        sortOrder: 1,
        options: [
          {
            name: "Size",
            description: "Choose your pizza size",
            type: "RADIO",
            isRequired: true,
            sortOrder: 1,
            values: [
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
            ],
          },
        ],
      },
      {
        categoryName: "Pizza",
        name: "Pepperoni",
        description: "Pizza with tomato sauce, mozzarella, and pepperoni",
        price: 14.9,
        sortOrder: 2,
        options: [
          {
            name: "Size",
            description: "Choose your pizza size",
            type: "RADIO",
            isRequired: true,
            sortOrder: 1,
            values: [
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
            ],
          },
        ],
      },
      // Grill products
      {
        categoryName: "Grill",
        name: "Classic Burger",
        description: "Beef patty with lettuce, tomato, onion, and sauce",
        price: 13.5,
        sortOrder: 1,
        options: [
          {
            name: "Extras",
            description: "Add extra toppings",
            type: "MULTISELECT",
            isRequired: false,
            sortOrder: 1,
            values: [
              {
                name: "Extra cheese",
                priceModifier: 1.5,
                isDefault: false,
                sortOrder: 1,
              },
              {
                name: "Bacon",
                priceModifier: 2,
                isDefault: false,
                sortOrder: 2,
              },
              {
                name: "French fries",
                priceModifier: 3,
                isDefault: false,
                sortOrder: 3,
              },
            ],
          },
        ],
      },
      {
        categoryName: "Grill",
        name: "Premium Gourmet Burger",
        description:
          "Premium beef patty with artisan buns and gourmet toppings",
        price: 16.9,
        sortOrder: 2,
        options: [
          {
            name: "Burger Size",
            description: "Choose your burger size",
            type: "RADIO",
            isRequired: true,
            sortOrder: 1,
            values: [
              {
                name: "Regular",
                priceModifier: 0,
                isDefault: true,
                sortOrder: 1,
              },
              {
                name: "Large (+50g meat)",
                priceModifier: 3.5,
                isDefault: false,
                sortOrder: 2,
              },
              {
                name: "XL (+100g meat)",
                priceModifier: 6.0,
                isDefault: false,
                sortOrder: 3,
              },
            ],
          },
          {
            name: "Patty Type",
            description: "Select your preferred patty",
            type: "RADIO",
            isRequired: true,
            sortOrder: 2,
            values: [
              {
                name: "Beef Patty",
                priceModifier: 0,
                isDefault: true,
                sortOrder: 1,
              },
              {
                name: "Chicken Breast",
                priceModifier: -1.0,
                isDefault: false,
                sortOrder: 2,
              },
              {
                name: "Plant-Based Patty",
                priceModifier: 1.5,
                isDefault: false,
                sortOrder: 3,
              },
              {
                name: "Double Beef Patty",
                priceModifier: 5.0,
                isDefault: false,
                sortOrder: 4,
              },
            ],
          },
          {
            name: "Cheese Options",
            description: "Add cheese to your burger",
            type: "MULTISELECT",
            isRequired: false,
            sortOrder: 3,
            values: [
              {
                name: "Cheddar",
                priceModifier: 1.0,
                isDefault: false,
                sortOrder: 1,
              },
              {
                name: "Swiss",
                priceModifier: 1.5,
                isDefault: false,
                sortOrder: 2,
              },
              {
                name: "Blue Cheese",
                priceModifier: 2.0,
                isDefault: false,
                sortOrder: 3,
              },
              {
                name: "Goat Cheese",
                priceModifier: 2.5,
                isDefault: false,
                sortOrder: 4,
              },
            ],
          },
          {
            name: "Premium Toppings",
            description: "Select additional toppings",
            type: "MULTISELECT",
            isRequired: false,
            sortOrder: 4,
            values: [
              {
                name: "Crispy Bacon",
                priceModifier: 2.0,
                isDefault: false,
                sortOrder: 1,
              },
              {
                name: "Avocado",
                priceModifier: 2.5,
                isDefault: false,
                sortOrder: 2,
              },
              {
                name: "Sautéed Mushrooms",
                priceModifier: 1.5,
                isDefault: false,
                sortOrder: 3,
              },
              {
                name: "Caramelized Onions",
                priceModifier: 1.0,
                isDefault: false,
                sortOrder: 4,
              },
              {
                name: "Sun-dried Tomatoes",
                priceModifier: 1.5,
                isDefault: false,
                sortOrder: 5,
              },
              {
                name: "Arugula",
                priceModifier: 1.0,
                isDefault: false,
                sortOrder: 6,
              },
            ],
          },
          {
            name: "Cooking Preference",
            description: "How would you like your patty cooked?",
            type: "RADIO",
            isRequired: true,
            sortOrder: 5,
            values: [
              {
                name: "Medium-Rare",
                priceModifier: 0,
                isDefault: false,
                sortOrder: 1,
              },
              {
                name: "Medium",
                priceModifier: 0,
                isDefault: true,
                sortOrder: 2,
              },
              {
                name: "Medium-Well",
                priceModifier: 0,
                isDefault: false,
                sortOrder: 3,
              },
              {
                name: "Well-Done",
                priceModifier: 0,
                isDefault: false,
                sortOrder: 4,
              },
            ],
          },
        ],
      },
      {
        categoryName: "Grill",
        name: "Build Your Own Sandwich",
        description: "Create your perfect sandwich with our fresh ingredients",
        price: 8.9,
        sortOrder: 3,
        options: [],
      },
      // Drink products
      {
        categoryName: "Drinks",
        name: "Coca Cola",
        description: "Classic cola drink",
        price: 2.5,
        sortOrder: 1,
        options: [
          {
            name: "Size",
            description: "Choose drink size",
            type: "RADIO",
            isRequired: true,
            sortOrder: 1,
            values: [
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
            ],
          },
        ],
      },
    ];

    // Create all products and their options
    for (const productData of products) {
      const category = createdCategories[productData.categoryName];

      let product = await prisma.product.findFirst({
        where: { categoryId: category.id, name: productData.name },
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            categoryId: category.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            imageUrl: null,
            isAvailable: true,
            sortOrder: productData.sortOrder,
          },
        });
        console.log(`✓ Created product: ${product.name}`);
      } else {
        console.log(`✓ Product already exists: ${product.name}`);
      }

      // Create options for this product
      for (const optionData of productData.options) {
        let option = await prisma.productOption.findFirst({
          where: { productId: product.id, name: optionData.name },
        });

        if (!option) {
          option = await prisma.productOption.create({
            data: {
              productId: product.id,
              name: optionData.name,
              description: optionData.description,
              type: optionData.type as "RADIO" | "MULTISELECT",
              isRequired: optionData.isRequired,
              sortOrder: optionData.sortOrder,
            },
          });
          console.log(
            `  ✓ Created option: ${optionData.name} for ${product.name}`
          );
        } else {
          console.log(
            `  ✓ Option already exists: ${optionData.name} for ${product.name}`
          );
        }

        // Create option values
        for (const valueData of optionData.values) {
          let value = await prisma.productOptionValue.findFirst({
            where: { optionId: option.id, name: valueData.name },
          });

          if (!value) {
            value = await prisma.productOptionValue.create({
              data: {
                optionId: option.id,
                name: valueData.name,
                priceModifier: valueData.priceModifier,
                isDefault: valueData.isDefault,
                sortOrder: valueData.sortOrder,
              },
            });
            console.log(`    ✓ Created value: ${valueData.name}`);
          } else {
            console.log(`    ✓ Value already exists: ${valueData.name}`);
          }
        }
      }
    }

    console.log("\n🎉 Menu data creation completed successfully!");
  } catch (error) {
    console.error("❌ Error creating menu data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createMenuData();
