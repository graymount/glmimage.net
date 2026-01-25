/**
 * Test script for fal.ai API integration
 * Run with: npx tsx scripts/test-fal.ts
 */

// Load env
import 'dotenv/config';

const FAL_BASE_URL = 'https://queue.fal.run';

async function main() {
  const apiKey = process.env.FAL_API_KEY;

  if (!apiKey) {
    console.error('FAL_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('FAL_API_KEY found:', apiKey.slice(0, 10) + '...');

  const model = 'fal-ai/flux/schnell'; // fastest model for testing
  const prompt = 'a cute orange cat sitting on a windowsill';

  console.log(`\nTesting model: ${model}`);
  console.log(`Prompt: ${prompt}`);
  console.log('\nSubmitting request...');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Key ${apiKey}`,
  };

  try {
    // Submit request
    const submitResp = await fetch(`${FAL_BASE_URL}/${model}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        image_size: 'square',
        num_inference_steps: 4,
        num_images: 1,
      }),
    });

    if (!submitResp.ok) {
      const errorText = await submitResp.text();
      throw new Error(`Submit failed: ${submitResp.status} - ${errorText}`);
    }

    const submitData = await submitResp.json();
    const requestId = submitData.request_id;

    console.log('Request ID:', requestId);
    console.log('\nPolling for result...');

    // Get query model (first two parts)
    const queryModel = model.split('/').slice(0, 2).join('/');

    // Poll for status
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (attempts < maxAttempts) {
      const statusResp = await fetch(
        `${FAL_BASE_URL}/${queryModel}/requests/${requestId}/status`,
        { method: 'GET', headers }
      );

      if (!statusResp.ok) {
        throw new Error(`Status check failed: ${statusResp.status}`);
      }

      const statusData = await statusResp.json();
      console.log(`  Status: ${statusData.status}`);

      if (statusData.status === 'COMPLETED') {
        // Get result
        const resultResp = await fetch(
          `${FAL_BASE_URL}/${queryModel}/requests/${requestId}`,
          { method: 'GET', headers }
        );

        if (!resultResp.ok) {
          throw new Error(`Result fetch failed: ${resultResp.status}`);
        }

        const resultData = await resultResp.json();
        console.log('\n✅ Success!');

        if (resultData.images && resultData.images.length > 0) {
          console.log('Image URL:', resultData.images[0].url);
        }

        return;
      }

      if (statusData.status === 'FAILED') {
        throw new Error('Task failed');
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Timeout waiting for result');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

main();
