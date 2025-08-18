import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderEmailData {
  orderId: string;
  displayId: number;
  customerName: string;
  customerEmail: string;
  merchantName: string;
  locationName: string;
  locationAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    options?: Array<{
      optionName: string;
      valueName: string;
    }>;
  }>;
  totalAmount: number;
  status: string;
  estimatedPickupTime?: string;
}

const formatDisplayId = (displayId: number): string => {
  return displayId.toString().padStart(4, "0");
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

export async function sendOrderAcceptedEmail(data: OrderEmailData) {
  const subject = `Order #${formatDisplayId(data.displayId)} Accepted - ${
    data.merchantName
  }`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Accepted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #5EB1BF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #5EB1BF; }
          .items { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 1.2em; color: #5EB1BF; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          .status-badge { background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Order Accepted!</h1>
          <p>Your order has been accepted and is being prepared</p>
        </div>
        
        <div class="content">
          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> #${formatDisplayId(
              data.displayId
            )}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Status:</strong> <span class="status-badge">Accepted</span></p>
            ${
              data.estimatedPickupTime
                ? `<p><strong>Estimated Pickup:</strong> ${new Date(
                    data.estimatedPickupTime
                  ).toLocaleString()}</p>`
                : ""
            }
          </div>

          <div class="order-info">
            <h2>Restaurant</h2>
            <p><strong>${data.merchantName}</strong></p>
            <p>${data.locationName}</p>
            <p>${data.locationAddress}</p>
          </div>

          <div class="items">
            <h2>Order Items</h2>
            ${data.items
              .map(
                (item) => `
              <div class="item">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <strong>${item.name}</strong> × ${item.quantity}
                    ${
                      item.options && item.options.length > 0
                        ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${item.options
                          .map((opt) => `${opt.optionName}: ${opt.valueName}`)
                          .join(", ")}
                      </div>`
                        : ""
                    }
                  </div>
                  <div style="font-weight: bold;">${formatCurrency(
                    item.price * item.quantity
                  )}</div>
                </div>
              </div>
            `
              )
              .join("")}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #5EB1BF;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="total">Total:</span>
                <span class="total">${formatCurrency(data.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Next Steps:</strong></p>
            <p style="margin: 5px 0 0 0;">Your order is now being prepared. We'll notify you when it's ready for pickup!</p>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p style="font-size: 0.8em; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@smartdine.com",
      to: [data.customerEmail],
      subject,
      html,
    });

    console.log("✅ Order accepted email sent:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending order accepted email:", error);
    throw error;
  }
}

export async function sendOrderRejectedEmail(data: OrderEmailData) {
  const subject = `Order #${formatDisplayId(data.displayId)} Update - ${
    data.merchantName
  }`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #ef4444; }
          .items { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 1.2em; color: #ef4444; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          .status-badge { background: #ef4444; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Order Update</h1>
          <p>Unfortunately, we cannot fulfill your order at this time</p>
        </div>
        
        <div class="content">
          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> #${formatDisplayId(
              data.displayId
            )}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Status:</strong> <span class="status-badge">Cannot Fulfill</span></p>
          </div>

          <div class="order-info">
            <h2>Restaurant</h2>
            <p><strong>${data.merchantName}</strong></p>
            <p>${data.locationName}</p>
            <p>${data.locationAddress}</p>
          </div>

          <div class="items">
            <h2>Order Items</h2>
            ${data.items
              .map(
                (item) => `
              <div class="item">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <strong>${item.name}</strong> × ${item.quantity}
                    ${
                      item.options && item.options.length > 0
                        ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${item.options
                          .map((opt) => `${opt.optionName}: ${opt.valueName}`)
                          .join(", ")}
                      </div>`
                        : ""
                    }
                  </div>
                  <div style="font-weight: bold;">${formatCurrency(
                    item.price * item.quantity
                  )}</div>
                </div>
              </div>
            `
              )
              .join("")}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #ef4444;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="total">Total:</span>
                <span class="total">${formatCurrency(data.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0;"><strong>What happens next:</strong></p>
            <p style="margin: 5px 0 0 0;">If you paid online, your payment will be automatically refunded within 3-5 business days. We apologize for any inconvenience.</p>
          </div>
        </div>

        <div class="footer">
          <p>We apologize for the inconvenience and hope to serve you again soon.</p>
          <p style="font-size: 0.8em; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@smartdine.com",
      to: [data.customerEmail],
      subject,
      html,
    });

    console.log("✅ Order rejected email sent:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending order rejected email:", error);
    throw error;
  }
}

export async function sendOrderReadyEmail(data: OrderEmailData) {
  const subject = `Order #${formatDisplayId(
    data.displayId
  )} Ready for Pickup! - ${data.merchantName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #22c55e; }
          .items { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .total { font-weight: bold; font-size: 1.2em; color: #22c55e; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 0.9em; }
          .status-badge { background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .pickup-info { background: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid #22c55e; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Order Ready!</h1>
          <p>Your delicious order is ready for pickup</p>
        </div>
        
        <div class="content">
          <div class="pickup-info">
            <h2 style="margin-top: 0; color: #22c55e;">📍 Ready for Pickup Now!</h2>
            <p style="margin: 0; font-size: 1.1em;"><strong>Please come to:</strong></p>
            <p style="margin: 5px 0; font-size: 1.1em;"><strong>${
              data.merchantName
            }</strong></p>
            <p style="margin: 0; font-size: 1.1em;">${data.locationName}</p>
            <p style="margin: 0; font-size: 1.1em;">${data.locationAddress}</p>
          </div>

          <div class="order-info">
            <h2>Order Details</h2>
            <p><strong>Order Number:</strong> #${formatDisplayId(
              data.displayId
            )}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Status:</strong> <span class="status-badge">Ready for Pickup</span></p>
          </div>

          <div class="items">
            <h2>Your Order</h2>
            ${data.items
              .map(
                (item) => `
              <div class="item">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <strong>${item.name}</strong> × ${item.quantity}
                    ${
                      item.options && item.options.length > 0
                        ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${item.options
                          .map((opt) => `${opt.optionName}: ${opt.valueName}`)
                          .join(", ")}
                      </div>`
                        : ""
                    }
                  </div>
                  <div style="font-weight: bold;">${formatCurrency(
                    item.price * item.quantity
                  )}</div>
                </div>
              </div>
            `
              )
              .join("")}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #22c55e;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="total">Total:</span>
                <span class="total">${formatCurrency(data.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>💡 Pickup Instructions:</strong></p>
            <p style="margin: 5px 0 0 0;">Please show this email or mention order #${formatDisplayId(
              data.displayId
            )} when you arrive.</p>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing ${data.merchantName}!</p>
          <p style="font-size: 0.8em; color: #999;">This is an automated email. Please do not reply.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || "orders@smartdine.com",
      to: [data.customerEmail],
      subject,
      html,
    });

    console.log("✅ Order ready email sent:", result);
    return result;
  } catch (error) {
    console.error("❌ Error sending order ready email:", error);
    throw error;
  }
}

export async function sendOrderStatusEmail(data: OrderEmailData) {
  switch (data.status) {
    case "ACCEPTED":
      return sendOrderAcceptedEmail(data);
    case "REJECTED":
      return sendOrderRejectedEmail(data);
    case "READY_FOR_PICKUP":
      return sendOrderReadyEmail(data);
    default:
      console.log(
        `No email notification configured for status: ${data.status}`
      );
      return null;
  }
}
