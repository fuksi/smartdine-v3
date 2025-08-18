import { stripe } from "./config";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Create a Stripe Connect account for a restaurant location
 */
export async function createConnectAccount(
  locationId: string,
  email: string,
  businessName: string
) {
  try {
    const account = await stripe.accounts.create({
      type: "standard",
      email,
      business_profile: {
        name: businessName,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Update location with Stripe account ID
    await prisma.merchantLocation.update({
      where: { id: locationId },
      data: {
        stripeConnectAccountId: account.id,
        stripeConnectSetupAt: new Date(),
      },
    });

    return account;
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    throw new Error("Failed to create Stripe Connect account");
  }
}

/**
 * Create an account link for Stripe Connect onboarding
 */
export async function createConnectAccountLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: "account_onboarding",
    });

    return accountLink;
  } catch (error) {
    console.error("Error creating account link:", error);
    throw new Error("Failed to create account link");
  }
}

/**
 * Check if a Connect account is enabled for payments
 */
export async function checkConnectAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    const isEnabled = account.charges_enabled && account.payouts_enabled;

    if (isEnabled) {
      // Update the location to mark Connect as enabled
      await prisma.merchantLocation.updateMany({
        where: { stripeConnectAccountId: accountId },
        data: { stripeConnectEnabled: true },
      });
    }

    return {
      isEnabled,
      requiresAction: (account.requirements?.currently_due?.length ?? 0) > 0,
      requirements: account.requirements,
    };
  } catch (error) {
    console.error("Error checking account status:", error);
    throw new Error("Failed to check account status");
  }
}

/**
 * Create a checkout session with payment authorization (not capture)
 */
export async function createCheckoutSession({
  orderId,
  locationId,
  items,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  locationId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number; // in cents
  }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  console.log("🎯 === CREATING CHECKOUT SESSION ===");
  console.log("📊 Input Parameters:");
  console.log(`   Order ID: ${orderId}`);
  console.log(`   Location ID: ${locationId}`);
  console.log(`   Items count: ${items.length}`);
  console.log(`   Customer Email: ${customerEmail || "Not provided"}`);
  console.log(`   Success URL: ${successUrl}`);
  console.log(`   Cancel URL: ${cancelUrl}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(
    `   Development mode: ${
      process.env.NODE_ENV === "development" ? "YES" : "NO"
    }`
  );

  // Validate input parameters
  console.log("🔍 Validating input parameters...");
  if (!orderId) {
    console.error("❌ VALIDATION ERROR: orderId is required");
    throw new Error("Order ID is required");
  }
  if (!locationId) {
    console.error("❌ VALIDATION ERROR: locationId is required");
    throw new Error("Location ID is required");
  }
  if (!items || items.length === 0) {
    console.error(
      "❌ VALIDATION ERROR: items array is required and must not be empty"
    );
    throw new Error("Items are required");
  }
  if (!successUrl) {
    console.error("❌ VALIDATION ERROR: successUrl is required");
    throw new Error("Success URL is required");
  }
  if (!cancelUrl) {
    console.error("❌ VALIDATION ERROR: cancelUrl is required");
    throw new Error("Cancel URL is required");
  }
  console.log("✅ All input parameters are valid");

  try {
    // In development mode, create a direct payment without Connect requirements
    if (process.env.NODE_ENV === "development") {
      console.log(
        "🚧 Development mode detected: Creating direct payment session"
      );
      console.log("⚠️  Skipping Stripe Connect requirements for development");
      return createDevelopmentCheckoutSession({
        orderId,
        items,
        customerEmail,
        successUrl,
        cancelUrl,
      });
    }

    console.log("🏭 Production mode: Using Stripe Connect");

    // Get the location with Stripe account
    console.log("🔍 Fetching location data from database...");
    const location = await prisma.merchantLocation.findUnique({
      where: { id: locationId },
      include: { merchant: true },
    });

    console.log("📋 Location query result:");
    if (!location) {
      console.error("❌ DATABASE ERROR: Location not found:", locationId);
      throw new Error(`Location not found: ${locationId}`);
    }

    console.log("✅ Location found:", {
      id: location.id,
      name: location.name,
      merchantName: location.merchant.name,
      stripeConnectAccountId: location.stripeConnectAccountId || "❌ NOT SET",
      stripeConnectEnabled: location.stripeConnectEnabled || false,
    });

    if (!location.stripeConnectAccountId) {
      console.error(
        "❌ STRIPE CONNECT ERROR: Restaurant has not set up Stripe Connect"
      );
      console.error("Location details:", {
        id: location.id,
        name: location.name,
        stripeConnectAccountId: location.stripeConnectAccountId,
      });
      throw new Error("Restaurant has not set up Stripe Connect");
    }

    if (!location.stripeConnectEnabled) {
      console.error(
        "❌ STRIPE CONNECT ERROR: Restaurant Stripe account is not fully set up"
      );
      console.error("Location details:", {
        id: location.id,
        name: location.name,
        stripeConnectEnabled: location.stripeConnectEnabled,
        stripeConnectSetupAt: location.stripeConnectSetupAt,
      });
      throw new Error("Restaurant Stripe account is not fully set up");
    }

    console.log("✅ Stripe Connect validation passed");
    console.log("💳 Using Connect account:", location.stripeConnectAccountId);

    // Calculate application fee (e.g., 3% platform fee)
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const applicationFee = Math.round(totalAmount * 0.03); // 3% platform fee

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "eur", // Change to your currency
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        orderId,
        locationId,
      },
      payment_intent_data: {
        capture_method: "manual", // Don't capture immediately
        application_fee_amount: applicationFee,
        on_behalf_of: location.stripeConnectAccountId,
        transfer_data: {
          destination: location.stripeConnectAccountId,
        },
      },
    });

    // Update order with checkout session ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stripeCheckoutSessionId: session.id,
        paymentAmount: new Prisma.Decimal(totalAmount / 100), // Convert cents to euros
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Failed to create checkout session");
  }
}

/**
 * Capture a payment (when order is accepted)
 */
export async function capturePayment(
  paymentIntentId: string,
  amountToCapture?: number
) {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture,
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error capturing payment:", error);
    throw new Error("Failed to capture payment");
  }
}

/**
 * Cancel a payment (when order is rejected)
 */
export async function cancelPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error("Error canceling payment:", error);
    throw new Error("Failed to cancel payment");
  }
}

/**
 * Refund a payment
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
    });

    return refund;
  } catch (error) {
    console.error("Error refunding payment:", error);
    throw new Error("Failed to refund payment");
  }
}

/**
 * Create a development checkout session without Stripe Connect requirements
 */
async function createDevelopmentCheckoutSession({
  orderId,
  items,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number; // in cents
  }>;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  console.log("=== Development Checkout Session ===");
  console.log("Creating development checkout session for order:", orderId);
  console.log("Items to process:", items.length);
  console.log("Total amount calculation:");

  let totalAmount = 0;
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalAmount += itemTotal;
    console.log(
      `  ${index + 1}. ${item.name}: ${item.quantity} x €${
        item.price / 100
      } = €${itemTotal / 100}`
    );
  });
  console.log(`Total: €${totalAmount / 100}`);

  try {
    console.log("Creating Stripe checkout session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        orderId,
        development: "true",
      },
      // No Connect-specific fields for development
    });

    console.log("✅ Development checkout session created successfully!");
    console.log("Session ID:", session.id);
    console.log("Checkout URL:", session.url);
    return session;
  } catch (error) {
    console.error("❌ Failed to create development checkout session:");
    console.error("Error type:", typeof error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error("Error details:", error);
    throw error;
  }
}
