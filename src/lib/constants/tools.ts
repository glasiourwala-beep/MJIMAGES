export interface ToolConfig {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  heroTagline: string;
  heroDescription: string;
  iconName: 'Minimize2' | 'Maximize2' | 'FileImage' | 'Image' | 'Sparkles' | 'Crop' | 'RefreshCw';
  acceptMimes: string[];
  acceptExtensions: string[];
  maxSizeMB: number;
  apiEndpoint: string;
  seoTitle: string;
  seoDescription: string;
  canonicalPath: string;
  relatedToolSlugs: string[];
  howItWorks: { step: number; title: string; desc: string }[];
  keyBenefits: { title: string; desc: string }[];
  faqs: { question: string; answer: string }[];
  contentSections: { title: string; text: string }[];
}

export const TOOLS: Record<string, ToolConfig> = {
  'image-compressor': {
    id: 'image-compressor',
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortDescription: 'Reduce image file size while keeping high visual fidelity.',
    heroTagline: 'Lossy & Lossless Image Compression',
    heroDescription: 'Shrink JPEG, PNG, WebP, and AVIF file sizes up to 80% without visible loss in quality. Faster page load times and smaller storage footprint.',
    iconName: 'Minimize2',
    acceptMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    acceptExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/compress',
    seoTitle: 'Free Image Compressor Online — Compress JPG, PNG, WebP | MJImage',
    seoDescription: 'Compress your images online in seconds with MJImage. High-speed lossless and lossy compression for JPEG, PNG, and WebP with zero quality degradation.',
    canonicalPath: '/image-compressor',
    relatedToolSlugs: ['image-resizer', 'image-converter', 'jpg-to-png'],
    howItWorks: [
      { step: 1, title: 'Upload Image', desc: 'Drag and drop or select your JPG, PNG, or WebP image.' },
      { step: 2, title: 'Adjust Quality', desc: 'Fine-tune the compression level with the interactive quality slider.' },
      { step: 3, title: 'Download Result', desc: 'Inspect the live size savings comparison and instantly download your compressed file.' },
    ],
    keyBenefits: [
      { title: 'Smart Quantization', desc: 'Advanced color quantization algorithms preserve edge sharpness while removing redundant byte payloads.' },
      { title: 'Privacy Guaranteed', desc: 'Images are processed ephemerally in memory/temp storage and discarded immediately after download.' },
      { title: 'Zero Artifacts', desc: 'Tuned psycho-visual metrics prevent blockiness and color banding across standard web viewing displays.' },
    ],
    faqs: [
      {
        question: 'How does MJImage compress images without losing quality?',
        answer: 'MJImage leverages modern Libvips/Sharp compression engines that perform intelligent color indexing, Chroma subsampling reduction, and metadata stripping without degrading the human-perceivable visual details.',
      },
      {
        question: 'What is the maximum upload size for compression?',
        answer: 'You can upload images up to 25 MB and dimensions up to 8,000 x 8,000 pixels.',
      },
      {
        question: 'Are my images stored on your servers?',
        answer: 'No. MJImage operates on a strict ephemeral lifecycle. Your uploaded files are stored temporarily solely during the processing operation and automatically deleted immediately after download or within 15 minutes.',
      },
    ],
    contentSections: [
      {
        title: 'Why Image Compression Matters for Modern Websites',
        text: 'Page speed directly influences search engine ranking and user bounce rates. Uncompressed imagery accounts for more than 60% of total web page payload. By optimizing your assets with MJImage Compressor, you deliver lightning-fast Core Web Vitals and lower bandwidth consumption.',
      },
      {
        title: 'Lossy vs. Lossless Compression Explained',
        text: 'Lossless compression reorganizes file data to reduce size with zero pixel variation, ideal for logos and typography. Lossy compression removes subtle, imperceptible color nuances to achieve dramatic 60–80% size savings, ideal for photographs and background imagery.',
      },
    ],
  },
  'image-resizer': {
    id: 'image-resizer',
    slug: 'image-resizer',
    name: 'Image Resizer',
    shortDescription: 'Resize image dimensions by pixels or percentage with aspect ratio lock.',
    heroTagline: 'Precision Dimension Resizing & Scaling',
    heroDescription: 'Scale your photos, banners, and thumbnails with pixel precision or percentage factors using industry-standard Lanczos3 resampling.',
    iconName: 'Maximize2',
    acceptMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff'],
    acceptExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/resize',
    seoTitle: 'Free Image Resizer Online — Change Image Dimensions in Pixels | MJImage',
    seoDescription: 'Resize photos and graphics online for free. Adjust width, height, or scale percentages with aspect ratio lock and high-resolution resampling.',
    canonicalPath: '/image-resizer',
    relatedToolSlugs: ['image-cropper', 'image-compressor', 'image-converter'],
    howItWorks: [
      { step: 1, title: 'Select File', desc: 'Upload any standard photo or graphic file.' },
      { step: 2, title: 'Set Dimensions', desc: 'Enter target width/height in pixels or adjust by percentage with locked aspect ratio.' },
      { step: 3, title: 'Export Image', desc: 'Click process to render your resized asset with sharp Lanczos3 filtering.' },
    ],
    keyBenefits: [
      { title: 'Lanczos3 Resampling', desc: 'High-order anti-aliasing interpolation guarantees clean edges without blurry degradation or pixelation.' },
      { title: 'Aspect Ratio Lock', desc: 'Prevents stretching and unnatural distortion by automatically calculating matching dimensional ratios.' },
      { title: 'Batch Dimension Presets', desc: 'Quickly select common social media and web banner dimension presets.' },
    ],
    faqs: [
      {
        question: 'Will resizing distort or stretch my image?',
        answer: 'Not if you keep the "Maintain Aspect Ratio" lock enabled. The tool will automatically compute the complementary dimension to maintain your exact proportions.',
      },
      {
        question: 'What resampling filter does MJImage use?',
        answer: 'MJImage uses high-grade Lanczos3 interpolation for smooth downsampling and crisp upsampling.',
      },
    ],
    contentSections: [
      {
        title: 'Choosing the Right Image Dimensions',
        text: 'Displaying oversized images slows down rendering on mobile devices. Resizing images to their exact target display size prevents client-side rendering lag and improves user experience.',
      },
    ],
  },
  'jpg-to-png': {
    id: 'jpg-to-png',
    slug: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    shortDescription: 'Convert JPG/JPEG images to lossless, high-fidelity PNG format.',
    heroTagline: 'Instant JPG to Lossless PNG Conversion',
    heroDescription: 'Convert lossy JPEG files into clean, lossless 24-bit PNG assets ready for editing, transparent layering, and high-fidelity archival.',
    iconName: 'FileImage',
    acceptMimes: ['image/jpeg'],
    acceptExtensions: ['.jpg', '.jpeg'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/jpg-to-png',
    seoTitle: 'Convert JPG to PNG Online Free — High Quality Lossless PNG | MJImage',
    seoDescription: 'Fast, secure online JPG to PNG converter. Convert JPEG images to uncompressed PNG format without losing detail or introducing artifacts.',
    canonicalPath: '/jpg-to-png',
    relatedToolSlugs: ['png-to-jpg', 'image-converter', 'image-compressor'],
    howItWorks: [
      { step: 1, title: 'Upload JPG', desc: 'Upload your .jpg or .jpeg image.' },
      { step: 2, title: 'Process Conversion', desc: 'Our engine decodes and repackages pixels into 24-bit RGB PNG format.' },
      { step: 3, title: 'Save PNG', desc: 'Download your pristine PNG file with zero additional compression loss.' },
    ],
    keyBenefits: [
      { title: 'Lossless Packing', desc: 'Re-encodes raster data into standard PNG with maximum Deflate compression efficiency.' },
      { title: 'Clean Gamma Handling', desc: 'Preserves sRGB color profiles accurately across modern browsers and operating systems.' },
      { title: 'Zero Re-compression Degradation', desc: 'Ensures no generation loss during subsequent graphic design editing iterations.' },
    ],
    faqs: [
      {
        question: 'Why convert JPG to PNG?',
        answer: 'PNG uses lossless compression, making it superior for graphics that need to be edited multiple times in Photoshop or Figma without compounding JPEG artifact generation.',
      },
      {
        question: 'Will converting a JPG to PNG make the background transparent?',
        answer: 'JPG files do not contain an alpha transparency channel. Converting a JPG to PNG will preserve the solid background of the original photo while switching the container format to PNG.',
      },
    ],
    contentSections: [
      {
        title: 'Differences Between JPG and PNG',
        text: 'JPG is designed for continuous-tone photography with lossy compression, while PNG was engineered for lossless data storage, sharp lines, and transparency support.',
      },
    ],
  },
  'png-to-jpg': {
    id: 'png-to-jpg',
    slug: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    shortDescription: 'Convert PNG images to compact JPG format with smart transparency handling.',
    heroTagline: 'Convert PNG to Compact JPEG',
    heroDescription: 'Transform heavy PNG graphics into lightweight, universal JPG images. Select your desired background fill color for transparent PNGs.',
    iconName: 'Image',
    acceptMimes: ['image/png'],
    acceptExtensions: ['.png'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/png-to-jpg',
    seoTitle: 'Convert PNG to JPG Online — Custom Background Transparency | MJImage',
    seoDescription: 'Convert PNG files to JPG online for free. Control background fill colors (white, black, or custom) for transparent PNGs and reduce file size.',
    canonicalPath: '/png-to-jpg',
    relatedToolSlugs: ['jpg-to-png', 'webp-to-jpg', 'image-compressor'],
    howItWorks: [
      { step: 1, title: 'Upload PNG', desc: 'Drop your transparent or opaque PNG file.' },
      { step: 2, title: 'Choose Background & Quality', desc: 'Pick the background matte color for transparent areas (white, black, or custom hex) and adjust quality.' },
      { step: 3, title: 'Download JPG', desc: 'Get a lightweight, universally compatible JPEG file.' },
    ],
    keyBenefits: [
      { title: 'Smart Matte Blending', desc: 'Cleanly flattens alpha transparency onto any matte background color without jagged black outlines.' },
      { title: 'Huge File Size Savings', desc: 'Reduces photographic PNG file sizes by up to 70-90% by switching to JPEG encoding.' },
      { title: 'Adjustable JPEG Quality', desc: 'Balance visual clarity and file size with the precision quality slider.' },
    ],
    faqs: [
      {
        question: 'What happens to transparent pixels when converting to JPG?',
        answer: 'Since the JPG specification does not support alpha transparency, MJImage allows you to choose a matte background fill color (default is pure white #FFFFFF) onto which transparent pixels are seamlessly blended.',
      },
      {
        question: 'Why is my converted JPG so much smaller than the original PNG?',
        answer: 'PNG preserves every individual pixel value losslessly, which is very heavy for photographs. JPG utilizes discrete cosine transform (DCT) compression to discard imperceptible color data, resulting in massive size reductions.',
      },
    ],
    contentSections: [
      {
        title: 'When to Convert PNG to JPG',
        text: 'If your PNG image contains complex photos without transparency, converting to JPG will drastically reduce the file size with virtually no observable difference on screens.',
      },
    ],
  },
  'webp-to-jpg': {
    id: 'webp-to-jpg',
    slug: 'webp-to-jpg',
    name: 'WebP to JPG Converter',
    shortDescription: 'Convert modern WebP images to universally compatible JPG format.',
    heroTagline: 'Universal WebP to JPG Image Converter',
    heroDescription: 'Easily convert Google WebP images saved from the internet into standard JPG photos compatible with all software, older devices, and print workflows.',
    iconName: 'Sparkles',
    acceptMimes: ['image/webp'],
    acceptExtensions: ['.webp'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/webp-to-jpg',
    seoTitle: 'Convert WebP to JPG Online Free — Instant & High Quality | MJImage',
    seoDescription: 'Convert downloaded WebP images to standard JPG format instantly. Universal compatibility for desktop viewers, email clients, and photo editors.',
    canonicalPath: '/webp-to-jpg',
    relatedToolSlugs: ['png-to-jpg', 'image-converter', 'image-resizer'],
    howItWorks: [
      { step: 1, title: 'Upload WebP', desc: 'Select or drag your .webp image downloaded from the web.' },
      { step: 2, title: 'Set Quality', desc: 'Choose output quality level from 60% to 100%.' },
      { step: 3, title: 'Download JPG', desc: 'Instantly download your standardized JPG image.' },
    ],
    keyBenefits: [
      { title: 'Universal Compatibility', desc: 'Open and edit your converted JPGs anywhere without needing specialized WebP browser extensions or plugins.' },
      { title: 'High Color Accuracy', desc: 'Retains color primaries and contrast ratios during decoding.' },
      { title: 'Lightning Fast', desc: 'Direct binary streaming delivers conversion results in fractions of a second.' },
    ],
    faqs: [
      {
        question: 'Why can’t some older programs open WebP files?',
        answer: 'WebP is a relatively modern image container developed by Google. Many legacy desktop photo editors, email clients, and office software do not natively support WebP, making conversion to JPG essential.',
      },
      {
        question: 'Does converting WebP to JPG lose quality?',
        answer: 'MJImage uses high-quality MozJPEG-compatible encoders with customizable quality settings (default 90%) to ensure pristine visual reproduction.',
      },
    ],
    contentSections: [
      {
        title: 'Understanding WebP vs JPEG',
        text: 'WebP offers high compression efficiency for web delivery, but JPEG remains the global standard for cross-platform compatibility, photo editing software, and physical printing.',
      },
    ],
  },
  'image-cropper': {
    id: 'image-cropper',
    slug: 'image-cropper',
    name: 'Image Cropper',
    shortDescription: 'Crop photos with interactive visual controls and standard aspect ratios.',
    heroTagline: 'Visual Interactive Image Cropping',
    heroDescription: 'Crop, frame, and compose your images with precision. Choose from popular aspect ratio presets (1:1, 16:9, 4:3, 9:16) or freely adjust the crop boundary.',
    iconName: 'Crop',
    acceptMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    acceptExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/crop',
    seoTitle: 'Free Image Cropper Online — Crop Photos to Exact Aspect Ratios | MJImage',
    seoDescription: 'Crop images online with MJImage. Interactive visual crop tool supporting 1:1 square, 16:9 widescreen, 4:3, 9:16 vertical stories, and custom aspect ratios.',
    canonicalPath: '/image-cropper',
    relatedToolSlugs: ['image-resizer', 'image-compressor', 'image-converter'],
    howItWorks: [
      { step: 1, title: 'Upload Photo', desc: 'Upload any supported photo or graphic.' },
      { step: 2, title: 'Adjust Crop Frame', desc: 'Drag the interactive crop handles or select an aspect ratio preset.' },
      { step: 3, title: 'Download Cropped Image', desc: 'Extract the exact bounding area with pixel-perfect accuracy.' },
    ],
    keyBenefits: [
      { title: 'Interactive Precision Box', desc: 'Fluid drag-and-resize bounding box with corner guides and rule-of-thirds grid.' },
      { title: 'Preset Aspect Ratios', desc: 'One-click presets for Instagram Square (1:1), YouTube/Web (16:9), Portrait (4:3), and Stories/Reels (9:16).' },
      { title: 'Lossless Area Extraction', desc: 'Extracts exact pixel coordinates on the server with zero distortion or resampling blur.' },
    ],
    faqs: [
      {
        question: 'Can I crop to a custom aspect ratio?',
        answer: 'Yes! Select the "Free" aspect ratio mode to freely drag the crop handles to any width and height combination.',
      },
      {
        question: 'Does cropping reduce the resolution of the image?',
        answer: 'Cropping extracts the selected pixel region. The pixels within the crop box retain their original full native resolution without being scaled down.',
      },
    ],
    contentSections: [
      {
        title: 'Mastering the Rule of Thirds in Image Cropping',
        text: 'Use the integrated grid overlay to align focal points along intersecting grid lines, creating balanced and compelling photographic compositions.',
      },
    ],
  },
  'image-converter': {
    id: 'image-converter',
    slug: 'image-converter',
    name: 'Image Converter',
    shortDescription: 'Convert between JPG, PNG, WEBP, AVIF, and TIFF formats seamlessly.',
    heroTagline: 'Universal Multi-Format Image Converter',
    heroDescription: 'Convert any image into JPG, PNG, WebP, AVIF, or TIFF format. Clean conversion engine with custom quality and format-specific optimization options.',
    iconName: 'RefreshCw',
    acceptMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/tiff'],
    acceptExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff'],
    maxSizeMB: 25,
    apiEndpoint: '/api/image/convert',
    seoTitle: 'Universal Online Image Converter — Convert JPG, PNG, WebP, AVIF | MJImage',
    seoDescription: 'Convert image files to any format online for free. Supports JPG, PNG, WEBP, AVIF, and TIFF conversions with advanced format configuration.',
    canonicalPath: '/image-converter',
    relatedToolSlugs: ['image-compressor', 'image-resizer', 'jpg-to-png'],
    howItWorks: [
      { step: 1, title: 'Upload Source File', desc: 'Select any supported image format (JPG, PNG, WebP, AVIF, TIFF).' },
      { step: 2, title: 'Choose Target Format', desc: 'Select your target output format and configure quality or background settings.' },
      { step: 3, title: 'Download Converted File', desc: 'Receive your newly encoded image in seconds.' },
    ],
    keyBenefits: [
      { title: 'Next-Gen Format Support', desc: 'Encode to cutting-edge formats like AVIF and WebP for supreme compression efficiency.' },
      { title: 'Broad Format Compatibility', desc: 'Decode and encode between 5 major raster standards effortlessly.' },
      { title: 'Server-Grade Sharp Pipeline', desc: 'Powered by Libvips, delivering ultra-fast conversion with low memory footprint.' },
    ],
    faqs: [
      {
        question: 'Which format should I choose for web use?',
        answer: 'WebP and AVIF offer the best compression-to-quality ratio for modern websites. Use PNG if you need sharp logos with transparency, and JPG for universal photographic compatibility.',
      },
      {
        question: 'Is AVIF better than WebP?',
        answer: 'AVIF typically achieves 20% higher compression efficiency than WebP at comparable visual quality, though WebP has broader support across older browsers.',
      },
    ],
    contentSections: [
      {
        title: 'Modern Web Image Formats Comparison',
        text: 'Selecting the proper format is key to web performance. Modern browsers support AVIF and WebP, offering significant bandwidth savings over traditional JPG and PNG formats.',
      },
    ],
  },
};

export const TOOL_LIST = Object.values(TOOLS);
