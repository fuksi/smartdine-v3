import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET available standalone options that can be assigned to a product
export async function GET() {
  try {
    // For now, get all options and filter client-side until Prisma client is regenerated
    const allOptions = await prisma.productOption.findMany({
      include: {
        optionValues: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });

    // Filter for standalone options (not assigned to products)
    const availableOptions = allOptions.filter((option) => !option.productId);

    return NextResponse.json({
      success: true,
      options: availableOptions,
    });
  } catch (error) {
    console.error("Error fetching available options:", error);
    return NextResponse.json(
      { error: "Failed to fetch available options" },
      { status: 500 }
    );
  }
}
