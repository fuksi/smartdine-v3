import { NextRequest, NextResponse } from "next/server";
import {
  logoutCustomer,
  getCustomerFromRequest,
} from "@/lib/auth/customer-auth";

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerFromRequest(request);

    if (!customer) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.substring(7); // Remove "Bearer "

    if (token) {
      await logoutCustomer(token);
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
