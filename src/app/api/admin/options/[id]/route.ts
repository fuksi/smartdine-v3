import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET single option with values
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const option = await prisma.productOption.findUnique({
      where: { id },
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

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      option,
    });
  } catch (error) {
    console.error("Error fetching option:", error);
    return NextResponse.json(
      { error: "Failed to fetch option" },
      { status: 500 }
    );
  }
}

// PATCH update option
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, type, isRequired, sortOrder } = body;

    if (type && !["RADIO", "MULTISELECT"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be RADIO or MULTISELECT" },
        { status: 400 }
      );
    }

    const option = await prisma.productOption.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(isRequired !== undefined && { isRequired }),
        ...(sortOrder !== undefined && { sortOrder }),
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
    console.error("Error updating option:", error);
    return NextResponse.json(
      { error: "Failed to update option" },
      { status: 500 }
    );
  }
}

// DELETE option
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if option is used in any orders
    const orderItemOptions = await prisma.orderItemOption.findFirst({
      where: { optionId: id },
    });

    if (orderItemOptions) {
      return NextResponse.json(
        { error: "Cannot delete option that has been used in orders" },
        { status: 400 }
      );
    }

    await prisma.productOption.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting option:", error);
    return NextResponse.json(
      { error: "Failed to delete option" },
      { status: 500 }
    );
  }
}
