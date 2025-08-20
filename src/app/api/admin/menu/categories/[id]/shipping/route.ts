import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { canShip, updateProducts = false } = body;

    // Update the category shipping status
    const category = await prisma.category.update({
      where: { id },
      data: { canShip },
    });

    // If updateProducts is true, also update all products in this category
    if (updateProducts) {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { canShip },
      });
    }

    return NextResponse.json({
      success: true,
      category,
      message: updateProducts
        ? "Category and all its products shipping status updated"
        : "Category shipping status updated",
    });
  } catch (error) {
    console.error("Error updating category shipping:", error);
    return NextResponse.json(
      { error: "Failed to update category shipping" },
      { status: 500 }
    );
  }
}
