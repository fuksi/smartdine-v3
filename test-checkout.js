#!/usr/bin/env node

console.log("Testing checkout API...");

const testCheckout = async () => {
  try {
    const response = await fetch("http://localhost:3002/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: "test-order-123",
        successUrl: "http://localhost:3002/your-order?id=test-order-123",
        cancelUrl: "http://localhost:3002/cart",
      }),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (response.ok) {
      console.log("✅ API call successful!");
    } else {
      console.log("❌ API call failed with status:", response.status);
    }
  } catch (error) {
    console.error("❌ Error making API call:", error.message);
  }
};

testCheckout();
