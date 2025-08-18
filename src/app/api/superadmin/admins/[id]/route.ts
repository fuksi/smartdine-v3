import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminAuth } from "@/lib/superadmin-auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdminAuth(request);
    const { id } = await params;

    const admin = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Get admin error:", error);
    return NextResponse.json(
      { error: "Unauthorized or server error" },
      { status: 401 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdminAuth(request);
    const { id } = await params;

    const { isActive, locationId, role } = await request.json();

    const admin = await prisma.adminUser.update({
      where: { id },
      data: {
        ...(typeof isActive === "boolean" && { isActive }),
        ...(locationId && { locationId }),
        ...(role && { role }),
      },
      include: {
        location: {
          include: {
            merchant: true,
          },
        },
      },
    });

    return NextResponse.json(admin);
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdminAuth(request);
    const { id } = await params;

    await prisma.adminUser.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
