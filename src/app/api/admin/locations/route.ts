import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get all active merchant locations
export async function GET() {
  try {
    const locations = await prisma.merchantLocation.findMany({
      where: { isActive: true },
      include: {
        merchant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
