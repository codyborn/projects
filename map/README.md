# Citizen Earth

A beautiful interactive travel map with animated water effects, sailing boats, and blog posts.

## Features

- **Interactive Travel Map**: Click on islands to see travel details
- **Animated Water Effects**: Dynamic wave animations
- **Sailing Boats**: Click to sink boats and trigger boss ship battles
- **Blog Reader**: Read travel stories with markdown support and animations
- **Night Mode**: Toggle between day and night themes
- **Mobile Responsive**: Optimized for mobile devices
- **Share Links**: Share direct links to specific blog posts

## File Structure

```
citizen-earth/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles
├── js/
│   ├── data.js             # Cities data and utility functions
│   ├── water.js            # Water animation effects
│   ├── clouds.js           # Cloud animation system
│   ├── boats.js            # Boat game mechanics and boss ship
│   ├── islands.js          # Island rendering and tooltips
│   ├── blog-reader.js      # Blog overlay and markdown parsing
│   └── main.js             # Main initialization and night mode
├── images/                 # Image assets
└── posts/                  # Markdown blog posts
    └── miami.md           # Example blog post
```

## How to Run

1. **Local Development Server** (Recommended):
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx live-server --port=8000 --no-browser
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Open in Browser**:
   - Navigate to `http://localhost:8000`
   - The application requires a local server due to CORS restrictions

## Controls

- **Click Islands**: View travel details and blog posts
- **Click Boats**: Sink boats (after 50 boats, boss ship appears)
- **N Key**: Toggle night mode
- **Escape Key**: Close blog overlay
- **Share Button**: Copy direct link to current blog post

## Blog Features

- **Markdown Support**: Headers, bold, italic, links
- **Text Animations**: Multiple animation styles available
- **Auto-open**: Direct links with `?city=Miami` parameter
- **Dark Mode**: Blog overlay adapts to night mode
- **Mobile Optimized**: Responsive design for all devices

## Animation Types

Change the `ANIMATION_TYPE` constant in `js/blog-reader.js`:

- `'paragraph-fade'` (default) - Each paragraph fades in
- `'typing'` - Character-by-character typing
- `'fade-in'` - Simple fade in
- `'slide-up'` - Slide up from bottom
- `'reveal'` - Curtain reveal effect
- `'gentle-type'` - Word-by-word typing

## Adding New Cities

Edit the `cities` array in `js/data.js`:

```javascript
{
  name: 'City Name',
  dates: 'Month - Month',
  duration: 'X months/weeks',
  islandImg: './images/city.png',
  blog: './posts/city.md',        // Optional
  blogTitle: 'Blog Title',        // Optional
  size: 160                       // Optional image size
}
```

## Adding Blog Posts

1. Create a markdown file in the `posts/` directory
2. Add the blog reference to the city in `js/data.js`
3. Use standard markdown syntax:
   - `# H1`, `## H2`, `### H3` for headers
   - `**bold**` and `*italic*` for emphasis
   - `[link text](url)` for links

## Browser Compatibility

- Modern browsers with ES6+ support
- Canvas API for animations
- Fetch API for loading blog posts
- LocalStorage for night mode preference

## Development

The code is organized into modular JavaScript files:

- **data.js**: Contains all static data and utility classes
- **water.js**: Handles water canvas and wave animations
- **clouds.js**: Manages cloud spawning and movement
- **boats.js**: Boat game mechanics, collision detection, and boss ship
- **islands.js**: Island rendering, tooltips, and mobile interactions
- **blog-reader.js**: Blog overlay, markdown parsing, and text animations
- **main.js**: Application initialization and night mode functionality

Each module exports necessary functions to the global scope for cross-module communication. 