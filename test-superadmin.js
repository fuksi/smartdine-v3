#!/usr/bin/env node

const testSuperAdminLogin = async () => {
  console.log("Testing SuperAdmin Login Flow...");

  try {
    // Step 1: Request OTP
    console.log("\n1. Requesting OTP...");
    const loginResponse = await fetch(
      "http://localhost:3000/api/superadmin/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "phuc.trandt@outlook.com" }),
      }
    );

    const loginData = await loginResponse.json();
    console.log("Login response:", loginResponse.status, loginData);

    if (!loginResponse.ok) {
      console.error("Failed to request OTP");
      return;
    }

    const otpCode = loginData.code; // Development mode includes the code
    if (!otpCode) {
      console.error("No OTP code returned (this is expected in production)");
      return;
    }

    console.log(`OTP Code: ${otpCode}`);

    // Step 2: Verify OTP
    console.log("\n2. Verifying OTP...");
    const verifyResponse = await fetch(
      "http://localhost:3000/api/superadmin/verify-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "phuc.trandt@outlook.com",
          code: otpCode,
        }),
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("Verify response:", verifyResponse.status, verifyData);

    if (!verifyResponse.ok) {
      console.error("Failed to verify OTP");
      return;
    }

    const token = verifyData.token;
    console.log(`Session Token: ${token}`);

    // Step 3: Test authenticated endpoint
    console.log("\n3. Testing authenticated endpoint...");
    const meResponse = await fetch("http://localhost:3000/api/superadmin/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const meData = await meResponse.json();
    console.log("Me response:", meResponse.status, meData);

    if (meResponse.ok) {
      console.log("\n✅ SuperAdmin login flow works!");
      console.log(`Authenticated as: ${meData.email}`);
    } else {
      console.log("\n❌ Authentication failed");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testSuperAdminLogin();
