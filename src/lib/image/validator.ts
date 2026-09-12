import sharp from 'sharp';

export interface ValidationResult {
  valid: boolean;
  format?: string;
  mime?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  error?: string;
}

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_DIMENSION_PX = 8000;
export const MAX_TOTAL_PIXELS = 50_000_000; // 50 Megapixels

// Magic Byte Signatures
const SIGNATURES: { format: string; mime: string; check: (b: Buffer) => boolean }[] = [
  {
    format: 'jpeg',
    mime: 'image/jpeg',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    format: 'png',
    mime: 'image/png',
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    format: 'webp',
    mime: 'image/webp',
    check: (b) =>
      b.length >= 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  },
  {
    format: 'avif',
    mime: 'image/avif',
    check: (b) => {
      if (b.length < 12) return false;
      const brand = b.toString('ascii', 4, 12);
      return brand.includes('ftyp') && (brand.includes('avif') || brand.includes('avis') || b.toString('ascii', 8, 12) === 'avif');
    },
  },
  {
    format: 'tiff',
    mime: 'image/tiff',
    check: (b) =>
      b.length >= 4 &&
      ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
        (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)),
  },
  {
    format: 'gif',
    mime: 'image/gif',
    check: (b) =>
      b.length >= 6 &&
      (b.toString('ascii', 0, 6) === 'GIF87a' || b.toString('ascii', 0, 6) === 'GIF89a'),
  },
];

/**
 * Validates the binary buffer of an uploaded image file against size limits,
 * magic byte signatures, Sharp decoding limits, and decompression bomb thresholds.
 */
export async function validateImageBuffer(
  buffer: Buffer,
  allowedMimes?: string[]
): Promise<ValidationResult> {
  // 1. Buffer existence and size limit
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'The uploaded file is empty.' };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `The file exceeds the maximum allowed size of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  // 2. Magic byte signature verification
  const matchedSig = SIGNATURES.find((sig) => sig.check(buffer));
  if (!matchedSig) {
    return {
      valid: false,
      error: 'Unsupported file format or corrupted file signature.',
    };
  }

  // 3. Allowed MIME type filter
  if (allowedMimes && allowedMimes.length > 0 && !allowedMimes.includes(matchedSig.mime)) {
    return {
      valid: false,
      error: `Format '${matchedSig.format.toUpperCase()}' is not accepted for this tool. Expected: ${allowedMimes.map((m) => m.replace('image/', '.')).join(', ')}.`,
    };
  }

  // 4. Decode metadata via Sharp with resource boundaries
  try {
    const metadata = await sharp(buffer, {
      failOnError: true,
      limitInputPixels: MAX_TOTAL_PIXELS,
    }).metadata();

    if (!metadata.width || !metadata.height) {
      return { valid: false, error: 'Unable to parse image dimensions. File may be malformed.' };
    }

    if (metadata.width > MAX_DIMENSION_PX || metadata.height > MAX_DIMENSION_PX) {
      return {
        valid: false,
        error: `Image dimensions (${metadata.width}x${metadata.height}) exceed the maximum permitted limit of ${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}px.`,
      };
    }

    const totalPixels = metadata.width * metadata.height;
    if (totalPixels > MAX_TOTAL_PIXELS) {
      return {
        valid: false,
        error: 'Image total pixel count is excessively large (potential decompression hazard).',
      };
    }

    return {
      valid: true,
      format: metadata.format || matchedSig.format,
      mime: matchedSig.mime,
      width: metadata.width,
      height: metadata.height,
      sizeBytes: buffer.length,
    };
  } catch {
    return {
      valid: false,
      error: 'Failed to safely parse the image data. The file may be damaged or invalid.',
    };
  }
}

/**
 * Sanitizes and normalizes a downloaded filename to prevent path traversal or injection.
 */
export function sanitizeFilename(rawName: string, fallbackBase = 'mjimage-output', targetExt = 'jpg'): string {
  if (!rawName) return `${fallbackBase}.${targetExt}`;
  
  // Strip paths
  const base = rawName.replace(/^.*[\\/]/, '');
  // Remove dangerous characters
  const cleanBase = base.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  // Strip multiple extensions
  const nameWithoutExt = cleanBase.replace(/\.[^/.]+$/, '');
  
  const finalExt = targetExt.startsWith('.') ? targetExt.slice(1) : targetExt;
  return `${nameWithoutExt || fallbackBase}.${finalExt}`;
}
