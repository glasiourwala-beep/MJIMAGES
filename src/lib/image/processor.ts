import sharp from 'sharp';

export interface ProcessResult {
  data: Buffer;
  format: string;
  mime: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export interface CompressOptions {
  quality?: number; // 1 - 100
  lossless?: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface PngToJpgOptions {
  quality?: number;
  backgroundColor?: string; // hex e.g. '#ffffff'
}

export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ConvertOptions {
  targetFormat: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff';
  quality?: number;
  backgroundColor?: string;
}

/**
 * Strips EXIF/GPS metadata by default and handles auto-orientation
 */
function createBasePipeline(buffer: Buffer) {
  return sharp(buffer, { failOnError: true }).rotate(); // auto rotate by EXIF orientation then discard EXIF
}

/**
 * Compresses an image based on its input format or requested quality
 */
export async function compressImage(
  buffer: Buffer,
  options: CompressOptions = {}
): Promise<ProcessResult> {
  const quality = Math.max(1, Math.min(100, options.quality ?? 80));
  const pipeline = createBasePipeline(buffer);
  const meta = await pipeline.metadata();
  const format = meta.format || 'jpeg';

  let outputPipeline: sharp.Sharp;
  let outMime = 'image/jpeg';
  let outFormat = 'jpeg';

  switch (format) {
    case 'png':
      outputPipeline = pipeline.png({
        quality: quality,
        compressionLevel: 9,
        palette: quality < 90,
        effort: 7,
      });
      outMime = 'image/png';
      outFormat = 'png';
      break;
    case 'webp':
      outputPipeline = pipeline.webp({
        quality: quality,
        effort: 5,
        lossless: options.lossless || false,
      });
      outMime = 'image/webp';
      outFormat = 'webp';
      break;
    case 'avif':
      outputPipeline = pipeline.avif({
        quality: quality,
        effort: 5,
        lossless: options.lossless || false,
      });
      outMime = 'image/avif';
      outFormat = 'avif';
      break;
    case 'jpeg':
    default:
      outputPipeline = pipeline.jpeg({
        quality: quality,
        mozjpeg: true,
        chromaSubsampling: '4:2:0',
      });
      outMime = 'image/jpeg';
      outFormat = 'jpeg';
      break;
  }

  const { data, info } = await outputPipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: outFormat,
    mime: outMime,
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}

/**
 * Resizes an image to target dimensions with high-quality Lanczos3 interpolation
 */
export async function resizeImage(
  buffer: Buffer,
  options: ResizeOptions
): Promise<ProcessResult> {
  const pipeline = createBasePipeline(buffer);
  const meta = await pipeline.metadata();

  let targetWidth = options.width;
  let targetHeight = options.height;

  if (!targetWidth && !targetHeight) {
    targetWidth = meta.width;
    targetHeight = meta.height;
  }

  const fitMode = options.maintainAspectRatio ? (options.fit || 'inside') : 'fill';

  const outputPipeline = pipeline.resize({
    width: targetWidth,
    height: targetHeight,
    fit: fitMode,
    withoutEnlargement: false,
    kernel: sharp.kernel.lanczos3,
  });

  const { data, info } = await outputPipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: info.format,
    mime: `image/${info.format === 'jpg' ? 'jpeg' : info.format}`,
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}

/**
 * Converts JPG to lossless PNG
 */
export async function convertJpgToPng(buffer: Buffer): Promise<ProcessResult> {
  const pipeline = createBasePipeline(buffer);
  const outputPipeline = pipeline.png({
    compressionLevel: 9,
    effort: 7,
  });

  const { data, info } = await outputPipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: 'png',
    mime: 'image/png',
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}

/**
 * Converts PNG to JPG with background flattening for transparency
 */
export async function convertPngToJpg(
  buffer: Buffer,
  options: PngToJpgOptions = {}
): Promise<ProcessResult> {
  const quality = Math.max(1, Math.min(100, options.quality ?? 90));
  const bgColor = options.backgroundColor || '#FFFFFF';

  const pipeline = createBasePipeline(buffer);
  const outputPipeline = pipeline
    .flatten({ background: bgColor })
    .jpeg({
      quality,
      mozjpeg: true,
      chromaSubsampling: '4:2:0',
    });

  const { data, info } = await outputPipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: 'jpeg',
    mime: 'image/jpeg',
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}

/**
 * Converts WebP to universal JPG
 */
export async function convertWebpToJpg(
  buffer: Buffer,
  options: { quality?: number; backgroundColor?: string } = {}
): Promise<ProcessResult> {
  const quality = Math.max(1, Math.min(100, options.quality ?? 90));
  const bgColor = options.backgroundColor || '#FFFFFF';

  const pipeline = createBasePipeline(buffer);
  const outputPipeline = pipeline
    .flatten({ background: bgColor })
    .jpeg({
      quality,
      mozjpeg: true,
      chromaSubsampling: '4:2:0',
    });

  const { data, info } = await outputPipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: 'jpeg',
    mime: 'image/jpeg',
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}

/**
 * Crops an image accurately to the specified pixel rectangle
 */
export async function cropImage(
  buffer: Buffer,
  options: CropOptions
): Promise<ProcessResult> {
  const pipeline = createBasePipeline(buffer);
  const meta = await pipeline.metadata();

  const originalWidth = meta.width || 0;
  const originalHeight = meta.height || 0;

  const left = Math.max(0, Math.min(originalWidth - 1, Math.round(options.left)));
  const top = Math.max(0, Math.min(originalHeight - 1, Math.round(options.top)));
  const width = Math.max(1, Math.min(originalWidth - left, Math.round(options.width)));
  const height = Math.max(1, Math.min(originalHeight - top, Math.round(options.height)));

  const outputPipeline = pipeline.extract({
    left,
    top,
    width,
    height,
  });

  const { data, info } = await outputPipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: info.format,
    mime: `image/${info.format === 'jpg' ? 'jpeg' : info.format}`,
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}

/**
 * Multi-format converter (JPG, PNG, WEBP, AVIF, TIFF)
 */
export async function convertImageFormat(
  buffer: Buffer,
  options: ConvertOptions
): Promise<ProcessResult> {
  const quality = Math.max(1, Math.min(100, options.quality ?? 85));
  let pipeline = createBasePipeline(buffer);

  let outMime = 'image/jpeg';
  let outFormat = options.targetFormat;

  if (options.targetFormat === 'jpeg') {
    if (options.backgroundColor) {
      pipeline = pipeline.flatten({ background: options.backgroundColor });
    } else {
      pipeline = pipeline.flatten({ background: '#FFFFFF' });
    }
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    outMime = 'image/jpeg';
  } else if (options.targetFormat === 'png') {
    pipeline = pipeline.png({ compressionLevel: 9, effort: 7 });
    outMime = 'image/png';
  } else if (options.targetFormat === 'webp') {
    pipeline = pipeline.webp({ quality, effort: 5 });
    outMime = 'image/webp';
  } else if (options.targetFormat === 'avif') {
    pipeline = pipeline.avif({ quality, effort: 5 });
    outMime = 'image/avif';
  } else if (options.targetFormat === 'tiff') {
    pipeline = pipeline.tiff({ quality, compression: 'deflate' });
    outMime = 'image/tiff';
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    format: outFormat,
    mime: outMime,
    width: info.width,
    height: info.height,
    sizeBytes: data.length,
  };
}
