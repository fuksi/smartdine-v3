import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST assign option to product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Check if option exists
    const option = await prisma.productOption.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if option is already assigned to another product
    if (option.productId && option.productId !== productId) {
      return NextResponse.json(
        { error: "Option is already assigned to another product" },
        { status: 400 }
      );
    }

    // Assign option to product
    await prisma.productOption.update({
      where: { id: optionId },
      data: { productId },
    });

    return NextResponse.json({
      success: true,
      message: "Option assigned to product successfully",
    });
  } catch (error) {
    console.error("Error assigning option to product:", error);
    return NextResponse.json(
      { error: "Failed to assign option to product" },
      { status: 500 }
    );
  }
}

// DELETE unassign option from product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);
    const optionId = searchParams.get("optionId");

    if (!optionId) {
      return NextResponse.json(
        { error: "Option ID is required" },
        { status: 400 }
      );
    }

    // Check if option exists and is assigned to this product
    const option = await prisma.productOption.findFirst({
      where: {
        id: optionId,
        productId: productId,
      },
    });

    if (!option) {
      return NextResponse.json(
        { error: "Option not found or not assigned to this product" },
        { status: 404 }
      );
    }

    // Check if option is used in any orders
    const orderItemOptions = await prisma.orderItemOption.findFirst({
      where: { optionId },
    });

    if (orderItemOptions) {
      return NextResponse.json(
        { error: "Cannot unassign option that has been used in orders" },
        { status: 400 }
      );
    }

    // Unassign option from product (make it standalone again)
    await prisma.$executeRaw`UPDATE product_options SET productId = NULL WHERE id = ${optionId}`;

    return NextResponse.json({
      success: true,
      message: "Option unassigned from product successfully",
    });
  } catch (error) {
    console.error("Error unassigning option from product:", error);
    return NextResponse.json(
      { error: "Failed to unassign option from product" },
      { status: 500 }
    );
  }
}
