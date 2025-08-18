import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe/config";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      case "payment_intent.requires_action": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentRequiresAction(paymentIntent);
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutFailed(payout);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.error("No order ID in checkout session metadata");
      return;
    }

    // Update order with payment intent ID and status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stripePaymentIntentId: session.payment_intent as string,
        paymentStatus: "AUTHORIZED",
      },
    });

    console.log(`Order ${orderId} payment authorized`);
  } catch (error) {
    console.error("Error handling checkout completed:", error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!order) {
      console.error(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    // Update payment status based on whether it was captured
    const status =
      paymentIntent.amount_received > 0 ? "CAPTURED" : "AUTHORIZED";

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: status,
        paymentCapturedAmount: paymentIntent.amount_received
          ? new Prisma.Decimal(paymentIntent.amount_received / 100)
          : null,
        paymentCapturedAt: paymentIntent.amount_received ? new Date() : null,
      },
    });

    console.log(`Order ${order.id} payment status updated to ${status}`);
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!order) {
      console.error(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
      },
    });

    console.log(`Order ${order.id} payment failed`);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!order) {
      console.error(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "CANCELED",
      },
    });

    console.log(`Order ${order.id} payment canceled`);
  } catch (error) {
    console.error("Error handling payment canceled:", error);
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      console.error("No order ID in expired checkout session metadata");
      return;
    }

    console.log(`Checkout session expired for order ${orderId}`);
    // Optionally update order status or send notification
  } catch (error) {
    console.error("Error handling checkout expired:", error);
  }
}

async function handlePaymentRequiresAction(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!order) {
      console.error(`No order found for payment intent ${paymentIntent.id}`);
      return;
    }

    console.log(`Payment requires action for order ${order.id}`);
    // Handle 3D Secure or other authentication requirements
  } catch (error) {
    console.error("Error handling payment requires action:", error);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Update the merchant location with new account status
    const isEnabled = account.charges_enabled && account.payouts_enabled;

    await prisma.merchantLocation.updateMany({
      where: { stripeConnectAccountId: account.id },
      data: {
        stripeConnectEnabled: isEnabled,
        stripeConnectSetupAt:
          isEnabled && !account.requirements?.currently_due?.length
            ? new Date()
            : null,
      },
    });

    console.log(
      `Stripe Connect account ${account.id} updated - enabled: ${isEnabled}`
    );
  } catch (error) {
    console.error("Error handling account updated:", error);
  }
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  try {
    console.log(
      `Payout failed: ${payout.id} - Amount: ${payout.amount} - Failure code: ${payout.failure_code}`
    );

    // Find the associated merchant location
    if (payout.destination) {
      const location = await prisma.merchantLocation.findFirst({
        where: { stripeConnectAccountId: payout.destination as string },
        include: { merchant: true },
      });

      if (location) {
        console.log(
          `Payout failure for ${location.merchant.name} - ${location.name}`
        );
        // Optionally send notification to restaurant about payout failure
      }
    }
  } catch (error) {
    console.error("Error handling payout failed:", error);
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log(
      `New dispute created: ${dispute.id} - Amount: ${dispute.amount} - Reason: ${dispute.reason}`
    );

    // Find the order associated with this charge
    if (dispute.payment_intent) {
      const order = await prisma.order.findFirst({
        where: { stripePaymentIntentId: dispute.payment_intent as string },
        include: { location: { include: { merchant: true } } },
      });

      if (order) {
        console.log(
          `Dispute for order ${order.id} at ${order.location.merchant.name}`
        );
        // Optionally notify restaurant about dispute
        // Optionally update order status to indicate dispute
      }
    }
  } catch (error) {
    console.error("Error handling dispute created:", error);
  }
}
