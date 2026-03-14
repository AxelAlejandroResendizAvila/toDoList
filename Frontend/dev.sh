#!/bin/bash

# ToDoList Frontend Development Server

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting ToDoList Frontend Development Server..."
echo "Server will be available at http://localhost:5173/"
echo ""

# Run Vite directly
node "$SCRIPT_DIR/node_modules/vite/bin/vite.js"
