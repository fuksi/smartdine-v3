const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkStripeConnect() {
  try {
    const locations = await prisma.merchantLocation.findMany({
      select: {
        name: true,
        stripeConnectAccountId: true,
        stripeConnectEnabled: true,
        stripeConnectSetupAt: true,
      },
    });

    console.log("Merchant locations with Stripe Connect data:");
    locations.forEach((location) => {
      console.log(`- ${location.name}:`);
      console.log(`  Account ID: ${location.stripeConnectAccountId || "None"}`);
      console.log(`  Enabled: ${location.stripeConnectEnabled}`);
      console.log(`  Setup At: ${location.stripeConnectSetupAt || "Not set"}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error checking Stripe Connect data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStripeConnect();
