@echo off
setlocal
echo ==========================================
echo    RoboVault - GitHub Push Launcher
echo ==========================================

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0push-to-github.ps1"

pause
