@echo off
TITLE Nutriflow - Dev Mode
echo Starting Nutriflow Frontend and Backend Services...
echo.
npm run dev
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start services. Make sure node and npm are installed and you have run npm install.
    pause
)
