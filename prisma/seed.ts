import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create merchant
  const merchant = await prisma.merchant.create({
    data: {
      name: "Uuno Pizza",
      slug: "uuno",
      description: "Authentic Finnish pizza and grill",
      logoUrl: null,
      isActive: true,
    },
  });

  // Create location
  const location = await prisma.merchantLocation.create({
    data: {
      merchantId: merchant.id,
      name: "Uuno Jätkäsaari",
      slug: "jatkasaari",
      address: "Jätkäsaari, Helsinki, Finland",
      phone: "+358 123 456 789",
      email: "jatkasaari@uuno.fi",
      isActive: true,
    },
  });

  // Create opening hours
  const openingHoursData = [
    { day: 0, isOpen: true, open: "12:00", close: "19:00" },   // Sunday
    { day: 1, isOpen: true, open: "12:00", close: "18:00" },   // Monday
    { day: 2, isOpen: true, open: "10:00", close: "19:00" },   // Tuesday
    { day: 3, isOpen: true, open: "10:00", close: "19:00" },   // Wednesday
    { day: 4, isOpen: true, open: "10:00", close: "19:00" },   // Thursday
    { day: 5, isOpen: true, open: "10:00", close: "19:00" },   // Friday
    { day: 6, isOpen: true, open: "00:00", close: "19:00" },   // Saturday
  ];

  for (const { day, isOpen, open, close } of openingHoursData) {
    await prisma.openingHour.create({
      data: {
        locationId: location.id,
        dayOfWeek: day,
        isOpen,
        openTime: open,
        closeTime: close,
      },
    });
  }

  // Create menu
  const menu = await prisma.menu.create({
    data: {
      locationId: location.id,
      name: "Main Menu",
      isActive: true,
    },
  });

  // Create categories
  const pizzaCategory = await prisma.category.create({
    data: {
      menuId: menu.id,
      name: "Pizza",
      description: "Fresh handmade pizzas",
      sortOrder: 1,
      isActive: true,
    },
  });

  const grillCategory = await prisma.category.create({
    data: {
      menuId: menu.id,
      name: "Grill",
      description: "Grilled specialties",
      sortOrder: 2,
      isActive: true,
    },
  });

  const drinksCategory = await prisma.category.create({
    data: {
      menuId: menu.id,
      name: "Drinks",
      description: "Beverages and drinks",
      sortOrder: 3,
      isActive: true,
    },
  });

  // Create pizza products
  const margherita = await prisma.product.create({
    data: {
      categoryId: pizzaCategory.id,
      name: "Margherita",
      description: "Classic pizza with tomato sauce, mozzarella, and basil",
      price: 12.5,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 1,
    },
  });

  const pepperoni = await prisma.product.create({
    data: {
      categoryId: pizzaCategory.id,
      name: "Pepperoni",
      description: "Pizza with tomato sauce, mozzarella, and pepperoni",
      price: 14.9,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 2,
    },
  });

  // Create grill products
  const burger = await prisma.product.create({
    data: {
      categoryId: grillCategory.id,
      name: "Classic Burger",
      description: "Beef patty with lettuce, tomato, onion, and sauce",
      price: 13.5,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 1,
    },
  });

  // Create a customizable sandwich with multiple option types
  const customSandwich = await prisma.product.create({
    data: {
      categoryId: grillCategory.id,
      name: "Build Your Own Sandwich",
      description: "Create your perfect sandwich with our fresh ingredients",
      price: 8.9,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 2,
    },
  });

  // Create burger with comprehensive options
  const premiumBurger = await prisma.product.create({
    data: {
      categoryId: grillCategory.id,
      name: "Premium Gourmet Burger",
      description: "Premium beef patty with artisan buns and gourmet toppings",
      price: 16.9,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 3,
    },
  });

  // Create drink products
  const cola = await prisma.product.create({
    data: {
      categoryId: drinksCategory.id,
      name: "Coca Cola",
      description: "Classic cola drink",
      price: 2.5,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 1,
    },
  });

  // Create product options
  const pizzaSizeOption = await prisma.productOption.create({
    data: {
      productId: margherita.id,
      name: "Size",
      description: "Choose your pizza size",
      type: "RADIO",
      isRequired: true,
      sortOrder: 1,
    },
  });

  const pizzaSizeOption2 = await prisma.productOption.create({
    data: {
      productId: pepperoni.id,
      name: "Size",
      description: "Choose your pizza size",
      type: "RADIO",
      isRequired: true,
      sortOrder: 1,
    },
  });

  const burgerExtrasOption = await prisma.productOption.create({
    data: {
      productId: burger.id,
      name: "Extras",
      description: "Add extra toppings",
      type: "MULTISELECT",
      isRequired: false,
      sortOrder: 1,
    },
  });

  // Premium burger options - Multiple comprehensive option types
  const burgerSizeOption = await prisma.productOption.create({
    data: {
      productId: premiumBurger.id,
      name: "Burger Size",
      description: "Choose your burger size",
      type: "RADIO",
      isRequired: true,
      sortOrder: 1,
    },
  });

  const pattyOption = await prisma.productOption.create({
    data: {
      productId: premiumBurger.id,
      name: "Patty Type",
      description: "Select your preferred patty",
      type: "RADIO",
      isRequired: true,
      sortOrder: 2,
    },
  });

  const cheeseOption = await prisma.productOption.create({
    data: {
      productId: premiumBurger.id,
      name: "Cheese Options",
      description: "Add cheese to your burger",
      type: "MULTISELECT",
      isRequired: false,
      sortOrder: 3,
    },
  });

  const toppingsOption = await prisma.productOption.create({
    data: {
      productId: premiumBurger.id,
      name: "Premium Toppings",
      description: "Select additional toppings",
      type: "MULTISELECT",
      isRequired: false,
      sortOrder: 4,
    },
  });

  const cookingOption = await prisma.productOption.create({
    data: {
      productId: premiumBurger.id,
      name: "Cooking Preference",
      description: "How would you like your patty cooked?",
      type: "RADIO",
      isRequired: true,
      sortOrder: 5,
    },
  });

  const drinkSizeOption = await prisma.productOption.create({
    data: {
      productId: cola.id,
      name: "Size",
      description: "Choose drink size",
      type: "RADIO",
      isRequired: true,
      sortOrder: 1,
    },
  });

  // Create option values
  await prisma.productOptionValue.createMany({
    data: [
      // Pizza sizes
      {
        optionId: pizzaSizeOption.id,
        name: "Small (25cm)",
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: pizzaSizeOption.id,
        name: "Medium (30cm)",
        priceModifier: 3,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: pizzaSizeOption.id,
        name: "Large (35cm)",
        priceModifier: 6,
        isDefault: false,
        sortOrder: 3,
      },
      // Pizza sizes for pepperoni
      {
        optionId: pizzaSizeOption2.id,
        name: "Small (25cm)",
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: pizzaSizeOption2.id,
        name: "Medium (30cm)",
        priceModifier: 3,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: pizzaSizeOption2.id,
        name: "Large (35cm)",
        priceModifier: 6,
        isDefault: false,
        sortOrder: 3,
      },
      // Burger extras
      {
        optionId: burgerExtrasOption.id,
        name: "Extra cheese",
        priceModifier: 1.5,
        isDefault: false,
        sortOrder: 1,
      },
      {
        optionId: burgerExtrasOption.id,
        name: "Bacon",
        priceModifier: 2,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: burgerExtrasOption.id,
        name: "French fries",
        priceModifier: 3,
        isDefault: false,
        sortOrder: 3,
      },
      // Drink sizes
      {
        optionId: drinkSizeOption.id,
        name: "Small (0.33L)",
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: drinkSizeOption.id,
        name: "Large (0.5L)",
        priceModifier: 1,
        isDefault: false,
        sortOrder: 2,
      },

      // Premium Burger - Size options
      {
        optionId: burgerSizeOption.id,
        name: "Regular",
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: burgerSizeOption.id,
        name: "Large (+50g meat)",
        priceModifier: 3.5,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: burgerSizeOption.id,
        name: "XL (+100g meat)",
        priceModifier: 6.0,
        isDefault: false,
        sortOrder: 3,
      },

      // Premium Burger - Patty options
      {
        optionId: pattyOption.id,
        name: "Beef Patty",
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: pattyOption.id,
        name: "Chicken Breast",
        priceModifier: -1.0,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: pattyOption.id,
        name: "Plant-Based Patty",
        priceModifier: 1.5,
        isDefault: false,
        sortOrder: 3,
      },
      {
        optionId: pattyOption.id,
        name: "Double Beef Patty",
        priceModifier: 5.0,
        isDefault: false,
        sortOrder: 4,
      },

      // Premium Burger - Cheese options (multiselect)
      {
        optionId: cheeseOption.id,
        name: "Cheddar",
        priceModifier: 1.0,
        isDefault: false,
        sortOrder: 1,
      },
      {
        optionId: cheeseOption.id,
        name: "Swiss",
        priceModifier: 1.5,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: cheeseOption.id,
        name: "Blue Cheese",
        priceModifier: 2.0,
        isDefault: false,
        sortOrder: 3,
      },
      {
        optionId: cheeseOption.id,
        name: "Goat Cheese",
        priceModifier: 2.5,
        isDefault: false,
        sortOrder: 4,
      },

      // Premium Burger - Premium Toppings (multiselect)
      {
        optionId: toppingsOption.id,
        name: "Crispy Bacon",
        priceModifier: 2.0,
        isDefault: false,
        sortOrder: 1,
      },
      {
        optionId: toppingsOption.id,
        name: "Avocado",
        priceModifier: 2.5,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: toppingsOption.id,
        name: "Sautéed Mushrooms",
        priceModifier: 1.5,
        isDefault: false,
        sortOrder: 3,
      },
      {
        optionId: toppingsOption.id,
        name: "Caramelized Onions",
        priceModifier: 1.0,
        isDefault: false,
        sortOrder: 4,
      },
      {
        optionId: toppingsOption.id,
        name: "Sun-dried Tomatoes",
        priceModifier: 1.5,
        isDefault: false,
        sortOrder: 5,
      },
      {
        optionId: toppingsOption.id,
        name: "Arugula",
        priceModifier: 1.0,
        isDefault: false,
        sortOrder: 6,
      },

      // Premium Burger - Cooking preference
      {
        optionId: cookingOption.id,
        name: "Medium-Rare",
        priceModifier: 0,
        isDefault: false,
        sortOrder: 1,
      },
      {
        optionId: cookingOption.id,
        name: "Medium",
        priceModifier: 0,
        isDefault: true,
        sortOrder: 2,
      },
      {
        optionId: cookingOption.id,
        name: "Medium-Well",
        priceModifier: 0,
        isDefault: false,
        sortOrder: 3,
      },
      {
        optionId: cookingOption.id,
        name: "Well-Done",
        priceModifier: 0,
        isDefault: false,
        sortOrder: 4,
      },
    ],
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
