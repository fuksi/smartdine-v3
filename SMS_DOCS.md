# SMS Notifications

This project includes SMS notifications using the Pushbullet API for Finnish phone numbers only.

## Configuration

Add the following environment variables to your `.env` file:

```bash
PUSHBULLET_API_KEY="your-pushbullet-api-key-here"
PUSHBULLET_DEVICE_ID="your-pushbullet-device-id-here"
```

## How it works

### Finnish Phone Number Detection
SMS notifications are only sent to Finnish phone numbers. The system automatically detects:
- `+358 4X` or `+358 5X` format (international)
- `04X` or `05X` format (domestic)

### Supported Order Status Changes
SMS notifications are sent for the following order status changes:
- **ACCEPTED**: Order has been accepted and is being prepared
- **READY_FOR_PICKUP**: Order is ready for customer pickup
- **REJECTED**: Order cannot be fulfilled

### Integration
SMS notifications run alongside email notifications in the order management system:
- Located in `/src/app/api/admin/orders/[id]/route.ts`
- SMS failures do not affect order updates
- Logs success/failure for debugging

### SMS Content
Each SMS includes:
- Order number (formatted as #0042)
- Customer name
- Restaurant name and location
- Order items with options
- Total amount
- Relevant timing information (pickup time, etc.)

## Files
- `/src/lib/sms.ts` - Core SMS functionality with Pushbullet integration
- `/src/lib/order-sms-utils.ts` - Utilities for formatting order data for SMS
- `/src/app/api/admin/orders/[id]/route.ts` - Integration point for order updates

## Testing
To test SMS functionality:
1. Ensure environment variables are set
2. Use a Finnish phone number when placing test orders
3. Update order status through the admin interface
4. Check Pushbullet device for notifications

## Error Handling
- Non-Finnish numbers: Logged and skipped
- API errors: Logged but don't affect order processing
- Missing credentials: Throws error with helpful message
