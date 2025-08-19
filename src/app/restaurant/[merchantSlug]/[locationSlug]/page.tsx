import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RestaurantPage } from "@/components/restaurant-page";

interface RestaurantPageProps {
  params: Promise<{
    merchantSlug: string;
    locationSlug: string;
  }>;
}

export default async function RestaurantPageServer({
  params,
}: RestaurantPageProps) {
  const { merchantSlug, locationSlug } = await params;

  const location = await prisma.merchantLocation.findFirst({
    where: {
      slug: locationSlug,
      merchant: {
        slug: merchantSlug,
        isActive: true,
      },
      isActive: true,
    },
    include: {
      merchant: true,
      menu: {
        include: {
          categories: {
            where: { isActive: true },
            include: {
              products: {
                where: { isAvailable: true },
                include: {
                  options: {
                    include: {
                      optionValues: {
                        orderBy: { sortOrder: "asc" },
                      },
                    },
                    orderBy: { sortOrder: "asc" },
                  },
                },
                orderBy: { sortOrder: "asc" },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!location || !location.menu) {
    notFound();
  }

  // Convert Decimal objects to numbers for client components
  const serializedLocation = {
    ...location,
    menu: {
      ...location.menu,
      categories: location.menu.categories.map((category) => ({
        ...category,
        products: category.products.map((product) => ({
          ...product,
          price: Number(product.price),
          canShip: product.canShip,
          options: product.options.map((option) => ({
            ...option,
            optionValues: option.optionValues.map((value) => ({
              ...value,
              priceModifier: Number(value.priceModifier),
            })),
          })),
        })),
      })),
    },
  };

  return (
    <RestaurantPage
      location={serializedLocation}
      merchantSlug={merchantSlug}
      locationSlug={locationSlug}
    />
  );
}
