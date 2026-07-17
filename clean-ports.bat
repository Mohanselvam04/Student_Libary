@echo off
echo =======================================================
echo LearnHub - Port & Node Process Cleaner
echo =======================================================
echo Terminating all active Node.js processes...
taskkill /F /IM node.exe
echo.
echo Done! All ports (3000, 8001, etc.) are now free.
echo You can start a clean dev server now.
echo =======================================================
pause
