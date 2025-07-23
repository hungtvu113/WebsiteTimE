import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      apiKey: apiKey,
      success: true
    });

  } catch (error) {
    console.error('API Key route error:', error);
    return NextResponse.json(
      { 
        error: 'Đã có lỗi xảy ra khi lấy API key.',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
