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

  console.log(`📱 SMS: Checking if phone number is Finnish:`);
  console.log(`📱 SMS: Original: ${phone}`);
  console.log(`📱 SMS: Cleaned: ${cleanPhone}`);

  // Check if it starts with Finnish country code or is a Finnish mobile number
  // Finnish mobile numbers: +358 4X, +358 5X, or domestic format 04X, 05X
  const finnishPatterns = [
    /^358[45]\d{7,8}$/, // +358 4X or +358 5X format
    /^0[45]\d{7,8}$/, // Domestic 04X or 05X format
  ];

  const isFinnish = finnishPatterns.some((pattern) => pattern.test(cleanPhone));
  console.log(`📱 SMS: Is Finnish number: ${isFinnish}`);

  return isFinnish;
};

async function sendPushbulletSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  const apiKey = process.env.PUSHBULLET_API_KEY;
  const deviceId = process.env.PUSHBULLET_DEVICE_ID;

  console.log(`📱 SMS: Preparing to send Pushbullet SMS`);
  console.log(`📱 SMS: API Key configured: ${!!apiKey}`);
  console.log(`📱 SMS: Device ID configured: ${!!deviceId}`);
  console.log(`📱 SMS: Device ID: ${deviceId}`);
  console.log(`📱 SMS: Target phone number: ${phoneNumber}`);
  console.log(`📱 SMS: Message length: ${message.length} characters`);
  console.log(`📱 SMS: Message preview: ${message.substring(0, 100)}...`);

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

  console.log(`📱 SMS: Sending SMS to Pushbullet texts API:`);
  console.log(`📱 SMS: Message payload:`, JSON.stringify(textMessage, null, 2));

  try {
    const response = await fetch("https://api.pushbullet.com/v2/texts", {
      method: "POST",
      headers: {
        "Access-Token": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textMessage),
    });

    console.log(`📱 SMS: Pushbullet API response status: ${response.status}`);
    console.log(
      `📱 SMS: Pushbullet API response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log(`📱 SMS: Pushbullet API response body:`, responseText);

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
      const responseData = JSON.parse(responseText);
      console.log(
        `📱 SMS: ✅ Pushbullet API success response:`,
        JSON.stringify(responseData, null, 2)
      );
    } catch {
      console.log(`📱 SMS: ✅ Response is not JSON, raw text:`, responseText);
    }

    console.log(`📱 SMS: ✅ SMS sent successfully via Pushbullet texts API!`);
  } catch (error) {
    console.error(`📱 SMS: ❌ Error sending SMS:`, error);
    throw error;
  }
}

export async function sendOrderAcceptedSMS(data: OrderSMSData) {
  console.log(
    `📱 SMS: Starting sendOrderAcceptedSMS for order ${data.orderId}`
  );
  console.log(`📱 SMS: Target phone number: ${data.customerPhone}`);
  console.log(`📱 SMS: Customer name: ${data.customerName}`);

  if (!isFinnishPhoneNumber(data.customerPhone)) {
    console.log(
      `📱 SMS: ⚠️  Skipping SMS for non-Finnish number: ${data.customerPhone}`
    );
    return;
  }

  console.log(`📱 SMS: ✅ Finnish number validated, proceeding with SMS`);

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

  console.log(`📱 SMS: Sending ACCEPTED SMS to ${data.customerPhone}`);
  await sendPushbulletSMS(data.customerPhone, message);
  console.log(`📱 SMS: ✅ ACCEPTED SMS completed for order ${data.orderId}`);
}

export async function sendOrderReadySMS(data: OrderSMSData) {
  console.log(`📱 SMS: Starting sendOrderReadySMS for order ${data.orderId}`);
  console.log(`📱 SMS: Target phone number: ${data.customerPhone}`);
  console.log(`📱 SMS: Customer name: ${data.customerName}`);

  if (!isFinnishPhoneNumber(data.customerPhone)) {
    console.log(
      `📱 SMS: ⚠️  Skipping SMS for non-Finnish number: ${data.customerPhone}`
    );
    return;
  }

  console.log(`📱 SMS: ✅ Finnish number validated, proceeding with SMS`);

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

  console.log(`📱 SMS: Sending READY SMS to ${data.customerPhone}`);
  await sendPushbulletSMS(data.customerPhone, message);
  console.log(`📱 SMS: ✅ READY SMS completed for order ${data.orderId}`);
}

export async function sendOrderRejectedSMS(data: OrderSMSData) {
  console.log(
    `📱 SMS: Starting sendOrderRejectedSMS for order ${data.orderId}`
  );
  console.log(`📱 SMS: Target phone number: ${data.customerPhone}`);
  console.log(`📱 SMS: Customer name: ${data.customerName}`);

  if (!isFinnishPhoneNumber(data.customerPhone)) {
    console.log(
      `📱 SMS: ⚠️  Skipping SMS for non-Finnish number: ${data.customerPhone}`
    );
    return;
  }

  console.log(`📱 SMS: ✅ Finnish number validated, proceeding with SMS`);

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

  console.log(`📱 SMS: Sending REJECTED SMS to ${data.customerPhone}`);
  await sendPushbulletSMS(data.customerPhone, message);
  console.log(`📱 SMS: ✅ REJECTED SMS completed for order ${data.orderId}`);
}

function shouldSendSMSForStatus(status: string): boolean {
  const shouldSend = ["ACCEPTED", "READY_FOR_PICKUP", "REJECTED"].includes(
    status
  );
  console.log(`📱 SMS: Should send SMS for status '${status}': ${shouldSend}`);
  return shouldSend;
}

export async function sendOrderStatusSMS(data: OrderSMSData) {
  console.log(`📱 SMS: =========================`);
  console.log(`📱 SMS: Order Status SMS Request`);
  console.log(`📱 SMS: Order ID: ${data.orderId}`);
  console.log(`📱 SMS: Display ID: ${data.displayId}`);
  console.log(`📱 SMS: Status: ${data.status}`);
  console.log(`📱 SMS: Customer: ${data.customerName}`);
  console.log(`📱 SMS: Phone: ${data.customerPhone}`);
  console.log(`📱 SMS: =========================`);

  if (!shouldSendSMSForStatus(data.status)) {
    console.log(`📱 SMS: ⚠️  No SMS needed for status: ${data.status}`);
    return;
  }

  try {
    switch (data.status) {
      case "ACCEPTED":
        console.log(`📱 SMS: 📤 Sending ACCEPTED SMS`);
        return await sendOrderAcceptedSMS(data);
      case "READY_FOR_PICKUP":
        console.log(`📱 SMS: 📤 Sending READY_FOR_PICKUP SMS`);
        return await sendOrderReadySMS(data);
      case "REJECTED":
        console.log(`📱 SMS: 📤 Sending REJECTED SMS`);
        return await sendOrderRejectedSMS(data);
      default:
        console.log(`📱 SMS: ⚠️  Unknown status: ${data.status}`);
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
