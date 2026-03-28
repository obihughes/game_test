@echo off
setlocal
cd /d "%~dp0"

echo.
echo  Caravan Merchant - starting Vite (no default browser).
echo  Opening Microsoft Edge to http://localhost:5173 in a few seconds...
echo.

start "Caravan Merchant - Vite" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

where msedge >nul 2>&1
if %ERRORLEVEL% equ 0 (
  start msedge "http://localhost:5173"
) else (
  echo  msedge not in PATH. Trying common Edge install path...
  if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "http://localhost:5173"
  ) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "http://localhost:5173"
  ) else (
    echo  Could not find Edge. Open http://localhost:5173 in Edge manually.
    pause
  )
)

echo.
echo  You can close this window. Leave the Vite window open while you play.
echo.
pause
