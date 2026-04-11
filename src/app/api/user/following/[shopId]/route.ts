import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:6001";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: true, isFollowing: false },
        { status: 200 }
      );
    }

    const res = await fetch(`${AUTH_SERVICE_URL}/api/user/following/${shopId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `access_token=${token}`,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Check following error:", error);
    return NextResponse.json(
      { success: true, isFollowing: false },
      { status: 200 }
    );
  }
}
