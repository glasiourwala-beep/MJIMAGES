import { NextRequest } from 'next/server';
import { validateImageBuffer } from '@/lib/image/validator';
import { cropImage } from '@/lib/image/processor';
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
    const leftRaw = formData.get('left');
    const topRaw = formData.get('top');
    const widthRaw = formData.get('width');
    const heightRaw = formData.get('height');

    if (!file) {
      return apiError('No image file was provided.');
    }

    const left = leftRaw ? parseFloat(leftRaw.toString()) : 0;
    const top = topRaw ? parseFloat(topRaw.toString()) : 0;
    const width = widthRaw ? parseFloat(widthRaw.toString()) : 0;
    const height = heightRaw ? parseFloat(heightRaw.toString()) : 0;

    if (width <= 0 || height <= 0) {
      return apiError('Crop width and height must be greater than zero.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 1. Validation
    const validation = await validateImageBuffer(inputBuffer);
    if (!validation.valid || !validation.width || !validation.height) {
      return apiError(validation.error || 'Invalid image file.');
    }

    // 2. Concurrency Guard & Processing
    const release = await imageProcessingGate.acquire();
    let result;
    try {
      result = await cropImage(inputBuffer, { left, top, width, height });
    } finally {
      release();
    }

    // 3. Ephemeral Save
    const stored = await saveTempImage(result.data, {
      originalName: file.name || 'cropped-image',
      targetExt: result.format,
      mime: result.mime,
      format: result.format,
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
    return apiError('An error occurred while cropping your image. Please try again.');
  }
}
