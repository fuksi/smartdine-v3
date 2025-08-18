import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all options (standalone options not tied to specific products)
export async function GET() {
  try {
    const options = await prisma.productOption.findMany({
      include: {
        optionValues: {
          orderBy: { sortOrder: "asc" },
        },
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({
      success: true,
      options,
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}

// POST create new standalone option (not tied to a specific product)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, isRequired, sortOrder } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!["RADIO", "MULTISELECT"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be RADIO or MULTISELECT" },
        { status: 400 }
      );
    }

    // Create standalone option (not tied to a specific product initially)
    const option = await prisma.productOption.create({
      data: {
        name,
        description,
        type,
        isRequired: isRequired || false,
        sortOrder: sortOrder || 0,
        // productId is optional for standalone options
      },
      include: {
        optionValues: {
          orderBy: { sortOrder: "asc" },
        },
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      option,
    });
  } catch (error) {
    console.error("Error creating option:", error);
    return NextResponse.json(
      { error: "Failed to create option" },
      { status: 500 }
    );
  }
}
