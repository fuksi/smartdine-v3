import { prisma } from "./test-utils";

describe("Restaurant Routing - Merchant Based Architecture", () => {
  test("should create deterministic Uuno restaurant data", async () => {
    // Create Uuno merchant
    const merchant = await prisma.merchant.create({
      data: {
        name: "Uuno Pizza",
        slug: "uuno",
        description: "Authentic Finnish pizza and grill",
        address: "Uuno Street 1, Helsinki, Finland",
        isActive: true,
      },
    });

    expect(merchant).toBeDefined();
    expect(merchant.name).toBe("Uuno Pizza");
    expect(merchant.slug).toBe("uuno");
    expect(merchant.isActive).toBe(true);

    // Verify merchant can be found by slug (this is what the homepage uses)
    const foundMerchant = await prisma.merchant.findFirst({
      where: { isActive: true },
    });

    expect(foundMerchant).toBeDefined();
    expect(foundMerchant?.slug).toBe("uuno");

    // Test data should be deterministic
    const merchantsBySlug = await prisma.merchant.findUnique({
      where: { slug: "uuno" },
    });

    expect(merchantsBySlug).toBeDefined();
    expect(merchantsBySlug?.id).toBe(merchant.id);
  });

  test("should validate merchant URL structure", async () => {
    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        name: "Test Restaurant",
        slug: "test-restaurant",
        description: "A test restaurant",
        address: "123 Test Street, Test City",
        isActive: true,
      },
    });

    // The new URL structure should be /restaurant/[merchantSlug]
    // This test validates that we have the merchant slug available
    expect(merchant.slug).toBe("test-restaurant");

    // Simulate the routing logic from src/app/page.tsx
    const firstActiveMerchant = await prisma.merchant.findFirst({
      where: { isActive: true },
    });

    expect(firstActiveMerchant).toBeDefined();

    // The redirect URL would be `/restaurant/${firstActiveMerchant.slug}`
    const redirectUrl = `/restaurant/${firstActiveMerchant?.slug}`;
    expect(redirectUrl).toBe("/restaurant/test-restaurant");
  });

  test("should handle multiple merchants correctly", async () => {
    // Create multiple merchants
    const merchant1 = await prisma.merchant.create({
      data: {
        name: "Uuno Pizza",
        slug: "uuno",
        description: "Finnish pizza",
        isActive: true,
      },
    });

    const merchant2 = await prisma.merchant.create({
      data: {
        name: "Bonbon Coffee",
        slug: "bonbon-coffee",
        description: "Premium coffee",
        isActive: true,
      },
    });

    // Each merchant should have unique URLs
    expect(merchant1.slug).toBe("uuno");
    expect(merchant2.slug).toBe("bonbon-coffee");

    // Both should be accessible via their slugs
    const foundUuno = await prisma.merchant.findUnique({
      where: { slug: "uuno" },
    });

    const foundBonbon = await prisma.merchant.findUnique({
      where: { slug: "bonbon-coffee" },
    });

    expect(foundUuno?.id).toBe(merchant1.id);
    expect(foundBonbon?.id).toBe(merchant2.id);
  });
});
