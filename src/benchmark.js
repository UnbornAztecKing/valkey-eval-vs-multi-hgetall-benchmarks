import { Bench } from 'tinybench';
import { createClient } from 'redis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runBenchmarks() {
  const client = createClient();
  await client.connect();

  // Get Lua script SHA
  const scriptSha = await client.get('lua_script_sha');
  if (!scriptSha) {
    console.error('Lua script SHA not found. Run setup first.');
    process.exit(1);
  }

  const sizes = [2000, 4000, 10000];

  for (const size of sizes) {
    console.log(`\n=== Benchmarking hashmap size: ${size} ===`);
    
    const bench = new Bench({ time: 5000 }); // 5 seconds per benchmark
    
    const key1 = `hash1_${size}`;
    const key2 = `hash2_${size}`;

    // Method 1: MULTI approach
    bench.add('MULTI approach', async () => {
      const multi = client.multi();
      multi.hGetAll(key1);
      multi.hGetAll(key2);
      await multi.exec();
    });

    // Method 2: Lua script approach
    bench.add('Lua EVALSHA approach', async () => {
      await client.evalSha(scriptSha, {
        keys: [key1, key2]
      });
    });

    await bench.warmup();
    await bench.run();

    console.table(
      bench.tasks.map(({ name, result }) => ({
        'Method': name,
        'Ops/sec': result?.hz.toFixed(2),
        'Average (ms)': result?.mean.toFixed(3),
        'Samples': result?.samples.length,
      }))
    );
  }

  await client.disconnect();
}

runBenchmarks().catch(console.error);
