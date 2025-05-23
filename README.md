# Valkey Hashmap Benchmark

Benchmarks comparing concurrent query methods for multiple Valkey/Redis hashmaps:
1. Concurrent `HGETALL`: Using MULTI to batch multiple HGETALL commands
2. Concurrent `EVALSHA`: Using Lua script execution server-side

## Prerequisites

- nvm (Node Version Manager)
- Valkey 8 server

## Setup & Running

```
nvm use
```

```
npm install
```

```
npm run start-valkey
```

```
npm run setup-valkey
```

```
npm run benchmark
```

```
npm run stop-valkey
```

## Multi-threaded Valkey Server Behavior

With `io-threads 6` configuration, Valkey distributes I/O operations across multiple threads

### Concurrent HGETALL (MULTI/EXEC)

- Each client connection sends MULTI followed by multiple HGETALL commands

- Commands are queued and executed atomically per connection

- Multiple concurrent connections can be processed in parallel by different I/O threads

- Network I/O for command parsing and response serialization is parallelized

- Actual command execution remains single-threaded on the main thread

### Concurrent EVALSHA

- Lua script execution is atomic and blocks the main thread

- While one script runs, other connections must wait

- I/O threads can still handle network operations for queued requests

- Less parallelism compared to MULTI/EXEC approach despite multi-threading

## Expected Performance Characteristics

1. Small hashmaps (2000 fields): Minimal difference; network overhead dominates

2. Medium hashmaps (4000 fields): MULTI/EXEC begins showing advantages through better parallelism

3. Large hashmaps (10000 fields): MULTI/EXEC significantly outperforms due to:

- Better utilization of I/O threads

- Non-blocking concurrent execution

- Reduced contention on the main thread

The benchmark simulates 4 concurrent clients to stress-test parallelism capabilities.