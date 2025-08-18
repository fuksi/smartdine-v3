import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
  typescript: true,
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID || "",
} as const;

// Stripe Connect OAuth URLs
export const STRIPE_CONNECT_OAUTH_URL = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${STRIPE_CONFIG.connectClientId}&scope=read_write`;
