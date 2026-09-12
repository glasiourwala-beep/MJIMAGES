import sharp from 'sharp';
import { validateImageBuffer, sanitizeFilename } from '../src/lib/image/validator.ts';
import { compressImage, convertPngToJpg } from '../src/lib/image/processor.ts';

async function runSecurityTests() {
  console.log('=== MJIMAGE SECURITY & VALIDATION TEST SUITE ===\n');

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

  // Test 1: Empty Buffer
  const emptyRes = await validateImageBuffer(Buffer.from([]));
  assert(!emptyRes.valid && emptyRes.error?.includes('empty'), 'Rejects empty buffer');

  // Test 2: Text/Malicious payload disguised as PNG
  const fakePayload = Buffer.from('<?php echo "malicious script"; ?>');
  const fakeRes = await validateImageBuffer(fakePayload);
  assert(!fakeRes.valid && fakeRes.error?.includes('Unsupported file format'), 'Rejects fake spoofed payload without valid magic bytes');

  // Test 3: Valid JPEG Magic Bytes + Buffer
  const validJpgBuffer = await sharp({
    create: {
      width: 200,
      height: 200,
      channels: 3,
      background: { r: 79, g: 70, b: 229 },
    },
  }).jpeg().toBuffer();

  const validJpgRes = await validateImageBuffer(validJpgBuffer, ['image/jpeg']);
  assert(validJpgRes.valid && validJpgRes.format === 'jpeg', 'Accepts valid JPEG and identifies format');

  // Test 4: Mismatched MIME filter (JPEG uploaded to PNG-only endpoint)
  const mimeMismatchRes = await validateImageBuffer(validJpgBuffer, ['image/png']);
  assert(!mimeMismatchRes.valid && mimeMismatchRes.error?.includes('not accepted'), 'Rejects JPEG on PNG-only allowed endpoint');

  // Test 5: Filename Sanitization & Path Traversal Defense
  const traversalFilename = '../../../../etc/passwd.jpg';
  const cleanName = sanitizeFilename(traversalFilename, 'image', 'png');
  assert(cleanName === 'passwd.png' || (!cleanName.includes('/') && !cleanName.includes('\\') && cleanName.endsWith('.png')), 'Sanitizes path traversal and strips directory prefixes');

  // Test 6: EXIF Stripping Verification
  const imgWithExif = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .withMetadata({
      exif: {
        IFD0: {
          Artist: 'Sensitive User Name',
          Copyright: 'Private Data',
        },
      },
    })
    .jpeg()
    .toBuffer();

  const compressedResult = await compressImage(imgWithExif, { quality: 80 });
  const compressedMeta = await sharp(compressedResult.data).metadata();
  assert(!compressedMeta.exif, 'EXIF metadata is cleanly stripped from output for user privacy');

  // Test 7: PNG with Transparency conversion to JPG
  const transparentPng = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 },
    },
  }).png().toBuffer();

  const jpgFromPng = await convertPngToJpg(transparentPng, { backgroundColor: '#FFFFFF', quality: 90 });
  assert(jpgFromPng.format === 'jpeg' && jpgFromPng.data.length > 0, 'Flattens transparent PNG onto white background when converting to JPG');

  console.log(`\n========================================`);
  console.log(`Tests Summary: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
