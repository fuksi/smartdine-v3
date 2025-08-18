import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, isRequired, sortOrder, productId } = body;

    if (!name || !type || !productId) {
      return NextResponse.json(
        { error: "Name, type, and productId are required" },
        { status: 400 }
      );
    }

    const validTypes = ["RADIO", "CHECKBOX", "MULTISELECT"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be RADIO, CHECKBOX, or MULTISELECT" },
        { status: 400 }
      );
    }

    const option = await prisma.productOption.create({
      data: {
        productId,
        name,
        description: description || null,
        type,
        isRequired: isRequired ?? false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({
      success: true,
      option,
    });
  } catch (error) {
    console.error("Error creating product option:", error);
    return NextResponse.json(
      { error: "Failed to create product option" },
      { status: 500 }
    );
  }
}
