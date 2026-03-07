#!/bin/bash

# PWA Icon Converter Script
# Converts SVG icons to PNG format for PWA installation

set -e  # Exit on error

echo "🎨 PWA Icon Converter"
echo "===================="
echo ""

cd frontend/public

# Check if SVG files exist
if [ ! -f "pwa-192x192.svg" ] || [ ! -f "pwa-512x512.svg" ]; then
    echo "❌ Error: SVG files not found in frontend/public/"
    echo "   Expected files:"
    echo "   - pwa-192x192.svg"
    echo "   - pwa-512x512.svg"
    exit 1
fi

echo "✅ Found SVG source files"
echo ""

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found!"
    echo ""
    echo "Please install ImageMagick:"
    echo ""
    echo "macOS:"
    echo "  brew install imagemagick"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install imagemagick"
    echo ""
    echo "Windows:"
    echo "  Download from: https://imagemagick.org/script/download.php"
    echo ""
    echo "OR use online converter:"
    echo "  https://cloudconvert.com/svg-to-png"
    echo ""
    exit 1
fi

# Determine command (magick vs convert)
if command -v magick &> /dev/null; then
    CMD="magick convert"
else
    CMD="convert"
fi

echo "🔄 Converting icons..."
echo ""

# Convert 192x192
echo "Converting pwa-192x192.svg → pwa-192x192.png"
$CMD -background none -density 192 pwa-192x192.svg -resize 192x192 pwa-192x192.png

if [ ! -f "pwa-192x192.png" ]; then
    echo "❌ Failed to create pwa-192x192.png"
    exit 1
fi

# Convert 512x512
echo "Converting pwa-512x512.svg → pwa-512x512.png"
$CMD -background none -density 512 pwa-512x512.svg -resize 512x512 pwa-512x512.png

if [ ! -f "pwa-512x512.png" ]; then
    echo "❌ Failed to create pwa-512x512.png"
    exit 1
fi

echo ""
echo "✅ Conversion successful!"
echo ""

# Show file sizes
echo "📊 Icon files:"
ls -lh pwa-*.png | awk '{print "   " $9 " - " $5}'
echo ""

# Ask to remove SVG files
read -p "Remove SVG files? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm pwa-192x192.svg pwa-512x512.svg
    echo "✅ SVG files removed"
else
    echo "ℹ️  SVG files kept"
fi

echo ""
echo "🎉 Done! PWA icons are ready."
echo ""
echo "Next steps:"
echo "1. Build the app: npm run build"
echo "2. Preview: npm run preview"
echo "3. Open http://localhost:4173"
echo "4. Click 'Install App' button"
echo ""
