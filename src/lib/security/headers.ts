import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}

export function apiSuccess<T>(data: T, status = 200, headersInit?: Record<string, string>): NextResponse {
  return NextResponse.json(
    { success: true, data } as ApiSuccessResponse<T>,
    {
      status,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        ...(headersInit || {}),
      },
    }
  );
}

export function apiError(message: string, status = 400, headersInit?: Record<string, string>): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiErrorResponse,
    {
      status,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        ...(headersInit || {}),
      },
    }
  );
}

export function createDownloadResponse(
  buffer: Buffer,
  filename: string,
  mime: string
): NextResponse {
  // Sanitize filename to only ASCII alphanumeric, dash, dot, underscore
  const safeFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

  const headers = new Headers();
  headers.set('Content-Type', mime || 'application/octet-stream');
  headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
  headers.set('Content-Length', buffer.length.toString());
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  // Convert Buffer to Uint8Array for web Response compliance
  const uint8Array = new Uint8Array(buffer);
  return new NextResponse(uint8Array, {
    status: 200,
    headers,
  });
}
