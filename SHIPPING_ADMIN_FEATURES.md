# Shipping Management in Admin UI

## Overview

This implementation adds comprehensive shipping management capabilities to the SmartDine admin interface, allowing administrators to control shipping settings for both individual products and entire categories.

## Features Implemented

### 1. Database Schema Updates

- Added `canShip` Boolean field to the `Category` model (default: false)
- Added `canShip` Boolean field to the `Product` model (default: false)
- Generated database migrations and updated Prisma client

### 2. Category-Level Shipping Management

- **Shipping Toggle**: Each category displays a "Shippable/No Shipping" toggle switch
- **Bulk Actions**: When toggling category shipping, users are prompted whether to apply the setting to all products in that category
- **Visual Indicators**: Categories show color-coded shipping badges (green for shippable, gray for no shipping)
- **Create/Edit Forms**: Category creation and editing forms include shipping checkbox

### 3. Product-Level Shipping Management

- **Individual Control**: Each product has its own shipping toggle independent of category settings
- **Visual Indicators**: Products display shipping badges and status indicators
- **Create/Edit Forms**: Product creation and editing forms include shipping checkbox
- **Quick Toggle**: Shipping can be toggled directly from the product list view

### 4. API Endpoints Enhanced

- **Category Creation**: `POST /api/admin/menu/categories` supports `canShip` field
- **Category Updates**: `PATCH /api/admin/menu/categories/[id]` supports `canShip` field
- **Product Creation**: `POST /api/admin/menu/products` supports `canShip` field
- **Product Updates**: `PATCH /api/admin/menu/products/[id]` supports `canShip` field
- **Bulk Category Shipping**: `PATCH /api/admin/menu/categories/[id]/shipping` with `updateProducts` option

### 5. User Experience Features

- **Confirmation Prompts**: When changing category shipping, users can choose to apply to all products
- **Color-Coded Badges**: Visual distinction between shippable (green) and non-shippable (gray) items
- **Toggle Switches**: Intuitive on/off controls for shipping settings
- **Form Integration**: Shipping options seamlessly integrated into existing create/edit workflows

## Usage Instructions

### Managing Category Shipping

1. Navigate to `/admin/menu`
2. Find the desired category
3. Use the "Shippable/No Shipping" toggle next to the category name
4. When prompted, choose whether to apply the setting to all products in the category

### Managing Product Shipping

1. Navigate to `/admin/menu`
2. Expand a category to view its products
3. Use the "Shippable/No Shipping" toggle next to each product
4. Alternatively, edit the product and use the "Can Ship" checkbox in the form

### Creating New Items with Shipping

- **Categories**: Check the "Can Ship" checkbox in the category creation form
- **Products**: Check the "Can Ship" checkbox in the product creation form

## Technical Implementation

### Database Changes

```sql
-- Category table
ALTER TABLE "categories" ADD COLUMN "canShip" BOOLEAN NOT NULL DEFAULT false;

-- Product table already had canShip from previous implementation
```

### Key Functions

- `toggleItemStatus()`: Handles individual item shipping toggles
- `toggleCategoryShippingWithProducts()`: Handles category shipping with bulk product updates
- Bulk shipping API endpoint for category-wide changes

### API Usage Examples

#### Toggle Product Shipping

```javascript
PATCH /api/admin/menu/products/[productId]
{
  "canShip": true
}
```

#### Toggle Category Shipping (with products)

```javascript
PATCH /api/admin/menu/categories/[categoryId]/shipping
{
  "canShip": true,
  "updateProducts": true
}
```

## Integration with Existing Shipping System

This admin interface integrates seamlessly with the existing shipping functionality:

- Products marked as `canShip: true` will be eligible for shipping in the customer cart
- Shipping cost calculations will only apply to orders containing shippable products
- The cart page will show shipping options only when shippable items are present

## Future Enhancements

- Bulk actions for multiple categories/products at once
- Shipping zones or region-specific restrictions
- Product-specific shipping costs
- Shipping method variations (express, standard, etc.)
