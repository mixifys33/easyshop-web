import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

function getToken(cookieStore: Awaited<ReturnType<typeof cookies>>, req: NextRequest) {
  return cookieStore.get("access_token")?.value
    || req.headers.get("authorization")?.replace("Bearer ", "")
    || "";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = getToken(cookieStore, request);
    const body = await request.json();

    const res = await fetch(`${BACKEND}/api/user/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Update address error:", error?.message);
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = getToken(cookieStore, request);

    const res = await fetch(`${BACKEND}/api/user/addresses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Delete address error:", error?.message);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}
