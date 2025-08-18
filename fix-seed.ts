import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAndCreateData() {
  try {
    console.log("=== CHECKING DATABASE STATE ===");

    // Check merchants
    const merchants = await prisma.merchant.findMany();
    console.log(`Merchants count: ${merchants.length}`);
    merchants.forEach((m) => console.log(`  - ${m.name} (${m.slug})`));

    // Check locations
    const locations = await prisma.merchantLocation.findMany({
      include: { merchant: true },
    });
    console.log(`\nLocations count: ${locations.length}`);
    locations.forEach((l) => console.log(`  - ${l.name} (${l.merchant.name})`));

    // Check admin users
    const admins = await prisma.adminUser.findMany();
    console.log(`\nAdmin users count: ${admins.length}`);
    admins.forEach((a) => console.log(`  - ${a.email}`));

    // If no data, create it manually
    if (merchants.length === 0) {
      console.log("\n=== CREATING MISSING DATA ===");

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
      console.log("✅ Created merchant:", merchant.name);

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
      console.log("✅ Created location:", location.name);

      // Create admin user
      const admin = await prisma.adminUser.create({
        data: {
          email: "test@outlook.com",
          locationId: location.id,
          isActive: true,
        },
      });
      console.log("✅ Created admin user:", admin.email);

      console.log("\n✅ All data created successfully!");
    } else {
      console.log("\n✅ Data already exists");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateData();
