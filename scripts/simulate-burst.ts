#!/usr/bin/env tsx
/**
 * Simulate burst of messages to test queue resilience
 * Usage: tsx scripts/simulate-burst.ts --count=200
 */

import axios from 'axios';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

interface Args {
  count?: number;
  delay?: number;
  parallel?: number;
}

function parseArgs(): Args {
  const args: Args = { count: 100, delay: 10, parallel: 10 };
  
  process.argv.forEach((arg) => {
    if (arg.startsWith('--count=')) {
      args.count = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--delay=')) {
      args.delay = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--parallel=')) {
      args.parallel = parseInt(arg.split('=')[1]);
    }
  });

  return args;
}

async function sendMessage(phone: string, message: string, index: number) {
  try {
    const response = await axios.post(`${BASE_URL}/api/webhooks/whatsapp`, {
      from: phone,
      message,
      timestamp: Date.now(),
      id: `burst_${Date.now()}_${index}`,
    });

    console.log(`✅ [${index}] Message sent: ${message.substring(0, 30)}...`);
    return { success: true, index };
  } catch (error: any) {
    console.error(`❌ [${index}] Failed: ${error.message}`);
    return { success: false, index, error: error.message };
  }
}

async function simulateBurst() {
  const args = parseArgs();
  const { count = 100, delay = 10, parallel = 10 } = args;

  console.log(`🚀 Starting burst simulation:`);
  console.log(`   Count: ${count}`);
  console.log(`   Delay: ${delay}ms between batches`);
  console.log(`   Parallel: ${parallel} concurrent requests`);
  console.log('');

  const messages = [
    'Do you have size 42 black sneakers?',
    'I want to buy 2 pairs',
    'What is the price?',
    'Hello, are you open?',
    'I need shoes size 43',
    'Do you deliver?',
  ];

  const results = { success: 0, failed: 0 };
  const startTime = Date.now();

  // Send in batches
  for (let i = 0; i < count; i += parallel) {
    const batch = [];
    for (let j = 0; j < parallel && i + j < count; j++) {
      const index = i + j;
      const phone = `+254700${String(index).padStart(6, '0')}`;
      const message = messages[index % messages.length];
      
      batch.push(sendMessage(phone, message, index));
    }

    const batchResults = await Promise.allSettled(batch);
    
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        results.success++;
      } else {
        results.failed++;
      }
    });

    if (i + parallel < count) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const duration = Date.now() - startTime;

  console.log('');
  console.log('📊 Results:');
  console.log(`   Total: ${count}`);
  console.log(`   Success: ${results.success}`);
  console.log(`   Failed: ${results.failed}`);
  console.log(`   Duration: ${duration}ms`);
  console.log(`   Rate: ${(count / (duration / 1000)).toFixed(2)} messages/sec`);
}

simulateBurst().catch(console.error);

