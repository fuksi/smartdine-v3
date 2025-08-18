# Email Notification System

This system sends automated email notifications to customers when their order status changes.

## Setup

1. **Get Resend API Key**

   - Sign up at [resend.com](https://resend.com)
   - Create an API key
   - Add it to your `.env.local` file

2. **Environment Configuration**

   ```env
   RESEND_API_KEY="re_your_api_key_here"
   FROM_EMAIL="orders@yourdomain.com"
   ```

3. **Email Domain Setup**
   - Add your domain to Resend
   - Verify DNS settings
   - Use a verified email address in `FROM_EMAIL`

## Email Triggers

The system automatically sends emails for these order status changes:

- **ACCEPTED**: ✅ Sent when restaurant accepts the order
- **REJECTED**: ❌ Sent when restaurant cannot fulfill the order
- **READY_FOR_PICKUP**: 🎉 Sent when order is ready for customer pickup
- **PLACED**: ❌ No email sent (order just placed)
- **PROCESSING**: ❌ No email sent (internal status)
- **FULFILLED**: ❌ No email sent (order completed)

## Email Templates

Each email includes:

- Order number (user-friendly 4-digit display ID)
- Customer name and order details
- Restaurant information and address
- Itemized order list with options
- Total amount
- Status-specific messaging and next steps

## Testing

Use the test endpoint to verify email functionality:

```bash
# Test all email types
npm run test:emails

# Test specific order status
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-uuid-here",
    "status": "ACCEPTED",
    "testEmail": "your-test-email@example.com"
  }'
```

## Production Setup

1. **Domain Verification**: Verify your sending domain in Resend
2. **Email Address**: Use a professional email like `orders@yourdomain.com`
3. **Monitoring**: Check Resend dashboard for delivery rates and issues
4. **Error Handling**: Email failures won't block order updates

## Troubleshooting

- **Emails not sending**: Check API key and domain verification
- **Emails in spam**: Verify DNS records and domain reputation
- **Missing order data**: Ensure order includes customer email and location data

## Development

The email system consists of:

- `src/lib/email.ts`: Email templates and sending logic
- `src/lib/order-email-utils.ts`: Data formatting utilities
- `src/app/api/admin/orders/[id]/route.ts`: Integration with order updates
- `test-emails.js`: Testing script
