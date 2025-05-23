# Valkey Hashmap Benchmark

Benchmarks comparing concurrent query methods for multiple Valkey/Redis hashmaps:
1. **Concurrent HGETALL**: Using MULTI to batch multiple HGETALL commands
2. **Concurrent EVALSHA**: Using Lua script execution server-side

## Prerequisites

- nvm (Node Version Manager)
- Valkey/Redis server

## Setup & Running

