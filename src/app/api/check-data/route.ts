import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Check merchants
    const merchants = await prisma.merchant.findMany({
      include: {
        locations: {
          include: {
            adminUsers: true,
          },
        },
      },
    });

    // Check for specific test admin
    const testAdmin = await prisma.adminUser.findUnique({
      where: { email: "test@outlook.com" },
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    // Count total admin users
    const totalAdmins = await prisma.adminUser.count();

    return NextResponse.json({
      success: true,
      data: {
        merchants: merchants.map((m) => ({
          name: m.name,
          slug: m.slug,
          locations: m.locations.map((l) => ({
            name: l.name,
            slug: l.slug,
            adminUsers: l.adminUsers.map((a) => ({
              email: a.email,
              isActive: a.isActive,
            })),
          })),
        })),
        testAdminExists: !!testAdmin,
        testAdmin: testAdmin
          ? {
              email: testAdmin.email,
              isActive: testAdmin.isActive,
              location: testAdmin.location?.name || "Unknown",
              merchant: testAdmin.location?.merchant?.name || "Unknown",
            }
          : null,
        totalAdmins,
      },
    });
  } catch (error) {
    console.error("Error checking data:", error);
    return NextResponse.json(
      {
        error: "Failed to check data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
