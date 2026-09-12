import sharp from 'sharp';
import { compressImage, resizeImage, convertPngToJpg } from '../src/lib/image/processor.ts';
import { imageProcessingGate } from '../src/lib/security/concurrency.ts';

async function generateSampleBuffers() {
  const sampleJpg = await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 50, g: 100, b: 200 },
    },
  }).jpeg().toBuffer();

  const samplePng = await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 4,
      background: { r: 100, g: 200, b: 50, alpha: 0.8 },
    },
  }).png().toBuffer();

  return { sampleJpg, samplePng };
}

async function runSimulation(userCount, buffers) {
  console.log(`\n--- Simulating ${userCount} Concurrent Image Tasks ---`);
  const startTime = Date.now();
  const tasks = [];

  for (let i = 0; i < userCount; i++) {
    const taskType = i % 3;
    const task = (async () => {
      const release = await imageProcessingGate.acquire();
      try {
        if (taskType === 0) {
          return await compressImage(buffers.sampleJpg, { quality: 75 });
        } else if (taskType === 1) {
          return await resizeImage(buffers.sampleJpg, { width: 400, height: 300, maintainAspectRatio: true });
        } else {
          return await convertPngToJpg(buffers.samplePng, { backgroundColor: '#FFFFFF', quality: 85 });
        }
      } finally {
        release();
      }
    })();
    tasks.push(task);
  }

  const results = await Promise.allSettled(tasks);
  const elapsed = Date.now() - startTime;
  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  const memUsage = process.memoryUsage();
  const heapMB = (memUsage.heapUsed / 1024 / 1024).toFixed(1);

  console.log(`Finished ${userCount} concurrent tasks in ${elapsed}ms`);
  console.log(`Success: ${succeeded}/${userCount}, Failures: ${failed}, Heap: ${heapMB} MB`);
  console.log(`Average throughput: ${(userCount / (elapsed / 1000)).toFixed(1)} operations/sec`);

  if (failed > 0) {
    throw new Error(`Concurrency test failed with ${failed} rejections!`);
  }
}

async function main() {
  console.log('=== MJIMAGE CONCURRENT LOAD TEST SUITE ===');
  const buffers = await generateSampleBuffers();

  await runSimulation(10, buffers);
  await runSimulation(25, buffers);
  await runSimulation(50, buffers);

  console.log('\n========================================');
  console.log('All concurrency scenarios passed with 100% success rate!');
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('Concurrency simulation failed:', err);
  process.exit(1);
});
