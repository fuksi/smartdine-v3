import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminAuth } from "@/lib/superadmin-auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdminAuth(request);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where = search
      ? {
          email: {
            contains: search,
          },
        }
      : {};

    const [admins, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        include: {
          location: {
            include: {
              merchant: true,
            },
          },
          merchant: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.adminUser.count({ where }),
    ]);

    return NextResponse.json({
      admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdminAuth(request);

    const { email, merchantId, locationId, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate role
    if (!["LOCATION_ADMIN", "MERCHANT_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // For LOCATION_ADMIN, locationId is required
    if (role === "LOCATION_ADMIN" && !locationId) {
      return NextResponse.json(
        { error: "Location ID is required for location admin" },
        { status: 400 }
      );
    }

    // For MERCHANT_ADMIN, merchantId is required
    if (role === "MERCHANT_ADMIN" && !merchantId) {
      return NextResponse.json(
        { error: "Merchant ID is required for merchant admin" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.create({
      data: {
        email,
        merchantId: role === "MERCHANT_ADMIN" ? merchantId : null,
        locationId: role === "LOCATION_ADMIN" ? locationId : null,
        role,
        isActive: true,
      },
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
        merchant: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
