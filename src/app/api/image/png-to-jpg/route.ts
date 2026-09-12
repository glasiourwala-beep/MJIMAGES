import { NextRequest } from 'next/server';
import { validateImageBuffer } from '@/lib/image/validator';
import { convertPngToJpg } from '@/lib/image/processor';
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
    const qualityRaw = formData.get('quality');
    const bgColorRaw = formData.get('backgroundColor') as string | null;

    if (!file) {
      return apiError('No image file was provided.');
    }

    const quality = qualityRaw ? parseInt(qualityRaw.toString(), 10) : 90;
    // Validate hex background color e.g. #ffffff
    let backgroundColor = '#FFFFFF';
    if (bgColorRaw && /^#([0-9A-F]{3}){1,2}$/i.test(bgColorRaw)) {
      backgroundColor = bgColorRaw;
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // 1. Validation - only PNG accepted
    const validation = await validateImageBuffer(inputBuffer, ['image/png']);
    if (!validation.valid || !validation.width || !validation.height) {
      return apiError(validation.error || 'Please provide a valid PNG image.');
    }

    // 2. Concurrency Guard & Processing
    const release = await imageProcessingGate.acquire();
    let result;
    try {
      result = await convertPngToJpg(inputBuffer, { quality, backgroundColor });
    } finally {
      release();
    }

    // 3. Ephemeral Save
    const stored = await saveTempImage(result.data, {
      originalName: file.name || 'image',
      targetExt: 'jpg',
      mime: 'image/jpeg',
      format: 'jpeg',
      width: result.width,
      height: result.height,
    });

    const originalSize = inputBuffer.length;
    const newSize = result.sizeBytes;
    const percentSaved = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

    return apiSuccess({
      fileId: stored.id,
      downloadUrl: `/api/image/download/${stored.id}`,
      filename: stored.sanitizedFilename,
      mime: stored.mime,
      format: stored.format,
      originalSize,
      newSize,
      percentSaved,
      width: result.width,
      height: result.height,
      previewUrl: `data:${result.mime};base64,${result.data.toString('base64')}`,
    });
  } catch {
    return apiError('An error occurred while converting your PNG to JPG. Please try again.');
  }
}
