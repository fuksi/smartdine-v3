import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/admin/stamps/claim - Claim stamps (mark stamps as claimed for reward)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stampCardId, claimCount } = body;

    if (!stampCardId || !claimCount) {
      return NextResponse.json(
        { error: "Stamp card ID and claim count are required" },
        { status: 400 }
      );
    }

    // Get stampcard to check if it has enough unclaimed stamps
    const stampCard = await prisma.stampCard.findFirst({
      where: { id: stampCardId, isDeleted: false },
      include: {
        stamps: {
          where: { isDeleted: false },
        },
      },
    });

    if (!stampCard) {
      return NextResponse.json(
        { error: "Stamp card not found" },
        { status: 404 }
      );
    }

    const unclaimedStamps = stampCard.stamps.filter(
      (stamp) => !stamp.isClaimed
    );

    if (unclaimedStamps.length < claimCount) {
      return NextResponse.json(
        {
          error: `Not enough stamps to claim. Available: ${unclaimedStamps.length}, Required: ${claimCount}`,
        },
        { status: 400 }
      );
    }

    // Mark the required number of stamps as claimed
    const stampsToClaimIds = unclaimedStamps
      .slice(0, claimCount)
      .map((stamp) => stamp.id);

    await prisma.stamp.updateMany({
      where: {
        id: {
          in: stampsToClaimIds,
        },
      },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      claimedStamps: claimCount,
      message: `Successfully claimed ${claimCount} stamps`,
    });
  } catch (error) {
    console.error("Error claiming stamps:", error);
    return NextResponse.json(
      { error: "Failed to claim stamps" },
      { status: 500 }
    );
  }
}
