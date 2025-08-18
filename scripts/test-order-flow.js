#!/usr/bin/env node

/**
 * Automated Order Flow Test
 *
 * This script tests the order API endpoints and basic flow
 * Run with: node scripts/test-order-flow.js
 */

const baseURL = "http://localhost:3000";

async function testOrderFlow() {
  console.log("🚀 Starting Order Flow Test...\n");

  try {
    // Test 1: Create a new order
    console.log("📝 Test 1: Creating order...");
    const orderData = {
      locationId: "550e8400-e29b-41d4-a716-446655440000", // Replace with actual location ID from seed
      customerName: "Test Customer",
      customerPhone: "+358 123 456 789",
      customerEmail: "test@example.com",
      totalAmount: 15.9,
      items: [
        {
          productId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", // Replace with actual product ID
          quantity: 1,
          unitPrice: 12.9,
          totalPrice: 12.9,
          options: [],
        },
      ],
    };

    const createOrderResponse = await fetch(`${baseURL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!createOrderResponse.ok) {
      throw new Error(
        `Order creation failed: ${createOrderResponse.statusText}`
      );
    }

    const orderResult = await createOrderResponse.json();
    const orderId = orderResult.order.id;
    console.log(`✅ Order created successfully: ${orderId}`);

    // Test 2: Fetch order details
    console.log("\n📋 Test 2: Fetching order details...");
    const fetchOrderResponse = await fetch(`${baseURL}/api/orders/${orderId}`);

    if (!fetchOrderResponse.ok) {
      throw new Error(`Order fetch failed: ${fetchOrderResponse.statusText}`);
    }

    const orderDetails = await fetchOrderResponse.json();
    console.log(
      `✅ Order fetched successfully. Status: ${orderDetails.order.status}`
    );

    // Test 3: Fetch orders in admin
    console.log("\n📊 Test 3: Fetching admin orders...");
    const adminOrdersResponse = await fetch(`${baseURL}/api/admin/orders`);

    if (!adminOrdersResponse.ok) {
      throw new Error(
        `Admin orders fetch failed: ${adminOrdersResponse.statusText}`
      );
    }

    const adminOrders = await adminOrdersResponse.json();
    const testOrder = adminOrders.orders.find((order) => order.id === orderId);

    if (!testOrder) {
      throw new Error("Order not found in admin list");
    }
    console.log(
      `✅ Order found in admin dashboard. Status: ${testOrder.status}`
    );

    // Test 4: Update order status (Accept order)
    console.log("\n🔄 Test 4: Updating order status to ACCEPTED...");
    const updateOrderResponse = await fetch(
      `${baseURL}/api/admin/orders/${orderId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ACCEPTED" }),
      }
    );

    if (!updateOrderResponse.ok) {
      throw new Error(`Order update failed: ${updateOrderResponse.statusText}`);
    }

    const updatedOrder = await updateOrderResponse.json();
    console.log(`✅ Order status updated to: ${updatedOrder.order.status}`);

    // Test 5: Progress through all statuses
    const statusFlow = ["PROCESSING", "READY_FOR_PICKUP", "FULFILLED"];

    for (const status of statusFlow) {
      console.log(
        `\n🔄 Test 5.${
          statusFlow.indexOf(status) + 1
        }: Updating to ${status}...`
      );

      const statusUpdateResponse = await fetch(
        `${baseURL}/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!statusUpdateResponse.ok) {
        throw new Error(`Status update to ${status} failed`);
      }

      const result = await statusUpdateResponse.json();
      console.log(`✅ Status updated to: ${result.order.status}`);
    }

    // Test 6: Verify final order state
    console.log("\n🔍 Test 6: Verifying final order state...");
    const finalOrderResponse = await fetch(`${baseURL}/api/orders/${orderId}`);
    const finalOrder = await finalOrderResponse.json();

    if (finalOrder.order.status !== "FULFILLED") {
      throw new Error(
        `Expected status FULFILLED, got ${finalOrder.order.status}`
      );
    }
    console.log(`✅ Final order state verified: ${finalOrder.order.status}`);

    console.log("\n🎉 All tests passed! Order flow is working correctly.\n");

    // Test Summary
    console.log("📊 Test Summary:");
    console.log("✅ Order creation: PASSED");
    console.log("✅ Order fetching: PASSED");
    console.log("✅ Admin dashboard: PASSED");
    console.log("✅ Status updates: PASSED");
    console.log("✅ Complete flow: PASSED");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

async function testErrorScenarios() {
  console.log("\n🧪 Testing Error Scenarios...\n");

  try {
    // Test invalid order ID
    console.log("🔍 Testing invalid order ID...");
    const invalidOrderResponse = await fetch(
      `${baseURL}/api/orders/invalid-id`
    );

    if (invalidOrderResponse.status !== 404) {
      throw new Error("Expected 404 for invalid order ID");
    }
    console.log("✅ Invalid order ID handled correctly (404)");

    // Test invalid status update
    console.log("\n🔍 Testing invalid status update...");
    // First create a valid order to test with
    const validOrder = await createTestOrder();

    const invalidStatusResponse = await fetch(
      `${baseURL}/api/admin/orders/${validOrder.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "INVALID_STATUS" }),
      }
    );

    if (invalidStatusResponse.status !== 400) {
      throw new Error("Expected 400 for invalid status");
    }
    console.log("✅ Invalid status update handled correctly (400)");

    console.log("\n✅ Error scenario tests passed!\n");
  } catch (error) {
    console.error("\n❌ Error scenario test failed:", error.message);
  }
}

async function createTestOrder() {
  const orderData = {
    locationId: "550e8400-e29b-41d4-a716-446655440000",
    customerName: "Error Test Customer",
    customerPhone: "+358 987 654 321",
    customerEmail: "errortest@example.com",
    totalAmount: 10.0,
    items: [
      {
        productId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        quantity: 1,
        unitPrice: 10.0,
        totalPrice: 10.0,
        options: [],
      },
    ],
  };

  const response = await fetch(`${baseURL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  const result = await response.json();
  return result.order;
}

// Run the tests
if (require.main === module) {
  testOrderFlow()
    .then(() => testErrorScenarios())
    .catch((error) => {
      console.error("Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testOrderFlow, testErrorScenarios };
