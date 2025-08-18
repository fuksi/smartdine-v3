const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log("Checking seeded data...\n");

    // Check merchants
    const merchants = await prisma.merchant.findMany({
      include: {
        locations: {
          include: {
            adminUsers: true,
          },
        },
      },
    });

    console.log("=== MERCHANTS ===");
    merchants.forEach((merchant) => {
      console.log(`- ${merchant.name} (slug: ${merchant.slug})`);
      console.log(`  Locations: ${merchant.locations.length}`);
      merchant.locations.forEach((location) => {
        console.log(`    - ${location.name} (${location.address})`);
        console.log(`      Admin users: ${location.adminUsers.length}`);
        location.adminUsers.forEach((admin) => {
          console.log(`        - ${admin.email} (active: ${admin.isActive})`);
        });
      });
    });

    // Check all admin users
    console.log("\n=== ALL ADMIN USERS ===");
    const allAdmins = await prisma.adminUser.findMany({
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    allAdmins.forEach((admin) => {
      console.log(`- ${admin.email} (active: ${admin.isActive})`);
      console.log(
        `  Location: ${admin.location.name} - ${admin.location.merchant.name}`
      );
    });

    // Check for the specific test admin
    console.log("\n=== SPECIFIC TEST ADMIN ===");
    const testAdmin = await prisma.adminUser.findUnique({
      where: { email: "test@outlook.com" },
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (testAdmin) {
      console.log(
        `✓ test@outlook.com exists and is ${
          testAdmin.isActive ? "active" : "inactive"
        }`
      );
      console.log(`  Location: ${testAdmin.location.name}`);
      console.log(`  Merchant: ${testAdmin.location.merchant.name}`);
    } else {
      console.log("✗ test@outlook.com NOT FOUND");
    }

    console.log("\nData check completed!");
  } catch (error) {
    console.error("Error checking data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
