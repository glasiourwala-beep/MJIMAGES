import { NextRequest } from 'next/server';
import { getTempImage } from '@/lib/image/temp-store';
import { createDownloadResponse, apiError } from '@/lib/security/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return apiError('Missing file identifier.', 400);
    }

    const item = await getTempImage(id);
    if (!item) {
      return apiError(
        'The requested image download has expired or does not exist. Images are stored ephemerally for privacy and security.',
        404
      );
    }

    return createDownloadResponse(item.buffer, item.info.sanitizedFilename, item.info.mime);
  } catch {
    return apiError('An error occurred while retrieving your file.', 500);
  }
}
