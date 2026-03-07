#!/bin/bash

# PWA Icon Generator Script
# This script helps create placeholder PWA icons if you don't have design assets yet

echo "🎨 PWA Icon Generator"
echo "===================="
echo ""

# Check if we're in the frontend directory
if [ ! -d "public" ]; then
    echo "❌ Error: public/ directory not found"
    echo "Please run this script from the frontend/ directory"
    exit 1
fi

# Check for ImageMagick
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found"
    echo ""
    echo "To install ImageMagick:"
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt-get install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    echo ""
    echo "Alternatively, use an online tool:"
    echo "  👉 https://realfavicongenerator.net/"
    echo "  👉 https://www.pwabuilder.com/"
    echo ""
    exit 1
fi

# Ask for source image
echo "Do you have a logo/icon file to use? (y/n)"
read -r has_logo

if [ "$has_logo" = "y" ] || [ "$has_logo" = "Y" ]; then
    echo ""
    echo "Please enter the path to your logo file:"
    echo "(e.g., logo.png, /path/to/icon.svg)"
    read -r logo_path
    
    if [ ! -f "$logo_path" ]; then
        echo "❌ File not found: $logo_path"
        exit 1
    fi
    
    echo ""
    echo "🔄 Generating PWA icons from $logo_path..."
    
    # Determine which command to use
    if command -v magick &> /dev/null; then
        CONVERT_CMD="magick convert"
    else
        CONVERT_CMD="convert"
    fi
    
    # Generate 192x192 icon
    $CONVERT_CMD "$logo_path" -resize 192x192 -background none -gravity center -extent 192x192 public/pwa-192x192.png
    echo "✅ Generated: public/pwa-192x192.png"
    
    # Generate 512x512 icon
    $CONVERT_CMD "$logo_path" -resize 512x512 -background none -gravity center -extent 512x512 public/pwa-512x512.png
    echo "✅ Generated: public/pwa-512x512.png"
    
    # Optional: Generate favicon
    $CONVERT_CMD "$logo_path" -resize 32x32 public/favicon.ico
    echo "✅ Generated: public/favicon.ico"
    
    # Optional: Generate apple-touch-icon
    $CONVERT_CMD "$logo_path" -resize 180x180 public/apple-touch-icon.png
    echo "✅ Generated: public/apple-touch-icon.png"
    
    echo ""
    echo "✨ Icons generated successfully!"
    echo ""
    
else
    echo ""
    echo "📝 Creating placeholder icons..."
    echo ""
    echo "Placeholder icons will be created, but you should replace them with your actual logo."
    echo ""
    
    # Create placeholder using ImageMagick
    if command -v magick &> /dev/null; then
        CONVERT_CMD="magick"
    else
        CONVERT_CMD="convert"
    fi
    
    # Create 192x192 placeholder
    $CONVERT_CMD -size 192x192 xc:#16a34a \
        -gravity center \
        -pointsize 72 \
        -fill white \
        -annotate +0+0 "🍎" \
        public/pwa-192x192.png
    echo "✅ Created: public/pwa-192x192.png (placeholder)"
    
    # Create 512x512 placeholder
    $CONVERT_CMD -size 512x512 xc:#16a34a \
        -gravity center \
        -pointsize 192 \
        -fill white \
        -annotate +0+0 "🍎" \
        public/pwa-512x512.png
    echo "✅ Created: public/pwa-512x512.png (placeholder)"
    
    echo ""
    echo "⚠️  Remember to replace these placeholder icons with your actual logo!"
    echo ""
fi

echo ""
echo "🎉 Next steps:"
echo "1. Verify icons exist in public/ directory"
echo "2. Run: npm run build"
echo "3. Test PWA: npm run preview"
echo ""
echo "📖 See PWA_IMPLEMENTATION_GUIDE.md for more details"
