import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PUT /api/admin/stampcards/[id] - Update stampcard (edit first name)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { firstName } = body;

    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    const stampCard = await prisma.stampCard.update({
      where: { id, isDeleted: false },
      data: { firstName },
      include: {
        stamps: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Add counts
    const totalStamps = stampCard.stamps.length;
    const claimedStamps = stampCard.stamps.filter(
      (stamp) => stamp.isClaimed
    ).length;
    const unclaimedStamps = totalStamps - claimedStamps;
    const canClaim = unclaimedStamps >= stampCard.stampsRequired;

    return NextResponse.json({
      ...stampCard,
      totalStamps,
      claimedStamps,
      unclaimedStamps,
      canClaim,
    });
  } catch (error) {
    console.error("Error updating stampcard:", error);
    return NextResponse.json(
      { error: "Failed to update stampcard" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/stampcards/[id] - Soft delete stampcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.stampCard.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stampcard:", error);
    return NextResponse.json(
      { error: "Failed to delete stampcard" },
      { status: 500 }
    );
  }
}
