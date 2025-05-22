import { createClient } from 'redis';

export function createRedisClient() {
  return createClient({
    url: 'redis://localhost:6379',
    socket: {
      reconnectStrategy: false
    }
  });
}
