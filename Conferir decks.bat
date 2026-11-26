@echo off
chcp 65001 >nul
cd /d "%~dp0"
node ferramentas\conferir-decks.js 6
echo.
pause
