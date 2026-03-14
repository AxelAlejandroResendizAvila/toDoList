@echo off
setlocal enableDelayedExpansion

REM ToDoList Frontend Development Server

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

echo Starting ToDoList Frontend Development Server...
echo Server will be available at http://localhost:5173/
echo.

REM Run Vite directly
node "%SCRIPT_DIR%node_modules\vite\bin\vite.js"

pause
