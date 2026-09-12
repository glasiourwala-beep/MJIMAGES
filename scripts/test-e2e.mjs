import sharp from 'sharp';

async function runE2ETests() {
  console.log('=== MJIMAGE FULL HTTP & PROCESSING END-TO-END VERIFICATION ===\n');

  const baseUrl = 'http://localhost:3000';
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  }

  // 1. Test Static & Tool Pages HTTP 200 & HTML Content
  const pagesToTest = [
    { path: '/', title: 'MJImage' },
    { path: '/image-compressor', title: 'Image Compressor' },
    { path: '/image-resizer', title: 'Image Resizer' },
    { path: '/jpg-to-png', title: 'JPG to PNG' },
    { path: '/png-to-jpg', title: 'PNG to JPG' },
    { path: '/webp-to-jpg', title: 'WebP to JPG' },
    { path: '/image-cropper', title: 'Image Cropper' },
    { path: '/image-converter', title: 'Image Converter' },
    { path: '/about', title: 'About MJImage' },
    { path: '/privacy', title: 'Privacy Policy' },
    { path: '/terms', title: 'Terms of Service' },
    { path: '/contact', title: 'Contact' },
    { path: '/sitemap.xml', title: 'https://mjimage.com' },
    { path: '/robots.txt', title: 'User-Agent' },
  ];

  for (const page of pagesToTest) {
    const res = await fetch(`${baseUrl}${page.path}`);
    const text = await res.text();
    assert(
      res.status === 200 && text.includes(page.title),
      `GET ${page.path} returned 200 OK and contains '${page.title}'`
    );
  }

  // 2. Test Security Headers
  const rootRes = await fetch(`${baseUrl}/`);
  const nosniff = rootRes.headers.get('x-content-type-options');
  const frameOptions = rootRes.headers.get('x-frame-options');
  const hsts = rootRes.headers.get('strict-transport-security');
  assert(nosniff === 'nosniff', `Security Header X-Content-Type-Options is nosniff`);
  assert(frameOptions === 'SAMEORIGIN', `Security Header X-Frame-Options is SAMEORIGIN`);
  assert(hsts && hsts.includes('max-age'), `Security Header Strict-Transport-Security is present`);

  // 3. Test Real Image Processing API Endpoints
  const sampleJpgBuffer = await sharp({
    create: {
      width: 400,
      height: 300,
      channels: 3,
      background: { r: 79, g: 70, b: 229 },
    },
  }).jpeg().toBuffer();

  const samplePngBuffer = await sharp({
    create: {
      width: 400,
      height: 300,
      channels: 4,
      background: { r: 16, g: 185, b: 129, alpha: 0.8 },
    },
  }).png().toBuffer();

  // 3.1 Compress Endpoint
  const compressForm = new FormData();
  compressForm.append('file', new Blob([sampleJpgBuffer], { type: 'image/jpeg' }), 'test.jpg');
  compressForm.append('quality', '70');

  const compressRes = await fetch(`${baseUrl}/api/image/compress`, {
    method: 'POST',
    body: compressForm,
  });
  const compressJson = await compressRes.json();
  assert(compressJson.success && compressJson.data.downloadUrl, `POST /api/image/compress returns downloadUrl`);

  // 3.2 Download Endpoint
  const downloadRes = await fetch(`${baseUrl}${compressJson.data.downloadUrl}`);
  const downloadBuf = await downloadRes.arrayBuffer();
  assert(
    downloadRes.status === 200 &&
    downloadRes.headers.get('content-disposition')?.includes('attachment') &&
    downloadBuf.byteLength > 0,
    `GET ${compressJson.data.downloadUrl} returns valid binary attachment`
  );

  // 3.3 Resize Endpoint
  const resizeForm = new FormData();
  resizeForm.append('file', new Blob([sampleJpgBuffer], { type: 'image/jpeg' }), 'test.jpg');
  resizeForm.append('width', '200');
  resizeForm.append('height', '150');

  const resizeRes = await fetch(`${baseUrl}/api/image/resize`, {
    method: 'POST',
    body: resizeForm,
  });
  const resizeJson = await resizeRes.json();
  assert(resizeJson.success && resizeJson.data.width === 200, `POST /api/image/resize resized width to 200px`);

  // 3.4 JPG to PNG Endpoint
  const jpgToPngForm = new FormData();
  jpgToPngForm.append('file', new Blob([sampleJpgBuffer], { type: 'image/jpeg' }), 'test.jpg');
  const jpgToPngRes = await fetch(`${baseUrl}/api/image/jpg-to-png`, {
    method: 'POST',
    body: jpgToPngForm,
  });
  const jpgToPngJson = await jpgToPngRes.json();
  assert(jpgToPngJson.success && jpgToPngJson.data.format === 'png', `POST /api/image/jpg-to-png converted to PNG`);

  // 3.5 PNG to JPG Endpoint
  const pngToJpgForm = new FormData();
  pngToJpgForm.append('file', new Blob([samplePngBuffer], { type: 'image/png' }), 'test.png');
  pngToJpgForm.append('backgroundColor', '#FFFFFF');
  const pngToJpgRes = await fetch(`${baseUrl}/api/image/png-to-jpg`, {
    method: 'POST',
    body: pngToJpgForm,
  });
  const pngToJpgJson = await pngToJpgRes.json();
  assert(pngToJpgJson.success && pngToJpgJson.data.format === 'jpeg', `POST /api/image/png-to-jpg converted to JPG`);

  // 3.6 Crop Endpoint
  const cropForm = new FormData();
  cropForm.append('file', new Blob([sampleJpgBuffer], { type: 'image/jpeg' }), 'test.jpg');
  cropForm.append('left', '10');
  cropForm.append('top', '10');
  cropForm.append('width', '100');
  cropForm.append('height', '100');
  const cropRes = await fetch(`${baseUrl}/api/image/crop`, {
    method: 'POST',
    body: cropForm,
  });
  const cropJson = await cropRes.json();
  assert(cropJson.success && cropJson.data.width === 100 && cropJson.data.height === 100, `POST /api/image/crop extracted 100x100px region`);

  // 3.7 Convert Endpoint (to AVIF)
  const convertForm = new FormData();
  convertForm.append('file', new Blob([sampleJpgBuffer], { type: 'image/jpeg' }), 'test.jpg');
  convertForm.append('targetFormat', 'avif');
  const convertRes = await fetch(`${baseUrl}/api/image/convert`, {
    method: 'POST',
    body: convertForm,
  });
  const convertJson = await convertRes.json();
  assert(convertJson.success && convertJson.data.format === 'avif', `POST /api/image/convert converted to AVIF`);

  console.log(`\n========================================`);
  console.log(`E2E Summary: ${passed}/${total} Checks Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('E2E execution failed:', err);
  process.exit(1);
});
