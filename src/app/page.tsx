import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  // Find the first active merchant with an active location
  const firstMerchant = await prisma.merchant.findFirst({
    where: { isActive: true },
    include: {
      locations: {
        where: { isActive: true },
        take: 1,
      },
    },
  });

  // If we found a merchant with a location, redirect to it
  if (firstMerchant && firstMerchant.locations.length > 0) {
    const location = firstMerchant.locations[0];
    redirect(`/restaurant/${firstMerchant.slug}/${location.slug}`);
  }

  // Fallback if no restaurants are available
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">SmartDine</h1>
        <p className="text-muted-foreground">
          No restaurants available at the moment. Please check back later.
        </p>
      </div>
    </div>
  );
}
