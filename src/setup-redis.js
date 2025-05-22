import { createClient } from 'redis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function setupRedis() {
  const client = createClient();
  await client.connect();

  console.log('Setting up Redis test data...');

  // Create test data for different sizes
  const sizes = [2000, 4000, 10000];
  
  for (const size of sizes) {
    const hash1Data = {};
    const hash2Data = {};
    
    for (let i = 0; i < size; i++) {
      hash1Data[`field${i}`] = `value${i}_hash1`;
      hash2Data[`field${i}`] = `value${i}_hash2`;
    }
    
    await client.hSet(`hash1_${size}`, hash1Data);
    await client.hSet(`hash2_${size}`, hash2Data);
    
    console.log(`Created hashmaps of size ${size}`);
  }

  // Load and store Lua script
  const luaScript = readFileSync(join(__dirname, 'lua-script.lua'), 'utf8');
  const sha = await client.scriptLoad(luaScript);
  console.log(`Lua script loaded with SHA: ${sha}`);
  
  // Store SHA for benchmark use
  await client.set('lua_script_sha', sha);

  await client.disconnect();
  console.log('Setup complete!');
}

setupRedis().catch(console.error);
