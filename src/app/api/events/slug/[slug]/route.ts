import { NextRequest, NextResponse } from "next/server";

const EVENTS_API = process.env.EVENTS_SERVICE_URL || "http://localhost:4001/api/events";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const res = await fetch(`${EVENTS_API}/slug/${params.slug}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch event", message: error.message }, { status: 500 });
  }
}
