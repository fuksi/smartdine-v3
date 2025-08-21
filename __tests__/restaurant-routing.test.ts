import { prisma, createTestUunoData } from "./test-utils";

describe("Restaurant Page Routing", () => {
  test("should support simplified URL structure /restaurant/[merchantSlug]", async () => {
    // Create Uuno restaurant with deterministic data
    const { merchant } = await createTestUunoData();

    // The new URL structure should be accessible via /restaurant/uuno
    // instead of the old /restaurant/uuno/jatkasaari
    expect(merchant.slug).toBe("uuno");

    // Simulate finding merchant by slug (like in restaurant/[merchantSlug]/page.tsx)
    const foundMerchant = await prisma.merchant.findUnique({
      where: { slug: "uuno" },
    });

    expect(foundMerchant).toBeDefined();
    expect(foundMerchant?.name).toBe("Uuno Pizza");
  });

  test("should redirect from homepage to first active merchant", async () => {
    // Create active merchant
    await prisma.merchant.create({
      data: {
        name: "Uuno Pizza",
        slug: "uuno",
        description: "Authentic Finnish pizza and grill",
        address: "Uuno Street 1, Helsinki, Finland",
        isActive: true,
      },
    });

    // Simulate homepage logic (src/app/page.tsx)
    const firstMerchant = await prisma.merchant.findFirst({
      where: { isActive: true },
    });

    expect(firstMerchant).toBeDefined();

    // Should redirect to /restaurant/uuno
    const redirectUrl = `/restaurant/${firstMerchant?.slug}`;
    expect(redirectUrl).toBe("/restaurant/uuno");
  });

  test("should handle inactive merchants correctly", async () => {
    // Create inactive merchant
    await prisma.merchant.create({
      data: {
        name: "Inactive Restaurant",
        slug: "inactive",
        description: "This restaurant is inactive",
        isActive: false,
      },
    });

    // Create active merchant
    await prisma.merchant.create({
      data: {
        name: "Uuno Pizza",
        slug: "uuno",
        description: "Active restaurant",
        isActive: true,
      },
    });

    // Homepage should only find active merchants
    const firstActiveMerchant = await prisma.merchant.findFirst({
      where: { isActive: true },
    });

    expect(firstActiveMerchant).toBeDefined();
    expect(firstActiveMerchant?.slug).toBe("uuno");
    expect(firstActiveMerchant?.isActive).toBe(true);
  });

  test("should handle no active merchants scenario", async () => {
    // Create only inactive merchants
    await prisma.merchant.create({
      data: {
        name: "Inactive Restaurant",
        slug: "inactive",
        description: "This restaurant is inactive",
        isActive: false,
      },
    });

    // Homepage should find no active merchants
    const firstActiveMerchant = await prisma.merchant.findFirst({
      where: { isActive: true },
    });

    expect(firstActiveMerchant).toBeNull();

    // In this case, the homepage would show the fallback message
    // "No restaurants available at the moment. Please check back later."
  });

  test("should create deterministic test data for Uuno", async () => {
    // This creates the same data structure that would be used in all tests
    const merchant = await prisma.merchant.create({
      data: {
        name: "Uuno Pizza",
        slug: "uuno",
        description: "Authentic Finnish pizza and grill",
        isActive: true,
      },
    });

    // Verify the data is consistent and deterministic
    expect(merchant.name).toBe("Uuno Pizza");
    expect(merchant.slug).toBe("uuno");
    expect(merchant.description).toBe("Authentic Finnish pizza and grill");
    expect(merchant.isActive).toBe(true);
    expect(merchant.id).toBeDefined();
    expect(typeof merchant.id).toBe("string");
    expect(merchant.createdAt).toBeInstanceOf(Date);
    expect(merchant.updatedAt).toBeInstanceOf(Date);
  });
});
