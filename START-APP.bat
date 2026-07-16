@echo off
title JAGA — Guard Your Ground
cd /d "%~dp0"
echo Membuka JAGA di browser...
start "" "http://localhost:8199/"
node serve.js
if errorlevel 1 (
  echo Node tidak ditemukan — mencoba Python...
  python -m http.server 8199
)
pause
