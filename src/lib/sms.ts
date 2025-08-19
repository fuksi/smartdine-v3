interface PushbulletTextMessage {
  data: {
    addresses: string[];
    message: string;
    target_device_iden: string;
  };
}

export interface OrderSMSData {
  orderId: string;
  displayId: number;
  customerName: string;
  customerPhone: string;
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

const isFinnishPhoneNumber = (phone: string): boolean => {
  // Remove spaces, dashes, and plus signs for checking
  const cleanPhone = phone.replace(/[\s\-\+]/g, "");

  // Check if it starts with Finnish country code or is a Finnish mobile number
  // Finnish mobile numbers: +358 4X, +358 5X, or domestic format 04X, 05X
  const finnishPatterns = [
    /^358[45]\d{7,8}$/, // +358 4X or +358 5X format
    /^0[45]\d{7,8}$/, // Domestic 04X or 05X format
  ];

  const isFinnish = finnishPatterns.some((pattern) => pattern.test(cleanPhone));

  return isFinnish;
};

async function sendPushbulletSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  const apiKey = process.env.PUSHBULLET_API_KEY;
  const deviceId = process.env.PUSHBULLET_DEVICE_ID;

  if (!apiKey || !deviceId) {
    console.error(
      `📱 SMS: ❌ Missing configuration - API Key: ${!!apiKey}, Device ID: ${!!deviceId}`
    );
    throw new Error("Pushbullet API key or device ID not configured");
  }

  const textMessage: PushbulletTextMessage = {
    data: {
      addresses: [phoneNumber],
      message: message,
      target_device_iden: deviceId,
    },
  };

  try {
    const response = await fetch("https://api.pushbullet.com/v2/texts", {
      method: "POST",
      headers: {
        "Access-Token": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textMessage),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `📱 SMS: ❌ Pushbullet API error: ${response.status} - ${responseText}`
      );
      throw new Error(
        `Pushbullet API error: ${response.status} - ${responseText}`
      );
    }

    // Try to parse as JSON for better logging
    try {
      JSON.parse(responseText);
    } catch {}
  } catch (error) {
    console.error(`📱 SMS: ❌ Error sending SMS:`, error);
    throw error;
  }
}

export async function sendOrderAcceptedSMS(data: OrderSMSData) {
  if (!isFinnishPhoneNumber(data.customerPhone)) {
    return;
  }

  const itemsText = data.items
    .map((item) => {
      let itemText = `${item.quantity}x ${item.name}`;
      if (item.options && item.options.length > 0) {
        const optionsText = item.options
          .map((opt) => `${opt.optionName}: ${opt.valueName}`)
          .join(", ");
        itemText += ` (${optionsText})`;
      }
      return itemText;
    })
    .join("\n");

  const message = `${data.merchantName} - Order #${formatDisplayId(
    data.displayId
  )} Accepted

Hello ${data.customerName}!

Your order has been accepted and is being prepared.

${data.merchantName} - ${data.locationName}
${data.locationAddress}

Order Details:
${itemsText}

Total: ${formatCurrency(data.totalAmount)}
${
  data.estimatedPickupTime
    ? `Estimated pickup: ${data.estimatedPickupTime}`
    : ""
}

Thank you for your order!`;

  await sendPushbulletSMS(data.customerPhone, message);
}

export async function sendOrderReadySMS(data: OrderSMSData) {
  if (!isFinnishPhoneNumber(data.customerPhone)) {
    return;
  }

  const message = `${data.merchantName} - Order #${formatDisplayId(
    data.displayId
  )} Ready

Hello ${data.customerName}!

Your order #${formatDisplayId(data.displayId)} is ready for pickup!

${data.merchantName} - ${data.locationName}
${data.locationAddress}

Total: ${formatCurrency(data.totalAmount)}

Please come and collect your order.

Thank you!`;

  await sendPushbulletSMS(data.customerPhone, message);
}

export async function sendOrderRejectedSMS(data: OrderSMSData) {
  if (!isFinnishPhoneNumber(data.customerPhone)) {
    return;
  }

  const message = `${data.merchantName} - Order #${formatDisplayId(
    data.displayId
  )} Cannot be Fulfilled

Hello ${data.customerName},

We regret to inform you that your order #${formatDisplayId(
    data.displayId
  )} cannot be fulfilled at this time.

${data.merchantName} - ${data.locationName}

If you have any questions, please contact us.

We apologize for any inconvenience.`;

  await sendPushbulletSMS(data.customerPhone, message);
}

function shouldSendSMSForStatus(status: string): boolean {
  return ["ACCEPTED", "READY_FOR_PICKUP", "REJECTED"].includes(status);
}

export async function sendOrderStatusSMS(data: OrderSMSData) {
  if (!shouldSendSMSForStatus(data.status)) {
    return;
  }
  try {
    switch (data.status) {
      case "ACCEPTED":
        return await sendOrderAcceptedSMS(data);
      case "READY_FOR_PICKUP":
        return await sendOrderReadySMS(data);
      case "REJECTED":
        return await sendOrderRejectedSMS(data);
      default:
        return;
    }
  } catch (error) {
    console.error(
      `📱 SMS: ❌ Error sending SMS for order ${data.orderId}:`,
      error
    );
    throw error;
  }
}
