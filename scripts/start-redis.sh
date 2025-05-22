#!/bin/bash
echo "Starting Valkey server..."
valkey-server --daemonize yes --port 6379 --logfile redis.log --threads 8
echo "Valkey server started on port 6379"
