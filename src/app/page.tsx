import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  // Find the first active merchant
  const firstMerchant = await prisma.merchant.findFirst({
    where: { isActive: true },
  });

  // If we found a merchant, redirect to it
  if (firstMerchant) {
    redirect(`/restaurant/${firstMerchant.slug}`);
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
