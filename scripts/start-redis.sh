#!/bin/bash
echo "Starting Redis server..."
redis-server --daemonize yes --port 6379 --logfile redis.log
echo "Redis server started on port 6379"
