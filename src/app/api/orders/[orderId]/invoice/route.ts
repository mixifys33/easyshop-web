import { NextRequest, NextResponse } from 'next/server';

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:6004';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    // Call order service to generate invoice PDF
    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/invoice`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate invoice' }));
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to generate invoice' },
        { status: response.status }
      );
    }

    // Get the PDF buffer
    const pdfBuffer = await response.arrayBuffer();

    // Return PDF with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${orderId}.pdf`,
      },
    });
  } catch (error: any) {
    console.error('Invoice generation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
