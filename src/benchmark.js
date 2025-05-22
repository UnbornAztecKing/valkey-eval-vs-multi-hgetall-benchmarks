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
    
    // Concurrent HGETALLs
    bench.add('Concurrent HGETALL', async () => {
      await Promise.all(Array(4).fill().map(async () => {
        const multi = client.multi();
        const pair = Math.floor(Math.random() * 4) + 1;
        multi.hGetAll(`hash${size}_${pair}a`);
        multi.hGetAll(`hash${size}_${pair}b`);
        await multi.exec();
      }));
    });

    // Concurrent EVALSHA
    bench.add('Concurrent EVALSHA', async () => {
      await Promise.all(Array(4).fill().map(async () => {
        const pair = Math.floor(Math.random() * 4) + 1;
        await client.evalSha(scriptSha, {
          keys: [`hash${size}_${pair}a`, `hash${size}_${pair}b`]
        });
      }));
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
