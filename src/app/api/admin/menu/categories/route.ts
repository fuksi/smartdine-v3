import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, sortOrder, isActive, canShip, menuId } = body;

    if (!name || !menuId) {
      return NextResponse.json(
        { error: "Name and menuId are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        menuId,
        name,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true,
        canShip: canShip ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
