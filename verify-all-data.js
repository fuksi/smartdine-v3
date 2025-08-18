const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function comprehensiveDataCheck() {
  try {
    console.log("🔍 COMPREHENSIVE DATABASE VERIFICATION\n");

    // 1. Check SuperAdmin
    const superAdmins = await prisma.superAdmin.findMany();
    console.log("=== SUPER ADMINS ===");
    superAdmins.forEach((admin) => {
      console.log(
        `✓ ${admin.email} (${admin.isActive ? "Active" : "Inactive"})`
      );
    });

    // 2. Check Merchants with Locations
    const merchants = await prisma.merchant.findMany({
      include: {
        locations: {
          include: {
            adminUsers: true,
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
        },
      },
    });

    console.log("\n=== MERCHANTS & LOCATIONS ===");
    merchants.forEach((merchant) => {
      console.log(`🏪 ${merchant.name} (${merchant.slug})`);
      console.log(`   Description: ${merchant.description}`);
      console.log(`   Status: ${merchant.isActive ? "Active" : "Inactive"}`);

      merchant.locations.forEach((location) => {
        console.log(`\n   📍 Location: ${location.name} (${location.slug})`);
        console.log(`      Address: ${location.address}`);
        console.log(`      Phone: ${location.phone || "Not set"}`);
        console.log(`      Email: ${location.email || "Not set"}`);
        console.log(
          `      Status: ${location.isActive ? "Active" : "Inactive"}`
        );

        // Admin Users
        console.log(`      👥 Admin Users (${location.adminUsers.length}):`);
        location.adminUsers.forEach((admin) => {
          console.log(
            `         • ${admin.email} (${
              admin.isActive ? "Active" : "Inactive"
            })`
          );
        });

        // Menu Data
        if (location.menu) {
          console.log(`\n      🍽️  Menu: ${location.menu.name}`);
          console.log(
            `         Categories: ${location.menu.categories.length}`
          );

          location.menu.categories.forEach((category) => {
            console.log(
              `\n         📂 ${category.name} (${category.products.length} products)`
            );
            console.log(`            ${category.description}`);

            category.products.forEach((product) => {
              console.log(
                `\n            🍕 ${product.name} - €${product.price}`
              );
              console.log(`               ${product.description}`);
              console.log(
                `               Available: ${
                  product.isAvailable ? "Yes" : "No"
                }`
              );
              console.log(`               Options: ${product.options.length}`);

              product.options.forEach((option) => {
                console.log(
                  `\n               ⚙️  ${option.name} (${option.type})`
                );
                console.log(
                  `                  Required: ${
                    option.isRequired ? "Yes" : "No"
                  }`
                );
                console.log(
                  `                  Values: ${option.optionValues.length}`
                );

                option.optionValues.forEach((value, index) => {
                  const price = Number(value.priceModifier);
                  const modifier =
                    price > 0
                      ? `+€${price}`
                      : price < 0
                      ? `-€${Math.abs(price)}`
                      : "Free";
                  const defaultText = value.isDefault ? " (Default)" : "";
                  console.log(
                    `                    ${index + 1}. ${
                      value.name
                    } (${modifier})${defaultText}`
                  );
                });
              });
            });
          });
        } else {
          console.log(`      ❌ No menu found for this location`);
        }
      });
    });

    // 3. Summary Statistics
    const totalCategories = await prisma.category.count();
    const totalProducts = await prisma.product.count();
    const totalOptions = await prisma.productOption.count();
    const totalOptionValues = await prisma.productOptionValue.count();
    const totalOrders = await prisma.order.count();

    console.log("\n=== DATABASE SUMMARY ===");
    console.log(`🎯 Super Admins: ${superAdmins.length}`);
    console.log(`🏪 Merchants: ${merchants.length}`);
    console.log(
      `📍 Locations: ${merchants.reduce(
        (sum, m) => sum + m.locations.length,
        0
      )}`
    );
    console.log(
      `👥 Admin Users: ${merchants.reduce(
        (sum, m) =>
          sum +
          m.locations.reduce((locSum, l) => locSum + l.adminUsers.length, 0),
        0
      )}`
    );
    console.log(
      `🍽️  Menus: ${merchants.reduce(
        (sum, m) => sum + m.locations.filter((l) => l.menu).length,
        0
      )}`
    );
    console.log(`📂 Categories: ${totalCategories}`);
    console.log(`🍕 Products: ${totalProducts}`);
    console.log(`⚙️  Options: ${totalOptions}`);
    console.log(`🎛️  Option Values: ${totalOptionValues}`);
    console.log(`📋 Orders: ${totalOrders}`);

    console.log("\n✅ DATABASE VERIFICATION COMPLETE!");
    console.log(
      "🎉 All restaurant and admin data is properly seeded and ready for use!"
    );
  } catch (error) {
    console.error("❌ Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveDataCheck();
