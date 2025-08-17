import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create merchant
  const merchant = await prisma.merchant.create({
    data: {
      name: 'Uuno Pizza',
      slug: 'uuno',
      description: 'Authentic Finnish pizza and grill',
      logoUrl: null,
      isActive: true,
    }
  })

  // Create location
  const location = await prisma.merchantLocation.create({
    data: {
      merchantId: merchant.id,
      name: 'Uuno Jätkäsaari',
      slug: 'jatkasaari',
      address: 'Jätkäsaari, Helsinki, Finland',
      phone: '+358 123 456 789',
      email: 'jatkasaari@uuno.fi',
      isActive: true,
    }
  })

  // Create menu
  const menu = await prisma.menu.create({
    data: {
      locationId: location.id,
      name: 'Main Menu',
      isActive: true,
    }
  })

  // Create categories
  const pizzaCategory = await prisma.category.create({
    data: {
      menuId: menu.id,
      name: 'Pizza',
      description: 'Fresh handmade pizzas',
      sortOrder: 1,
      isActive: true,
    }
  })

  const grillCategory = await prisma.category.create({
    data: {
      menuId: menu.id,
      name: 'Grill',
      description: 'Grilled specialties',
      sortOrder: 2,
      isActive: true,
    }
  })

  const drinksCategory = await prisma.category.create({
    data: {
      menuId: menu.id,
      name: 'Drinks',
      description: 'Beverages and drinks',
      sortOrder: 3,
      isActive: true,
    }
  })

  // Create pizza products
  const margherita = await prisma.product.create({
    data: {
      categoryId: pizzaCategory.id,
      name: 'Margherita',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      price: 12.50,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 1,
    }
  })

  const pepperoni = await prisma.product.create({
    data: {
      categoryId: pizzaCategory.id,
      name: 'Pepperoni',
      description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
      price: 14.90,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 2,
    }
  })

  // Create grill products
  const burger = await prisma.product.create({
    data: {
      categoryId: grillCategory.id,
      name: 'Classic Burger',
      description: 'Beef patty with lettuce, tomato, onion, and sauce',
      price: 13.50,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 1,
    }
  })

  // Create drink products
  const cola = await prisma.product.create({
    data: {
      categoryId: drinksCategory.id,
      name: 'Coca Cola',
      description: 'Classic cola drink',
      price: 2.50,
      imageUrl: null,
      isAvailable: true,
      sortOrder: 1,
    }
  })

  // Create product options
  const pizzaSizeOption = await prisma.productOption.create({
    data: {
      productId: margherita.id,
      name: 'Size',
      description: 'Choose your pizza size',
      type: 'RADIO',
      isRequired: true,
      sortOrder: 1,
    }
  })

  const pizzaSizeOption2 = await prisma.productOption.create({
    data: {
      productId: pepperoni.id,
      name: 'Size',
      description: 'Choose your pizza size',
      type: 'RADIO',
      isRequired: true,
      sortOrder: 1,
    }
  })

  const burgerExtrasOption = await prisma.productOption.create({
    data: {
      productId: burger.id,
      name: 'Extras',
      description: 'Add extra toppings',
      type: 'MULTISELECT',
      isRequired: false,
      sortOrder: 1,
    }
  })

  const drinkSizeOption = await prisma.productOption.create({
    data: {
      productId: cola.id,
      name: 'Size',
      description: 'Choose drink size',
      type: 'RADIO',
      isRequired: true,
      sortOrder: 1,
    }
  })

  // Create option values
  await prisma.productOptionValue.createMany({
    data: [
      // Pizza sizes
      {
        optionId: pizzaSizeOption.id,
        name: 'Small (25cm)',
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: pizzaSizeOption.id,
        name: 'Medium (30cm)',
        priceModifier: 3,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: pizzaSizeOption.id,
        name: 'Large (35cm)',
        priceModifier: 6,
        isDefault: false,
        sortOrder: 3,
      },
      // Pizza sizes for pepperoni
      {
        optionId: pizzaSizeOption2.id,
        name: 'Small (25cm)',
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: pizzaSizeOption2.id,
        name: 'Medium (30cm)',
        priceModifier: 3,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: pizzaSizeOption2.id,
        name: 'Large (35cm)',
        priceModifier: 6,
        isDefault: false,
        sortOrder: 3,
      },
      // Burger extras
      {
        optionId: burgerExtrasOption.id,
        name: 'Extra cheese',
        priceModifier: 1.5,
        isDefault: false,
        sortOrder: 1,
      },
      {
        optionId: burgerExtrasOption.id,
        name: 'Bacon',
        priceModifier: 2,
        isDefault: false,
        sortOrder: 2,
      },
      {
        optionId: burgerExtrasOption.id,
        name: 'French fries',
        priceModifier: 3,
        isDefault: false,
        sortOrder: 3,
      },
      // Drink sizes
      {
        optionId: drinkSizeOption.id,
        name: 'Small (0.33L)',
        priceModifier: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        optionId: drinkSizeOption.id,
        name: 'Large (0.5L)',
        priceModifier: 1,
        isDefault: false,
        sortOrder: 2,
      },
    ]
  })

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
