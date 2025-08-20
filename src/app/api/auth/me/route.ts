import { NextRequest, NextResponse } from "next/server";
import { getCustomerFromRequest } from "@/lib/auth/customer-auth";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);

    if (!customer) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer info error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
