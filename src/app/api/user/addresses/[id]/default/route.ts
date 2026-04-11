import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value
      || request.headers.get("authorization")?.replace("Bearer ", "")
      || "";

    const res = await fetch(`${BACKEND}/api/user/addresses/${id}/default`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Set default address error:", error?.message);
    return NextResponse.json({ success: false, error: "Failed to set default address" }, { status: 500 });
  }
}
