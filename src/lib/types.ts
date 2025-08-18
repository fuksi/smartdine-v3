import {
  Merchant,
  MerchantLocation,
  Menu,
  Category,
  Product,
  ProductOption,
  ProductOptionValue,
  Order,
  OrderItem,
  OrderItemOption,
  PaymentStatus,
} from "@prisma/client";

export type MerchantWithLocations = Merchant & {
  locations: MerchantLocation[];
};

export type LocationWithMenu = MerchantLocation & {
  merchant: Merchant;
  menu?: MenuWithCategories;
};

export type MenuWithCategories = Menu & {
  categories: CategoryWithProducts[];
};

export type CategoryWithProducts = Category & {
  products: ProductWithOptions[];
};

export type ProductWithOptions = Product & {
  options: ProductOptionWithValues[];
};

export type ProductOptionWithValues = ProductOption & {
  optionValues: ProductOptionValue[];
};

export type OrderWithItems = Order & {
  items: OrderItemWithDetails[];
  location: MerchantLocation & {
    merchant: Merchant;
  };
};

export type OrderItemWithDetails = OrderItem & {
  product: Product;
  options: (OrderItemOption & {
    option: ProductOption;
    optionValue: ProductOptionValue;
  })[];
};

// Serialized types for client components (Decimal -> number)
export type SerializedProductOptionValue = Omit<
  ProductOptionValue,
  "priceModifier"
> & {
  priceModifier: number;
};

export type SerializedProductOption = Omit<ProductOption, "optionValues"> & {
  optionValues: SerializedProductOptionValue[];
};

export type SerializedProduct = Omit<Product, "price" | "options"> & {
  price: number;
  options: SerializedProductOption[];
};
