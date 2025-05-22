import { createClient } from 'redis';

const client = createClient({
  url: 'redis://localhost:6379'
});

async function setupTestData() {
  try {
    await client.connect();
    console.log('Connected to Redis');

    // Clear existing data
    await client.flushAll();

    const sizes = [2000, 4000, 10000];
    
    for (const size of sizes) {
      console.log(`Creating hashmap with ${size} entries...`);
      
      const key1 = `hashmap1_${size}`;
      const key2 = `hashmap2_${size}`;
      
      // Create hashmap data
      const hashData1 = {};
      const hashData2 = {};
      
      for (let i = 0; i < size; i++) {
        hashData1[`field_${i}`] = `value1_${i}_${Math.random().toString(36).substr(2, 9)}`;
        hashData2[`field_${i}`] = `value2_${i}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Use pipeline for efficient bulk insertion
      const pipeline = client.multi();
      pipeline.hSet(key1, hashData1);
      pipeline.hSet(key2, hashData2);
      await pipeline.exec();
      
      console.log(`Created ${key1} and ${key2} with ${size} fields each`);
    }
    
    console.log('Test data setup complete');
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await client.disconnect();
  }
}

setupTestData();
