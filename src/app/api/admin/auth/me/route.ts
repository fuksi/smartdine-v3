import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/utils";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    const adminUser = await verifyAdminSession(token);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: adminUser,
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { error: "Session verification failed" },
      { status: 500 }
    );
  }
}
