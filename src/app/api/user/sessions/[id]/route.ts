import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_GATEWAY = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    const res = await fetch(`${API_GATEWAY}/api/user/sessions/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: `access_token=${accessToken}; refresh_token=${refreshToken}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Revoke session error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke session" },
      { status: 500 }
    );
  }
}
