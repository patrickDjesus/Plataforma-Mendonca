@ECHO off
CD /d "%~dp0"
node "node_modules\vite\bin\vite.js" build
