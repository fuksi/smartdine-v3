import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/admin/stamps - Add a stamp to a stampcard
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

    // Verify stampcard exists and is not deleted
    const stampCard = await prisma.stampCard.findFirst({
      where: { id: stampCardId, isDeleted: false },
    });

    if (!stampCard) {
      return NextResponse.json(
        { error: "Stamp card not found" },
        { status: 404 }
      );
    }

    const stamp = await prisma.stamp.create({
      data: {
        stampCardId,
      },
    });

    return NextResponse.json(stamp);
  } catch (error) {
    console.error("Error adding stamp:", error);
    return NextResponse.json({ error: "Failed to add stamp" }, { status: 500 });
  }
}

// PUT /api/admin/stamps/[id]/claim - Claim stamps (mark multiple stamps as claimed)
export async function PUT(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const body = await request.json();
    const { stampCardId, claimCount } = body;

    if (!stampCardId || !claimCount) {
      return NextResponse.json(
        { error: "Stamp card ID and claim count are required" },
        { status: 400 }
      );
    }

    // Get unclaimed stamps
    const unclaimedStamps = await prisma.stamp.findMany({
      where: {
        stampCardId,
        isClaimed: false,
        isDeleted: false,
      },
      orderBy: { createdAt: "asc" },
      take: claimCount,
    });

    if (unclaimedStamps.length < claimCount) {
      return NextResponse.json(
        { error: "Not enough unclaimed stamps available" },
        { status: 400 }
      );
    }

    // Mark stamps as claimed
    await prisma.stamp.updateMany({
      where: {
        id: {
          in: unclaimedStamps.map((stamp) => stamp.id),
        },
      },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      claimedStamps: unclaimedStamps.length,
    });
  } catch (error) {
    console.error("Error claiming stamps:", error);
    return NextResponse.json(
      { error: "Failed to claim stamps" },
      { status: 500 }
    );
  }
}
