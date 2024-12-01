#!/bin/bash

# Determine the directory of the script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the application root directory
APP_DIR="$(dirname "$SCRIPT_DIR")"

# Function to log messages with timestamps
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" >> /tmp/log
}

# Log the directory to /tmp/log
log "Script directory: $SCRIPT_DIR"
log "Application directory: $APP_DIR"

# Change to the application root directory
pushd $APP_DIR > /dev/null

# Check if node_modules directory exists
if [ ! -d "node_modules" ]; then
    log "node_modules directory not found. Installing npm packages..."
    pnpm install node-cron axios >> /tmp/log 2>&1

    # Check if npm install was successful
    if [ $? -ne 0 ]; then
        log "pnpm install failed"
        popd > /dev/null
        exit 1
    fi
else
    log "node_modules directory found. Skipping npm install."
fi

# Run the Node.js application and log output and errors to /tmp/log
log "Starting the Node.js application..."
node app.js >> /tmp/log 2>&1

# Check if the Node.js application started successfully
if [ $? -ne 0 ]; then
    log "Node.js application failed to start"
    popd > /dev/null
    exit 1
fi

# Return to the previous directory
popd > /dev/null
