import { NextRequest } from 'next/server';
import { validateImageBuffer } from '@/lib/image/validator';
import { convertJpgToPng } from '@/lib/image/processor';
import { saveTempImage } from '@/lib/image/temp-store';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { imageProcessingGate } from '@/lib/security/concurrency';
import { apiError, apiSuccess } from '@/lib/security/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return apiError(
        `Too many requests. Please slow down and try again in ${rate.resetTime} seconds.`,
        429,
        { 'Retry-After': rate.resetTime.toString() }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return apiError('No image file was provided.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 1. Validation - only JPEG accepted
    const validation = await validateImageBuffer(inputBuffer, ['image/jpeg']);
    if (!validation.valid || !validation.width || !validation.height) {
      return apiError(validation.error || 'Please provide a valid JPG/JPEG image.');
    }

    // 2. Concurrency Guard & Processing
    const release = await imageProcessingGate.acquire();
    let result;
    try {
      result = await convertJpgToPng(inputBuffer);
    } finally {
      release();
    }

    // 3. Ephemeral Save
    const stored = await saveTempImage(result.data, {
      originalName: file.name || 'image',
      targetExt: 'png',
      mime: 'image/png',
      format: 'png',
      width: result.width,
      height: result.height,
    });

    return apiSuccess({
      fileId: stored.id,
      downloadUrl: `/api/image/download/${stored.id}`,
      filename: stored.sanitizedFilename,
      mime: stored.mime,
      format: stored.format,
      originalSize: inputBuffer.length,
      newSize: result.sizeBytes,
      width: result.width,
      height: result.height,
      previewUrl: `data:${result.mime};base64,${result.data.toString('base64')}`,
    });
  } catch {
    return apiError('An error occurred while converting your JPG to PNG. Please try again.');
  }
}
