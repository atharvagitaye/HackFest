/**
 * Generate Placeholder PWA Icons
 * Falls back to simple SVG if no image processing library available
 */

const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create SVG icons with food/sustainability theme
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#16a34a" rx="${size * 0.2}"/>
  
  <!-- Food/Apple Icon -->
  <g transform="translate(${size * 0.5}, ${size * 0.5})">
    <!-- Apple body -->
    <path d="M -${size * 0.25} -${size * 0.1} 
             Q -${size * 0.3} -${size * 0.3}, -${size * 0.15} -${size * 0.35}
             Q 0 -${size * 0.38}, ${size * 0.15} -${size * 0.35}
             Q ${size * 0.3} -${size * 0.3}, ${size * 0.25} -${size * 0.1}
             Q ${size * 0.3} ${size * 0.15}, ${size * 0.2} ${size * 0.3}
             Q ${size * 0.05} ${size * 0.35}, 0 ${size * 0.35}
             Q -${size * 0.05} ${size * 0.35}, -${size * 0.2} ${size * 0.3}
             Q -${size * 0.3} ${size * 0.15}, -${size * 0.25} -${size * 0.1} Z" 
          fill="white"/>
    
    <!-- Leaf -->
    <path d="M ${size * 0.05} -${size * 0.38}
             Q ${size * 0.12} -${size * 0.42}, ${size * 0.15} -${size * 0.35}
             Q ${size * 0.1} -${size * 0.4}, ${size * 0.05} -${size * 0.38} Z"
          fill="#dcfce7"/>
  </g>
  
  <!-- Text -->
  <text x="${size * 0.5}" y="${size * 0.85}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.12}" 
        font-weight="bold"
        fill="white" 
        text-anchor="middle">FOOD</text>
</svg>`;
}

// Write SVG files
const icon192 = createSVGIcon(192);
const icon512 = createSVGIcon(512);

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.svg'), icon192);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.svg'), icon512);

console.log('✅ Created SVG placeholder icons:');
console.log('   - public/pwa-192x192.svg');
console.log('   - public/pwa-512x512.svg');
console.log('');
console.log('⚠️  Note: PWA manifest expects PNG files.');
console.log('');
console.log('To convert to PNG:');
console.log('1. Use online tool: https://cloudconvert.com/svg-to-png');
console.log('2. Or install ImageMagick and run: ./generate-pwa-icons.sh');
console.log('');
console.log('For production, replace with your actual logo!');
