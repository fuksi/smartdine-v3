import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminAuth } from "@/lib/superadmin-auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireSuperAdminAuth(request);
    return NextResponse.json(admin);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
