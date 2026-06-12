@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0hot-deploy-to-nas.ps1" %*
