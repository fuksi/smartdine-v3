#!/usr/bin/env node

/**
 * Quick Order Flow Test
 *
 * This script tests the order flow using actual seeded data
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const baseURL = "http://localhost:3000";

async function quickTest() {
  console.log("🚀 Quick Order Flow Test\n");

  try {
    // Get actual IDs from database
    console.log("📋 Getting test data from database...");

    const location = await prisma.merchantLocation.findFirst({
      where: { isActive: true },
    });

    const product = await prisma.product.findFirst({
      where: { isAvailable: true },
    });

    if (!location || !product) {
      throw new Error("No test data found. Please run: npm run db:seed");
    }

    console.log(`✅ Using location: ${location.name}`);
    console.log(`✅ Using product: ${product.name}\n`);

    // Test order creation
    console.log("📝 Creating test order...");
    const orderData = {
      locationId: location.id,
      customerName: "Test Customer",
      customerPhone: "+358 123 456 789",
      customerEmail: "test@example.com",
      totalAmount: Number(product.price),
      items: [
        {
          productId: product.id,
          quantity: 1,
          unitPrice: Number(product.price),
          totalPrice: Number(product.price),
          options: [],
        },
      ],
    };

    const createResponse = await fetch(`${baseURL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      throw new Error(`Order creation failed: ${error}`);
    }

    const orderResult = await createResponse.json();
    const orderId = orderResult.order.id;
    console.log(`✅ Order created: ${orderId}`);

    // Test order fetching
    console.log("\n📋 Testing order fetch...");
    const fetchResponse = await fetch(`${baseURL}/api/orders/${orderId}`);

    if (!fetchResponse.ok) {
      throw new Error(`Order fetch failed: ${fetchResponse.statusText}`);
    }

    const orderDetails = await fetchResponse.json();
    console.log(`✅ Order fetched. Status: ${orderDetails.order.status}`);

    // Test admin orders
    console.log("\n📊 Testing admin dashboard...");
    const adminResponse = await fetch(`${baseURL}/api/admin/orders`);

    if (!adminResponse.ok) {
      throw new Error(`Admin fetch failed: ${adminResponse.statusText}`);
    }

    const adminOrders = await adminResponse.json();
    const foundOrder = adminOrders.orders.find((o) => o.id === orderId);

    if (!foundOrder) {
      throw new Error("Order not found in admin dashboard");
    }
    console.log(`✅ Order found in admin dashboard`);

    // Test status update
    console.log("\n🔄 Testing status update...");
    const updateResponse = await fetch(
      `${baseURL}/api/admin/orders/${orderId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Status update failed: ${updateResponse.statusText}`);
    }

    const updatedOrder = await updateResponse.json();
    console.log(`✅ Status updated to: ${updatedOrder.order.status}`);

    // Verify update worked
    console.log("\n🔍 Verifying update...");
    const verifyResponse = await fetch(`${baseURL}/api/orders/${orderId}`);
    const verifiedOrder = await verifyResponse.json();

    if (verifiedOrder.order.status !== "ACCEPTED") {
      throw new Error(
        `Status not updated correctly. Expected ACCEPTED, got ${verifiedOrder.order.status}`
      );
    }
    console.log(`✅ Status update verified`);

    console.log("\n🎉 All tests PASSED! Order flow is working correctly.\n");

    console.log("📊 Test Results:");
    console.log("✅ Order Creation: PASSED");
    console.log("✅ Order Fetching: PASSED");
    console.log("✅ Admin Dashboard: PASSED");
    console.log("✅ Status Updates: PASSED");
    console.log("\n🌟 Ready for manual testing in browser!");
  } catch (error) {
    console.error("\n❌ Test FAILED:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure the dev server is running: npm run dev");
    console.log("2. Make sure the database is seeded: npm run db:seed");
    console.log("3. Check for any console errors in the browser");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
quickTest();
