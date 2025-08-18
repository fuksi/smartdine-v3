#!/usr/bin/env node

// Test script to verify email functionality
console.log("🧪 Testing Email Notification System");

const testEmailNotification = async () => {
  try {
    // Get the latest order for testing
    const ordersResponse = await fetch(
      "http://localhost:3000/api/admin/orders"
    );

    if (!ordersResponse.ok) {
      throw new Error("Failed to fetch orders");
    }

    const ordersData = await ordersResponse.json();
    const orders = ordersData.orders;

    if (!orders || orders.length === 0) {
      console.log("❌ No orders found for testing");
      return;
    }

    const testOrder = orders[0];
    console.log(`📧 Testing with Order #${testOrder.displayId}`);

    // Test all email statuses
    const statusesToTest = ["ACCEPTED", "REJECTED", "READY_FOR_PICKUP"];

    for (const status of statusesToTest) {
      console.log(`\n📤 Testing ${status} email...`);

      const response = await fetch("http://localhost:3000/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: testOrder.id,
          status: status,
          testEmail: "test@example.com", // Override email for testing
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${status} email test: ${result.message}`);
      } else {
        const error = await response.json();
        console.log(`❌ ${status} email test failed:`, error.error);
      }

      // Wait a bit between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n🎉 Email testing completed!");
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
  }
};

// Only run if executed directly
if (require.main === module) {
  testEmailNotification();
}

module.exports = { testEmailNotification };
