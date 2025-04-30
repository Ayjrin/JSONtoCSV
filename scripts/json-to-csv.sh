#!/bin/bash

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Kill any existing processes on port 8765
fuser -k 8765/tcp 2>/dev/null

# Start a simple HTTP server on a specific port
cd "$DIR/src" && python3 -m http.server 8765 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 1

# Open the application in the default browser
xdg-open http://localhost:8765/

# Function to check if browser is still accessing our server
function is_browser_connected() {
    # Check if there are any connections to our server
    local connections=$(netstat -tn 2>/dev/null | grep ":8765" | grep "ESTABLISHED" | wc -l)
    if [ "$connections" -gt 0 ]; then
        return 0  # True, browser is connected
    else
        # Double check with a small delay to catch brief disconnections
        sleep 2
        connections=$(netstat -tn 2>/dev/null | grep ":8765" | grep "ESTABLISHED" | wc -l)
        if [ "$connections" -gt 0 ]; then
            return 0  # True, browser is connected
        else
            return 1  # False, browser is disconnected
        fi
    fi
}

# Create a cleanup function
cleanup() {
    echo "Closing server..."
    kill $SERVER_PID 2>/dev/null
    exit 0
}

# Set up trap to clean up when script is terminated
trap cleanup SIGINT SIGTERM

# Monitor browser connection and exit when browser is closed
echo "JSON to CSV Converter is running. Close the browser tab to exit."
echo "Server PID: $SERVER_PID"

# Initial wait to let browser connect
sleep 5

# Check periodically if browser is still connected
while is_browser_connected; do
    sleep 2
done

# If we get here, browser is no longer connected
echo "Browser disconnected, shutting down server..."
cleanup
