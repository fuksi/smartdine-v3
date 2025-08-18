import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get the first active location's menu for now
    const location = await prisma.merchantLocation.findFirst({
      where: { isActive: true },
    });

    if (!location) {
      return NextResponse.json(
        { error: "No active location found" },
        { status: 404 }
      );
    }

    const menu = await prisma.menu.findFirst({
      where: { locationId: location.id },
      include: {
        categories: {
          include: {
            products: {
              include: {
                options: {
                  include: {
                    optionValues: true,
                  },
                  orderBy: { sortOrder: "asc" },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
