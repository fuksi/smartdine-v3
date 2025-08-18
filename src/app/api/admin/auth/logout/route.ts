import { NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/auth/utils";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (token) {
      await logoutAdmin(token);
    }

    // Clear cookie
    cookieStore.delete("admin_token");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
