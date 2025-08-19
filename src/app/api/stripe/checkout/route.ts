import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe/utils";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  console.log("=== 🚀 Stripe Checkout API Called ===");
  console.log("Request method:", request.method);
  console.log("Request URL:", request.url);
  console.log(
    "Request headers:",
    Object.fromEntries(request.headers.entries())
  );

  let body;
  try {
    console.log("📥 Parsing request body...");
    body = await request.json();
    console.log(
      "✅ Request body parsed successfully:",
      JSON.stringify(body, null, 2)
    );

    const { orderId, successUrl, cancelUrl } = body;
    console.log("🔍 Extracted parameters:", {
      orderId: orderId || "❌ MISSING",
      successUrl: successUrl || "❌ MISSING",
      cancelUrl: cancelUrl || "❌ MISSING",
    });

    if (!orderId) {
      console.error("❌ VALIDATION ERROR: Missing order ID in request");
      console.error("Full request body was:", body);
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!successUrl) {
      console.warn("⚠️  WARNING: Missing successUrl, will use default");
    }

    if (!cancelUrl) {
      console.warn("⚠️  WARNING: Missing cancelUrl, will use default");
    }
  } catch (parseError) {
    console.error("❌ CRITICAL ERROR: Failed to parse request body");
    console.error("Parse error:", parseError);
    console.error("Raw request might be malformed");
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    const { orderId, successUrl, cancelUrl } = body;

    console.log("🔍 Database Query: Fetching order from database:", orderId);
    console.log(
      "📊 Query details: Finding order with full relations (items, products, options, location, merchant)"
    );

    // Get the order with items and location
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            options: {
              include: {
                option: true,
                optionValue: true,
              },
            },
          },
        },
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    console.log("📋 Database Query Result:");
    if (!order) {
      console.error("❌ DATABASE ERROR: Order not found in database:", orderId);
      console.error("This could mean:");
      console.error("- Order ID is invalid/malformed");
      console.error("- Order was deleted");
      console.error("- Database connection issue");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("✅ Order found successfully!");
    console.log("📦 Order details:", {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      itemsCount: order.items.length,
      locationId: order.locationId,
      hasLocation: !!order.location,
      locationName: order.location?.name,
      merchantName: order.location?.merchant?.name,
      stripeConnectAccountId:
        order.location?.stripeConnectAccountId || "❌ NOT SET",
      stripeConnectEnabled: order.location?.stripeConnectEnabled || false,
    });

    // Check if location has Stripe Connect set up
    console.log("🔧 Checking Stripe Connect configuration...");
    if (
      !order.location?.stripeConnectAccountId ||
      !order.location?.stripeConnectEnabled
    ) {
      console.error(
        "❌ STRIPE CONNECT ERROR: Restaurant payment not configured"
      );
      console.error("Location details:", {
        id: order.location?.id,
        name: order.location?.name,
        stripeConnectAccountId:
          order.location?.stripeConnectAccountId || "❌ MISSING",
        stripeConnectEnabled: order.location?.stripeConnectEnabled || false,
        stripeConnectSetupAt:
          order.location?.stripeConnectSetupAt || "❌ NEVER",
      });
      console.error("⚠️  This error occurs when:");
      console.error("- Restaurant hasn't completed Stripe Connect setup");
      console.error("- stripeConnectEnabled is false in database");
      console.error("- stripeConnectAccountId is null/empty");
      return NextResponse.json(
        { error: "Restaurant payment not configured" },
        { status: 400 }
      );
    }

    console.log("✅ Stripe Connect is properly configured!");
    console.log("🏪 Restaurant payment details:", {
      accountId: order.location.stripeConnectAccountId,
      enabled: order.location.stripeConnectEnabled,
      setupAt: order.location.stripeConnectSetupAt,
    });

    // Build line items for Stripe
    console.log("🛒 Building line items for Stripe checkout...");
    console.log(`📋 Processing ${order.items.length} order items:`);

    const lineItems = order.items.map((item, index) => {
      console.log(`\n🔸 Item ${index + 1}/${order.items.length}:`);
      console.log(`   Product: ${item.product.name}`);
      console.log(`   Quantity: ${item.quantity}`);
      console.log(`   Unit Price: €${Number(item.unitPrice)}`);

      let itemName = item.product.name;

      // Add options to item name
      if (item.options.length > 0) {
        const optionNames = item.options
          .map((opt) => {
            console.log(
              `   Option: ${opt.option.name} = ${
                opt.optionValue.name
              } (+€${Number(opt.optionValue.priceModifier)})`
            );
            return opt.optionValue.name;
          })
          .join(", ");
        itemName += ` (${optionNames})`;
        console.log(`   Final item name: ${itemName}`);
      }

      // Convert price to cents
      const priceInCents = Math.round(Number(item.unitPrice) * 100);
      const totalItemPrice = priceInCents * item.quantity;

      console.log(`   Price in cents: ${priceInCents}`);
      console.log(`   Total for this item: €${totalItemPrice / 100}`);

      console.log(
        `✅ Line item ready: ${itemName} - ${item.quantity}x €${Number(
          item.unitPrice
        )} = €${totalItemPrice / 100}`
      );

      return {
        name: itemName,
        quantity: item.quantity,
        price: priceInCents,
      };
    });

    // Add shipping as a line item if applicable
    if (order.shippingCost && Number(order.shippingCost) > 0) {
      const shippingCostInCents = Math.round(Number(order.shippingCost) * 100);
      console.log(`\n🚚 Adding shipping line item:`);
      console.log(`   Shipping cost: €${Number(order.shippingCost)}`);
      console.log(`   Shipping cost in cents: ${shippingCostInCents}`);
      
      lineItems.push({
        name: "Shipping",
        quantity: 1,
        price: shippingCostInCents,
      });
    }

    const totalLineItemsValue = lineItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    console.log(`\n📊 Line Items Summary:`);
    console.log(`   Total items: ${lineItems.length}`);
    console.log(`   Total value: €${totalLineItemsValue / 100}`);
    console.log(`   Expected order total: €${Number(order.totalAmount)}`);

    if (
      Math.abs(totalLineItemsValue / 100 - Number(order.totalAmount)) > 0.01
    ) {
      console.warn(
        `⚠️  WARNING: Line items total (€${
          totalLineItemsValue / 100
        }) doesn't match order total (€${Number(order.totalAmount)})`
      );
    }

    // Create checkout session
    console.log("\n🎫 Creating Stripe checkout session...");
    console.log("📋 Session parameters:");
    console.log(`   Order ID: ${order.id}`);
    console.log(`   Location ID: ${order.locationId}`);
    console.log(`   Line items count: ${lineItems.length}`);
    console.log(`   Customer email: ${order.customerEmail || "Not provided"}`);
    console.log(
      `   Success URL: ${
        successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/your-order?id=${orderId}`
      }`
    );
    console.log(
      `   Cancel URL: ${cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/cart`}`
    );
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);

    try {
      const session = await createCheckoutSession({
        orderId: order.id,
        locationId: order.locationId,
        items: lineItems,
        customerEmail: order.customerEmail || undefined,
        successUrl:
          successUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL}/your-order?id=${orderId}`,
        cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      });

      console.log("🎉 Checkout session created successfully!");
      console.log("✅ Session details:", {
        id: session.id,
        url: session.url,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
      });

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (stripeError) {
      console.error("❌ STRIPE ERROR: Failed to create checkout session");
      console.error("Stripe error details:", {
        type: typeof stripeError,
        message:
          stripeError instanceof Error
            ? stripeError.message
            : String(stripeError),
        stack:
          stripeError instanceof Error ? stripeError.stack : "No stack trace",
        code:
          (stripeError as unknown as { code?: string })?.code ||
          "No error code",
        param:
          (stripeError as unknown as { param?: string })?.param || "No param",
        statusCode:
          (stripeError as unknown as { statusCode?: number })?.statusCode ||
          "No status code",
      });
      throw stripeError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("\n🚨 === CHECKOUT SESSION CRITICAL ERROR ===");
    console.error("💥 An unexpected error occurred in the checkout process");
    console.error("🔍 Error Analysis:");
    console.error("   Error type:", typeof error);
    console.error(
      "   Error instance:",
      error instanceof Error ? "Error object" : "Other type"
    );
    console.error(
      "   Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "   Error name:",
      error instanceof Error ? error.name : "N/A"
    );

    if (error instanceof Error && error.stack) {
      console.error("📋 Stack trace:");
      console.error(error.stack);
    }

    // Log additional error properties if available
    const errorObj = error as unknown as Record<string, unknown>;
    const additionalProps = Object.keys(errorObj).filter(
      (key) => !["message", "name", "stack"].includes(key)
    );

    if (additionalProps.length > 0) {
      console.error("🔧 Additional error properties:");
      additionalProps.forEach((prop) => {
        console.error(`   ${prop}:`, errorObj[prop]);
      });
    }

    console.error("🏥 Error Recovery: Returning 500 error to client");
    console.error("=".repeat(50));

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        requestId: `checkout-${Date.now()}`,
      },
      { status: 500 }
    );
  }
}
