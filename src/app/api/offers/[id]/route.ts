import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8080";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    
    // Try to fetch single offer first (more efficient)
    let res = await fetch(`${API_GATEWAY}/product/api/offers/public/${offerId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    let data = await res.json();
    
    // If single offer endpoint works, return it
    if (data.success && data.offer) {
      return NextResponse.json({ success: true, offer: data.offer });
    }
    
    // Fallback: Fetch all active offers and filter
    res = await fetch(`${API_GATEWAY}/product/api/offers/public/active?offerId=${offerId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    data = await res.json();
    
    if (!data.success) {
      return NextResponse.json({ success: false, error: "Offer not found" }, { status: 404 });
    }

    // Find the specific offer
    const offer = data.offers?.find((o: any) => o.id === offerId || o._id === offerId);
    
    if (!offer) {
      return NextResponse.json({ success: false, error: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    console.error("Failed to fetch offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch offer", message: error.message },
      { status: 500 }
    );
  }
}

// Track offer interaction (view, click, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    const body = await request.json();
    
    // Map 'type' to 'action' for backend compatibility
    const action = body.action || body.type || "view";
    
    const res = await fetch(`${API_GATEWAY}/product/api/offers/public/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        offerId,
        action,
        userId: body.userId,
        productId: body.productId,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to track offer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track offer" },
      { status: 500 }
    );
  }
}
