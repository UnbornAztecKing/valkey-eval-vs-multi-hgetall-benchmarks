#!/bin/bash
echo "Starting Redis server..."
redis-server --port 6379 --daemonize yes --save "" --appendonly no
sleep 2
echo "Redis server started on port 6379"
