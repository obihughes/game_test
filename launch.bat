@echo off
title Fish Tank Game
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Download it from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)

echo.
echo Starting Fish Tank Game...
echo Your browser will open automatically.
echo Close this window to stop the game.
echo.

call npm run start

pause
