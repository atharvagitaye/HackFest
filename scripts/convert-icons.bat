@echo off
REM PWA Icon Converter Script (Windows)
REM Converts SVG icons to PNG format for PWA installation

echo PWA Icon Converter
echo ====================
echo.

cd frontend\public

REM Check if SVG files exist
if not exist "pwa-192x192.svg" (
    echo Error: pwa-192x192.svg not found in frontend\public\
    exit /b 1
)
if not exist "pwa-512x512.svg" (
    echo Error: pwa-512x512.svg not found in frontend\public\
    exit /b 1
)

echo Found SVG source files
echo.

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ImageMagick not found!
    echo.
    echo Please install ImageMagick:
    echo   Download from: https://imagemagick.org/script/download.php
    echo.
    echo OR use online converter:
    echo   https://cloudconvert.com/svg-to-png
    echo.
    exit /b 1
)

echo Converting icons...
echo.

REM Convert 192x192
echo Converting pwa-192x192.svg to pwa-192x192.png
magick convert -background none -density 192 pwa-192x192.svg -resize 192x192 pwa-192x192.png

if not exist "pwa-192x192.png" (
    echo Failed to create pwa-192x192.png
    exit /b 1
)

REM Convert 512x512
echo Converting pwa-512x512.svg to pwa-512x512.png
magick convert -background none -density 512 pwa-512x512.svg -resize 512x512 pwa-512x512.png

if not exist "pwa-512x512.png" (
    echo Failed to create pwa-512x512.png
    exit /b 1
)

echo.
echo Conversion successful!
echo.

REM Show files
echo Icon files created:
dir pwa-*.png /b
echo.

REM Ask to remove SVG files
set /p REPLY="Remove SVG files? (y/n): "
if /i "%REPLY%"=="y" (
    del pwa-192x192.svg
    del pwa-512x512.svg
    echo SVG files removed
) else (
    echo SVG files kept
)

echo.
echo Done! PWA icons are ready.
echo.
echo Next steps:
echo 1. Build the app: npm run build
echo 2. Preview: npm run preview
echo 3. Open http://localhost:4173
echo 4. Click 'Install App' button
echo.

pause
