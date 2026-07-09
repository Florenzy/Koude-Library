@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not available in PATH.
  echo Install Node.js 22 or newer and run this file again.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Installing Koude Library dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
echo Starting Koude Library...
call npm run dev
endlocal
