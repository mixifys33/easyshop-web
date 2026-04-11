import { NextRequest, NextResponse } from "next/server";

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:5770";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}`);
    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order", error: error.message },
      { status: 500 }
    );
  }
}
