import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parsePhoneNumber } from "libphonenumber-js";

const prisma = new PrismaClient();

// GET /api/admin/stampcards - Search stampcards or get recent ones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneQuery = searchParams.get("phone");
    const recent = searchParams.get("recent");
    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    let stampCards;

    if (recent === "true") {
      // Get last 30 created stampcards
      stampCards = await prisma.stampCard.findMany({
        where: {
          locationId,
          isDeleted: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
        include: {
          stamps: {
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else if (phoneQuery) {
      // Search by phone number (loose search)
      stampCards = await prisma.stampCard.findMany({
        where: {
          locationId,
          isDeleted: false,
          phoneNumber: {
            contains: phoneQuery,
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          stamps: {
            where: { isDeleted: false },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else {
      // Return empty array if no search criteria
      stampCards = [];
    }

    // Calculate stamp counts for each card
    const stampCardsWithCounts = stampCards.map((card) => {
      const totalStamps = card.stamps.length;
      const claimedStamps = card.stamps.filter(
        (stamp) => stamp.isClaimed
      ).length;
      const unclaimedStamps = totalStamps - claimedStamps;
      const canClaim = unclaimedStamps >= card.stampsRequired;

      return {
        ...card,
        totalStamps,
        claimedStamps,
        unclaimedStamps,
        canClaim,
      };
    });

    return NextResponse.json(stampCardsWithCounts);
  } catch (error) {
    console.error("Error fetching stampcards:", error);
    return NextResponse.json(
      { error: "Failed to fetch stampcards" },
      { status: 500 }
    );
  }
}

// POST /api/admin/stampcards - Create a new stampcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, firstName, locationId, stampsRequired = 10 } = body;

    if (!phoneNumber || !firstName || !locationId) {
      return NextResponse.json(
        { error: "Phone number, first name, and location ID are required" },
        { status: 400 }
      );
    }

    // Validate and format phone number
    let formattedPhone;
    try {
      const parsed = parsePhoneNumber(phoneNumber);
      if (!parsed || !parsed.isValid()) {
        return NextResponse.json(
          { error: "Invalid phone number" },
          { status: 400 }
        );
      }
      formattedPhone = parsed.format("E.164");
    } catch {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check if stampcard already exists for this phone number and location
    const existingCard = await prisma.stampCard.findUnique({
      where: {
        locationId_phoneNumber: {
          locationId,
          phoneNumber: formattedPhone,
        },
        isDeleted: false,
      },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: "Stampcard already exists for this phone number" },
        { status: 409 }
      );
    }

    const stampCard = await prisma.stampCard.create({
      data: {
        phoneNumber: formattedPhone,
        firstName,
        locationId,
        stampsRequired,
      },
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
    console.error("Error creating stampcard:", error);
    return NextResponse.json(
      { error: "Failed to create stampcard" },
      { status: 500 }
    );
  }
}
