const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Get the first location
    const location = await prisma.merchantLocation.findFirst();

    if (!location) {
      console.log("No location found");
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: "test@outlook.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        email: "test@outlook.com",
        locationId: location.id,
        isActive: true,
      },
    });

    console.log("Admin user created:", adminUser);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
