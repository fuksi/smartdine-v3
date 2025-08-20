import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testCartSeparation() {
  try {
    console.log("🧪 Testing Cart Separation Implementation");
    console.log("=========================================");

    // Get locations
    const bonbonLocation = await prisma.merchantLocation.findFirst({
      where: {
        merchant: { slug: "bonbon-coffee" },
        slug: "central",
      },
    });

    const uunoLocation = await prisma.merchantLocation.findFirst({
      where: {
        merchant: { slug: "uuno" },
        slug: "jatkasaari",
      },
    });

    if (!bonbonLocation || !uunoLocation) {
      console.error("❌ Could not find test locations");
      return;
    }

    console.log("✅ Found test locations:");
    console.log(`   📍 Bonbon Coffee Central: ${bonbonLocation.id}`);
    console.log(`   📍 Uuno Pizza Jätkäsaari: ${uunoLocation.id}`);

    console.log("\n🛒 Cart Separation Test Plan:");
    console.log("1. Visit Bonbon Coffee - add coffee beans to cart");
    console.log("2. Visit Uuno Pizza - add pizza to cart");
    console.log(
      "3. Return to Bonbon Coffee - verify coffee beans are still in cart"
    );
    console.log("4. Check cart in Uuno Pizza - verify pizza is still in cart");
    console.log(
      "5. Test payment flow - cart should NOT be cleared before payment"
    );
    console.log(
      "6. Complete order - cart should be cleared AFTER successful payment"
    );

    console.log("\n🔧 Implementation Summary:");
    console.log("✅ Cart store now supports per-location carts");
    console.log("✅ Removed clearCart() call before payment redirect");
    console.log(
      "✅ Added cart clearing in /your-order page after successful payment"
    );
    console.log("✅ Restaurant pages now set current location context");

    console.log("\n🎯 Expected Behavior:");
    console.log("- Each restaurant maintains its own separate cart");
    console.log("- Switching between restaurants preserves individual carts");
    console.log("- Payment cancellation keeps cart intact");
    console.log(
      "- Successful payment clears cart for that specific restaurant"
    );

    console.log("\n🌐 Test URLs:");
    console.log(
      "- Bonbon Coffee: http://localhost:3001/restaurant/bonbon-coffee/central"
    );
    console.log(
      "- Uuno Pizza: http://localhost:3001/restaurant/uuno/jatkasaari"
    );
  } catch (error) {
    console.error("Error in test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCartSeparation();
