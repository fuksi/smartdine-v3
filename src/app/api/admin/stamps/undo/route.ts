import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/admin/stamps/undo - Undo last stamp (soft delete)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stampCardId } = body;

    if (!stampCardId) {
      return NextResponse.json(
        { error: "Stamp card ID is required" },
        { status: 400 }
      );
    }

    // Find the most recent non-deleted stamp
    const lastStamp = await prisma.stamp.findFirst({
      where: {
        stampCardId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!lastStamp) {
      return NextResponse.json(
        { error: "No stamps found to undo" },
        { status: 404 }
      );
    }

    // Soft delete the stamp
    await prisma.stamp.update({
      where: { id: lastStamp.id },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      success: true,
      deletedStamp: lastStamp,
    });
  } catch (error) {
    console.error("Error undoing stamp:", error);
    return NextResponse.json(
      { error: "Failed to undo stamp" },
      { status: 500 }
    );
  }
}
