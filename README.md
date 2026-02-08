# Zen Text Editor - Progressive Web App

A peaceful, offline-capable writing environment with nature ambiance and rich text formatting.

## Features

- ✍️ Rich text editor with formatting toolbar (Bold, Italic, Underline, Strikethrough, Headings)
- 🎵 Offline ambient nature sounds (Rain, Forest, Ocean, Night) generated via Web Audio API
- 📊 Audio visualizer around editor border
- 🕐 Gradient-animated clock display
- 💾 Auto-saves content to localStorage
- 📴 Fully offline-capable PWA
- 📱 Installable on desktop and mobile devices
- 🎨 Beautiful gradient backgrounds for each scene

## Installation

### Option 1: Local Development Server

1. Place all files in a directory
2. Start a local web server (required for service worker):

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

3. Open browser to `http://localhost:8000`
4. Click install icon in address bar or use browser menu to "Install App"

### Option 2: Deploy to Web Host

1. Upload all files to your web hosting:
   - index.html
   - zen-editor.jsx
   - manifest.json
   - service-worker.js
   - icon-192.png
   - icon-512.png

2. Ensure HTTPS is enabled (required for PWA)
3. Visit your URL and install the app

## Files Included

- `index.html` - Main HTML file with PWA setup
- `zen-editor.jsx` - React application code
- `manifest.json` - PWA manifest configuration
- `service-worker.js` - Service worker for offline capability
- `icon-192.png` - App icon (192x192)
- `icon-512.png` - App icon (512x512)
- `icon.svg` - Source SVG icon

## Offline Capability

The app works completely offline by:

1. **Service Worker Caching** - All HTML, CSS, JS files are cached
2. **Web Audio API** - Nature sounds generated client-side (no downloads needed)
3. **LocalStorage** - Content automatically saved to browser storage
4. **Embedded Resources** - All assets are self-contained

## Usage

### Text Formatting
- Click the **▼** button in top-right of editor to show/hide toolbar
- Use toolbar buttons to format selected text
- Supports: Bold, Italic, Underline, Strikethrough, H1, H2, H3, Paragraph

### Audio Controls
- Click **▶** to play ambient nature sounds
- Adjust volume with slider
- Switch between scenes: Rain, Forest, Ocean, Night
- Visualizer shows animated bars around editor when playing

### Keyboard Shortcuts
- Standard text editing shortcuts work (Ctrl/Cmd + B for bold, etc.)

## Browser Support

Works on all modern browsers that support:
- Service Workers
- Web Audio API  
- LocalStorage
- ES6+ JavaScript

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Privacy

- No data sent to servers
- Everything stored locally in browser
- No analytics or tracking
- No network requests after initial load

## Technical Details

- **Framework**: React 18
- **Audio**: Web Audio API (no external audio files)
- **Storage**: LocalStorage
- **Offline**: Service Worker with cache-first strategy
- **Styling**: Pure CSS with animations

## Customization

Edit `zen-editor.jsx` to customize:
- Scene gradients in `NATURE_SCENES` array
- Audio generation in `generateAmbientAudio()` function
- Editor styles in the `styles` constant

## License

Free to use and modify for personal and commercial projects.
