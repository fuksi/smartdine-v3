import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; valueId: string }> }
) {
  try {
    const { valueId } = await params;
    const body = await request.json();
    const { name, priceModifier, isDefault, sortOrder } = body;

    const value = await prisma.productOptionValue.update({
      where: { id: valueId },
      data: {
        ...(name !== undefined && { name }),
        ...(priceModifier !== undefined && { priceModifier }),
        ...(isDefault !== undefined && { isDefault }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({
      success: true,
      value,
    });
  } catch (error) {
    console.error("Error updating option value:", error);
    return NextResponse.json(
      { error: "Failed to update option value" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; valueId: string }> }
) {
  try {
    const { valueId } = await params;

    await prisma.productOptionValue.delete({
      where: { id: valueId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting option value:", error);
    return NextResponse.json(
      { error: "Failed to delete option value" },
      { status: 500 }
    );
  }
}
