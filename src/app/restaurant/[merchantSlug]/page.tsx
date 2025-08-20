import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RestaurantPage } from "@/components/restaurant-page";

interface RestaurantPageProps {
  params: Promise<{
    merchantSlug: string;
  }>;
}

export default async function RestaurantPageServer({
  params,
}: RestaurantPageProps) {
  const { merchantSlug } = await params;

  const merchant = await prisma.merchant.findFirst({
    where: {
      slug: merchantSlug,
      isActive: true,
    },
    include: {
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

  if (!merchant) {
    notFound();
  }

  return (
    <RestaurantPage
      merchant={merchant}
      merchantSlug={merchantSlug}
    />
  );
}

export async function generateStaticParams() {
  const merchants = await prisma.merchant.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  return merchants.map((merchant) => ({
    merchantSlug: merchant.slug,
  }));
}

export async function generateMetadata({
  params,
}: RestaurantPageProps) {
  const { merchantSlug } = await params;
  
  const merchant = await prisma.merchant.findFirst({
    where: {
      slug: merchantSlug,
      isActive: true,
    },
  });

  if (!merchant) {
    return {
      title: "Restaurant Not Found",
    };
  }

  return {
    title: `${merchant.name} - Order Online`,
    description: merchant.description || `Order online from ${merchant.name}`,
  };
}
