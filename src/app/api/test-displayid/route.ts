import { NextResponse } from "next/server";
import { generateOrderDisplayId, formatDisplayId } from "@/lib/order-utils";

export async function GET() {
  try {
    // Test generating 5 display IDs
    const displayIds = [];
    for (let i = 0; i < 5; i++) {
      const displayId = await generateOrderDisplayId();
      displayIds.push({
        raw: displayId,
        formatted: formatDisplayId(displayId),
        isValid: displayId >= 1000 && displayId <= 9999,
      });
    }

    return NextResponse.json({
      success: true,
      message: "DisplayID generation test",
      results: displayIds,
    });
  } catch (error) {
    console.error("Error testing displayId:", error);
    return NextResponse.json(
      { error: "Failed to test displayId generation" },
      { status: 500 }
    );
  }
}
