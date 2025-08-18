import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET all option values for a specific product option
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const values = await prisma.productOptionValue.findMany({
      where: { optionId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      values,
    });
  } catch (error) {
    console.error("Error fetching option values:", error);
    return NextResponse.json(
      { error: "Failed to fetch option values" },
      { status: 500 }
    );
  }
}

// POST create new option value
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, priceModifier, isDefault, sortOrder } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const value = await prisma.productOptionValue.create({
      data: {
        name,
        priceModifier: priceModifier || 0,
        isDefault: isDefault || false,
        sortOrder: sortOrder || 0,
        optionId: id,
      },
    });

    return NextResponse.json({
      success: true,
      value,
    });
  } catch (error) {
    console.error("Error creating option value:", error);
    return NextResponse.json(
      { error: "Failed to create option value" },
      { status: 500 }
    );
  }
}
