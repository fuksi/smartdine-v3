import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMenuData() {
  try {
    console.log("=== CHECKING MENU DATA ===\n");

    // Check menus
    const menus = await prisma.menu.findMany({
      include: {
        location: { include: { merchant: true } },
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
    });

    console.log(`Found ${menus.length} menu(s):`);

    menus.forEach((menu) => {
      console.log(`\n📋 Menu: ${menu.name}`);
      console.log(
        `   Location: ${menu.location.name} (${menu.location.merchant.name})`
      );
      console.log(`   Categories: ${menu.categories.length}`);

      menu.categories.forEach((category) => {
        console.log(`\n   🍽️  Category: ${category.name}`);
        console.log(`      Products: ${category.products.length}`);

        category.products.forEach((product) => {
          console.log(
            `\n      🍕 Product: ${product.name} - $${product.price}`
          );
          console.log(`         Description: ${product.description}`);
          console.log(`         Options: ${product.options.length}`);

          product.options.forEach((option) => {
            console.log(
              `\n         ⚙️  Option: ${option.name} (${option.type})`
            );
            console.log(
              `            Required: ${option.isRequired ? "Yes" : "No"}`
            );
            console.log(`            Values: ${option.optionValues.length}`);

            option.optionValues.forEach((value) => {
              const price = Number(value.priceModifier);
              const modifier =
                price > 0
                  ? `+$${price}`
                  : price < 0
                  ? `-$${Math.abs(price)}`
                  : "Free";
              console.log(`               • ${value.name} (${modifier})`);
            });
          });
        });
      });
    });

    // Summary
    const totalCategories = await prisma.category.count();
    const totalProducts = await prisma.product.count();
    const totalOptions = await prisma.productOption.count();
    const totalValues = await prisma.productOptionValue.count();

    console.log(`\n📊 SUMMARY:`);
    console.log(`   Menus: ${menus.length}`);
    console.log(`   Categories: ${totalCategories}`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Options: ${totalOptions}`);
    console.log(`   Option Values: ${totalValues}`);

    if (totalProducts === 0) {
      console.log(`\n❌ NO MENU DATA FOUND! Menu data needs to be seeded.`);
    } else {
      console.log(`\n✅ Menu data exists and looks complete!`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMenuData();
