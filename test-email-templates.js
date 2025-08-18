#!/usr/bin/env node

/**
 * Simple test for email templates without server dependency
 */

const {
  sendOrderAcceptedEmail,
  sendOrderRejectedEmail,
  sendOrderReadyEmail,
} = require("./src/lib/email.ts");

const mockOrderData = {
  orderId: "123e4567-e89b-12d3-a456-426614174000",
  displayId: 1234,
  customerName: "John Doe",
  customerEmail: "test@example.com",
  merchantName: "Test Restaurant",
  locationName: "Downtown Location",
  locationAddress: "123 Main St, City, Country",
  items: [
    {
      name: "Margherita Pizza",
      quantity: 1,
      price: 12.5,
      options: [
        {
          optionName: "Size",
          valueName: "Medium (30cm)",
        },
      ],
    },
    {
      name: "Coca Cola",
      quantity: 2,
      price: 2.5,
      options: [],
    },
  ],
  totalAmount: 17.5,
  status: "ACCEPTED",
  estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
};

async function testEmailTemplates() {
  console.log("🧪 Testing Email Templates");

  try {
    console.log("\n📧 Testing ACCEPTED email...");
    await sendOrderAcceptedEmail({ ...mockOrderData, status: "ACCEPTED" });
    console.log("✅ ACCEPTED email template works");

    console.log("\n📧 Testing REJECTED email...");
    await sendOrderRejectedEmail({ ...mockOrderData, status: "REJECTED" });
    console.log("✅ REJECTED email template works");

    console.log("\n📧 Testing READY_FOR_PICKUP email...");
    await sendOrderReadyEmail({ ...mockOrderData, status: "READY_FOR_PICKUP" });
    console.log("✅ READY_FOR_PICKUP email template works");

    console.log("\n🎉 All email templates are functional!");
    console.log(
      "\n⚠️  Note: Emails will only be sent if RESEND_API_KEY is configured in .env.local"
    );
  } catch (error) {
    console.error("❌ Email test failed:", error.message);

    if (error.message.includes("RESEND_API_KEY")) {
      console.log("\n💡 To enable actual email sending:");
      console.log("1. Sign up at https://resend.com");
      console.log("2. Create an API key");
      console.log("3. Add RESEND_API_KEY to your .env.local file");
      console.log("4. Add FROM_EMAIL with a verified domain");
    }
  }
}

if (require.main === module) {
  testEmailTemplates();
}

module.exports = { testEmailTemplates };
