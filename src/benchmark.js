import Benchmark from 'benchmark';
import { createRedisClient } from './redis-client.js';
import { loadLuaScripts } from './lua-scripts.js';

class RedisBenchmark {
  constructor() {
    this.client = null;
    this.scripts = null;
    this.sizes = [2000, 4000, 10000];
  }

  async initialize() {
    this.client = createRedisClient();
    await this.client.connect();
    this.scripts = await loadLuaScripts(this.client);
    console.log('Redis client initialized and Lua scripts loaded');
  }

  async cleanup() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async multiMethod(size) {
    const key1 = `hashmap1_${size}`;
    const key2 = `hashmap2_${size}`;
    
    const multi = this.client.multi();
    multi.hGetAll(key1);
    multi.hGetAll(key2);
    
    return await multi.exec();
  }

  async evalshaMethod(size) {
    const key1 = `hashmap1_${size}`;
    const key2 = `hashmap2_${size}`;
    
    return await this.client.evalSha(
      this.scripts.getTwoHashmapsSha,
      {
        keys: [key1, key2]
      }
    );
  }

  runBenchmarkForSize(size) {
    return new Promise((resolve) => {
      console.log(`\n=== Benchmarking hashmap size: ${size} ===`);
      
      const suite = new Benchmark.Suite();
      
      suite
        .add(`MULTI (${size})`, {
          defer: true,
          fn: async (deferred) => {
            try {
              await this.multiMethod(size);
              deferred.resolve();
            } catch (error) {
              console.error('MULTI error:', error);
              deferred.resolve();
            }
          }
        })
        .add(`EVALSHA (${size})`, {
          defer: true,
          fn: async (deferred) => {
            try {
              await this.evalshaMethod(size);
              deferred.resolve();
            } catch (error) {
              console.error('EVALSHA error:', error);
              deferred.resolve();
            }
          }
        })
        .on('cycle', (event) => {
          console.log(String(event.target));
        })
        .on('complete', function() {
          const fastest = this.filter('fastest');
          const slowest = this.filter('slowest');
          
          if (fastest.length > 0 && slowest.length > 0) {
            const speedup = (fastest[0].hz / slowest[0].hz).toFixed(2);
            console.log(`Fastest: ${fastest[0].name}`);
            console.log(`Speed improvement: ${speedup}x faster`);
          }
          resolve();
        })
        .run({ async: true });
    });
  }

  async runAllBenchmarks() {
    console.log('Starting Redis hashmap benchmarks...\n');
    
    for (const size of this.sizes) {
      await this.runBenchmarkForSize(size);
    }
    
    console.log('\n=== Benchmark Summary ===');
    console.log('MULTI: Executes multiple commands in a transaction');
    console.log('EVALSHA: Executes Lua script server-side for atomic operation');
    console.log('Generally, EVALSHA should be faster due to reduced network round-trips');
  }
}

async function main() {
  const benchmark = new RedisBenchmark();
  
  try {
    await benchmark.initialize();
    await benchmark.runAllBenchmarks();
  } catch (error) {
    console.error('Benchmark error:', error);
  } finally {
    await benchmark.cleanup();
  }
}

main();
