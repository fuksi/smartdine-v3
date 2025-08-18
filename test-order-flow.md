# Order Flow Test Script

This script tests the complete order flow from customer order placement to merchant fulfillment.

## Test Prerequisites

- Development server running on localhost:3000
- Database seeded with test data
- Browser with developer tools open

## Test Flow

### 1. Customer Order Placement Flow

**Step 1.1: Navigate to Restaurant**

- Go to `http://localhost:3000`
- Click on "Uuno Pizza" → "Jätkäsaari" location
- Verify: Menu loads with categories and products

**Step 1.2: Add Items to Cart**

- Add "Margherita Pizza" to cart (click Add to Cart)
- Add another item with options if available
- Click cart button to view cart
- Verify: Items appear in cart with correct prices

**Step 1.3: Complete Order Form**

- Fill in customer information:
  - Name: "Test Customer"
  - Phone: "+358 123 456 789"
  - Email: "test@example.com"
- Verify: "Place Order" button is enabled only when all fields are valid
- Click "Place Order"
- Verify: Order submits successfully and redirects to order tracking

### 2. Customer Order Tracking Flow

**Step 2.1: Order Status Page**

- Verify: Redirected to `/your-order?id=<order-id>`
- Verify: Order displays with status "Placed"
- Verify: All order details are correct:
  - Order number
  - Customer info
  - Items and prices
  - Total amount
  - Restaurant details

**Step 2.2: Real-time Updates**

- Keep this page open
- Note the order ID from URL for merchant admin testing

### 3. Merchant Admin Flow

**Step 3.1: Access Admin Panel**

- Open new tab/window
- Go to `http://localhost:3000/admin/orders`
- Verify: Admin dashboard loads with order list
- Verify: Recent order appears with "Placed" status

**Step 3.2: Order Management**

- Find the test order in the list
- Verify: Customer information is displayed
- Verify: Order items and total are correct
- Click "Accepted" button
- Verify: Order status updates to "Accepted"
- Verify: Available actions change to "Processing"

**Step 3.3: Status Progression**

- Continue clicking through the status flow:
  - Accepted → Processing
  - Processing → Ready
  - Ready → Fulfilled
- Verify: Each status change updates immediately
- Verify: Available actions change appropriately

**Step 3.4: Filter and Search**

- Test status filter: Select "Fulfilled" from dropdown
- Verify: Only fulfilled orders show
- Test search: Search by customer name "Test Customer"
- Verify: Search works correctly
- Clear filters to show all orders

### 4. Customer Experience Verification

**Step 4.1: Check Order Tracking Updates**

- Return to the customer order tracking tab
- Refresh page or wait for auto-refresh (30 seconds)
- Verify: Order status reflects the changes made in admin
- Verify: Final status shows as "Fulfilled"

**Step 4.2: UI/UX Verification**

- Verify: All status changes have appropriate icons and colors
- Verify: Page is mobile-responsive
- Verify: No console errors in browser dev tools

## Expected Results

✅ **Customer Flow:**

- Order placement works without errors
- Form validation works correctly
- Redirect to order tracking after successful placement
- Real-time status updates display correctly

✅ **Admin Flow:**

- Order appears immediately in admin dashboard
- Status updates work instantly
- Filtering and search function properly
- All order details display correctly

✅ **Integration:**

- Status changes in admin reflect in customer view
- No JavaScript errors or broken functionality
- Responsive design works on different screen sizes

## Error Scenarios to Test

### Invalid Data Handling

- Try submitting order with invalid email format
- Try accessing non-existent order ID: `/your-order?id=invalid-id`
- Try updating order status with invalid data via admin

### Network Error Simulation

- Disable network and try to place order
- Check error handling and user feedback

## Performance Checks

- Order placement should complete in < 2 seconds
- Admin dashboard should load in < 1 second
- Status updates should be instantaneous
- Auto-refresh should work every 30 seconds

## Test Completion Checklist

- [ ] Customer can place orders successfully
- [ ] Order tracking page displays correct information
- [ ] Admin panel shows all orders
- [ ] Status updates work in both directions
- [ ] No console errors
- [ ] Mobile responsive design works
- [ ] All monetary values display correctly (no Decimal errors)
- [ ] Email validation prevents invalid submissions
- [ ] Search and filter functionality works
- [ ] Error states are handled gracefully

---

_Run this test after any major changes to the order flow system._
