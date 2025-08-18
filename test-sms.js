import { sendOrderStatusSMS } from "./src/lib/sms";

// Mock order data for testing
const mockOrderData = {
  orderId: "test-order-123",
  displayId: 42,
  customerName: "Phuc Tran",
  customerPhone: "+358401234567", // Finnish number for testing
  merchantName: "Uuno Pizza",
  locationName: "Uuno Jätkäsaari",
  locationAddress: "Jätkäsaari, Helsinki, Finland",
  items: [
    {
      name: "Margherita Pizza",
      quantity: 1,
      price: 12.5,
      options: [
        {
          optionName: "Size",
          valueName: "Large",
        },
      ],
    },
    {
      name: "Coca Cola",
      quantity: 2,
      price: 2.5,
    },
  ],
  totalAmount: 17.5,
  status: "ACCEPTED", // Change this to test different statuses
  estimatedPickupTime: "Mon Dec 25 2024 18:30",
};

async function testSMS() {
  console.log("🧪 Testing SMS notifications...");

  try {
    // Test ACCEPTED status
    console.log("\n📱 Testing ACCEPTED status SMS...");
    await sendOrderStatusSMS({ ...mockOrderData, status: "ACCEPTED" });
    console.log("✅ ACCEPTED SMS sent successfully");

    // Test READY_FOR_PICKUP status
    console.log("\n📱 Testing READY_FOR_PICKUP status SMS...");
    await sendOrderStatusSMS({ ...mockOrderData, status: "READY_FOR_PICKUP" });
    console.log("✅ READY_FOR_PICKUP SMS sent successfully");

    // Test REJECTED status
    console.log("\n📱 Testing REJECTED status SMS...");
    await sendOrderStatusSMS({ ...mockOrderData, status: "REJECTED" });
    console.log("✅ REJECTED SMS sent successfully");

    // Test non-Finnish number (should be skipped)
    console.log("\n📱 Testing non-Finnish number (should be skipped)...");
    await sendOrderStatusSMS({
      ...mockOrderData,
      customerPhone: "+1234567890", // US number
      status: "ACCEPTED",
    });
    console.log("✅ Non-Finnish number test completed");

    console.log("\n🎉 All SMS tests completed successfully!");
  } catch (error) {
    console.error("❌ SMS test failed:", error);
  }
}

testSMS();
