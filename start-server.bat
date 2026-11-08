@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo Starting Visual Vocabulary server on http://localhost:3000 ...
node serve.js
pause
