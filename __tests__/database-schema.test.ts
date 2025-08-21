import { prisma } from "./test-utils";

describe("Database Schema - Basic Functionality", () => {
  test("should create merchant", async () => {
    const merchant = await prisma.merchant.create({
      data: {
        name: "Test Restaurant",
        slug: "test-restaurant",
        description: "A test restaurant",
        address: "123 Test Street, Test City",
        isActive: true,
      },
    });

    expect(merchant).toHaveProperty("id");
    expect(merchant.name).toBe("Test Restaurant");
    expect(merchant.slug).toBe("test-restaurant");
    expect(merchant.address).toBe("123 Test Street, Test City");
    expect(merchant.isActive).toBe(true);
  });

  test("should create customer", async () => {
    const customer = await prisma.customer.create({
      data: {
        phone: "+1234567890",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    });

    expect(customer).toHaveProperty("id");
    expect(customer.firstName).toBe("John");
    expect(customer.lastName).toBe("Doe");
    expect(customer.email).toBe("john@example.com");
    expect(customer.phone).toBe("+1234567890");
  });

  test("should find merchant by slug", async () => {
    // Create merchant
    await prisma.merchant.create({
      data: {
        name: "Uuno Pizza",
        slug: "uuno",
        description: "Authentic Finnish pizza",
        address: "789 Uuno Street, Pizza City",
        isActive: true,
      },
    });

    const foundMerchant = await prisma.merchant.findUnique({
      where: { slug: "uuno" },
    });

    expect(foundMerchant).not.toBeNull();
    expect(foundMerchant?.name).toBe("Uuno Pizza");
    expect(foundMerchant?.slug).toBe("uuno");
  });

  test("should create superadmin", async () => {
    const superAdmin = await prisma.superAdmin.create({
      data: {
        email: "admin@example.com",
      },
    });

    expect(superAdmin).toHaveProperty("id");
    expect(superAdmin.email).toBe("admin@example.com");
    expect(superAdmin.isActive).toBe(true);
  });

  test("should verify database connection", async () => {
    const merchantCount = await prisma.merchant.count();
    expect(typeof merchantCount).toBe("number");
    expect(merchantCount).toBeGreaterThanOrEqual(0);
  });
});
