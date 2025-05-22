# Redis Hashmap Benchmark

Benchmarks comparing two methods of querying multiple Redis hashmaps:
1. Using MULTI to execute multiple HGETALL commands
2. Using EVALSHA to execute a Lua script server-side

## Prerequisites

- Node.js 20+ 
- Redis server

## Installation

