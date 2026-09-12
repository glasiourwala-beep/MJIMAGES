import { NextRequest } from 'next/server';
import { validateImageBuffer } from '@/lib/image/validator';
import { convertImageFormat } from '@/lib/image/processor';
import { saveTempImage } from '@/lib/image/temp-store';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { imageProcessingGate } from '@/lib/security/concurrency';
import { apiError, apiSuccess } from '@/lib/security/headers';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_TARGETS = ['jpeg', 'png', 'webp', 'avif', 'tiff'] as const;

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
    const targetFormatRaw = (formData.get('targetFormat') as string || 'jpeg').toLowerCase();
    const qualityRaw = formData.get('quality');
    const bgColorRaw = formData.get('backgroundColor') as string | null;

    if (!file) {
      return apiError('No image file was provided.');
    }

    const targetFormat = (targetFormatRaw === 'jpg' ? 'jpeg' : targetFormatRaw) as typeof ALLOWED_TARGETS[number];
    if (!ALLOWED_TARGETS.includes(targetFormat)) {
      return apiError(`Unsupported target format '${targetFormatRaw}'. Choose from: jpg, png, webp, avif, tiff.`);
    }

    const quality = qualityRaw ? parseInt(qualityRaw.toString(), 10) : 85;
    let backgroundColor = '#FFFFFF';
    if (bgColorRaw && /^#([0-9A-F]{3}){1,2}$/i.test(bgColorRaw)) {
      backgroundColor = bgColorRaw;
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
      result = await convertImageFormat(inputBuffer, {
        targetFormat,
        quality,
        backgroundColor,
      });
    } finally {
      release();
    }

    // 3. Ephemeral Save
    const stored = await saveTempImage(result.data, {
      originalName: file.name || 'image',
      targetExt: result.format === 'jpeg' ? 'jpg' : result.format,
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
    return apiError('An error occurred while converting your image. Please try again.');
  }
}
