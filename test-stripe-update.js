#!/usr/bin/env node

const testSuperAdminStripeUpdate = async () => {
  console.log("Testing SuperAdmin Stripe Connect Update...");

  try {
    // Step 1: Get OTP and login
    console.log("\n1. Logging in...");
    const loginResponse = await fetch(
      "http://localhost:3001/api/superadmin/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "phuc.trandt@outlook.com" }),
      }
    );

    if (!loginResponse.ok) {
      console.error("Login failed");
      return;
    }

    const loginData = await loginResponse.json();
    const otpCode = loginData.code;

    // Step 2: Verify OTP
    console.log("2. Verifying OTP...");
    const verifyResponse = await fetch(
      "http://localhost:3001/api/superadmin/verify-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "phuc.trandt@outlook.com",
          code: otpCode,
        }),
      }
    );

    if (!verifyResponse.ok) {
      console.error("Verification failed");
      return;
    }

    const verifyData = await verifyResponse.json();
    const token = verifyData.token;

    // Step 3: Get locations
    console.log("3. Getting locations...");
    const locationsResponse = await fetch(
      "http://localhost:3001/api/superadmin/stripe",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!locationsResponse.ok) {
      console.error("Failed to get locations");
      return;
    }

    const locationsData = await locationsResponse.json();
    console.log("Locations found:", locationsData.locations.length);

    if (locationsData.locations.length > 0) {
      const location = locationsData.locations[0];
      console.log(`Testing with location: ${location.merchant.name} - ${location.name}`);
      console.log(`Current account ID: ${location.stripeConnectAccountId || 'None'}`);
      console.log(`Current enabled status: ${location.stripeConnectEnabled}`);

      // Step 4: Test updating Stripe Connect
      console.log("4. Testing Stripe Connect update...");
      const testAccountId = "acct_test123456789";
      
      const updateResponse = await fetch(
        `http://localhost:3001/api/superadmin/stripe/${location.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            stripeConnectAccountId: testAccountId,
            stripeConnectEnabled: true,
          }),
        }
      );

      if (updateResponse.ok) {
        const updatedLocation = await updateResponse.json();
        console.log("✅ Successfully updated!");
        console.log(`New account ID: ${updatedLocation.stripeConnectAccountId}`);
        console.log(`New enabled status: ${updatedLocation.stripeConnectEnabled}`);
      } else {
        const errorData = await updateResponse.json();
        console.error("❌ Update failed:", errorData.error);
      }
    }
  } catch (error) {
    console.error("Test error:", error.message);
  }
};

testSuperAdminStripeUpdate();
