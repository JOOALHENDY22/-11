@echo off
chcp 65001 >nul
title SafeRx - Production Build
color 0A

echo ================================================================
echo             SafeRx Production Build Tool
echo ================================================================
echo.
echo Building TypeScript and optimized production bundle...
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ================================================================
    echo [SUCCESS] Build completed successfully! Output located in /dist
    echo ================================================================
) else (
    echo.
    echo [ERROR] Build failed. Please inspect logs above.
)

pause
