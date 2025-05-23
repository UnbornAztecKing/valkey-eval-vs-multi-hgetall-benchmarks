#!/bin/bash
echo "Starting Valkey server..."
valkey-server valkey.conf --daemonize yes --port 6379 --logfile redis.log
echo "Valkey server started on port 6379"
