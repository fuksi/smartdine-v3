import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    console.log("Checking for test admin user...");

    // First, get the location
    const location = await prisma.merchantLocation.findFirst({
      include: { merchant: true },
    });

    if (!location) {
      console.log("❌ No location found! Need to seed restaurant data first.");
      return;
    }

    console.log(
      `✓ Found location: ${location.name} (${location.merchant.name})`
    );

    // Check if admin exists
    let admin = await prisma.adminUser.findUnique({
      where: { email: "test@outlook.com" },
    });

    if (admin) {
      console.log("✓ Admin user test@outlook.com already exists");
      return;
    }

    // Create the admin user
    admin = await prisma.adminUser.create({
      data: {
        email: "test@outlook.com",
        locationId: location.id,
        isActive: true,
      },
    });

    console.log("✅ Created admin user:", admin.email);
    console.log("✅ Location:", location.name);
    console.log("✅ Merchant:", location.merchant.name);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
