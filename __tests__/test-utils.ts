import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stampCard.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.openingHour.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.customerOTP.deleteMany();
  await prisma.customerSession.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.superAdminOTP.deleteMany();
  await prisma.superAdminSession.deleteMany();
  await prisma.superAdmin.deleteMany();
  await prisma.merchant.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
