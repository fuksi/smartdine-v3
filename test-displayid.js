// Quick test script to verify displayId generation
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testDisplayId() {
  try {
    console.log("Testing displayId generation...");

    // Import the generateOrderDisplayId function
    const { generateOrderDisplayId } = require("./src/lib/order-utils.ts");

    // Generate a few display IDs
    for (let i = 0; i < 5; i++) {
      const displayId = await generateOrderDisplayId();
      console.log(`Generated displayId ${i + 1}: ${displayId}`);

      // Verify it's a 4-digit number
      if (displayId < 1000 || displayId > 9999) {
        console.error(`ERROR: displayId ${displayId} is not 4 digits!`);
      } else {
        console.log(`✓ Valid 4-digit displayId: ${displayId}`);
      }
    }

    console.log("Test completed!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDisplayId();
