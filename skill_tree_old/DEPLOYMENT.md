# Deployment Guide - Skill Tree Visualizer

## Overview
The Skill Tree Visualizer is a client-side static application that can be deployed to any static hosting service. No server-side components are required.

## Deployment Options

### Option 1: GitHub Pages (Recommended)

The application is already set up for GitHub Pages deployment:

1. **Ensure all files are committed:**
   ```bash
   cd /Users/cody.born/repos/projects
   git add skill_tree/
   git commit -m "Add Skill Tree Visualizer"
   git push origin main
   ```

2. **GitHub Pages should automatically deploy** if enabled for the repository. The app will be available at:
   - Main landing: `https://codyborn.github.io/projects/`
   - Skill Tree: `https://codyborn.github.io/projects/skill_tree/`

3. **Verify deployment:**
   - Visit the URL after a few minutes
   - Check that all features work (import/export, permalinks, dark mode)
   - Test on mobile devices

### Option 2: Local Development Server

For local testing and development:

```bash
# Navigate to the skill_tree directory
cd /Users/cody.born/repos/projects/skill_tree

# Start a local server (choose one):

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# Access the application
# Open http://localhost:8000 in your browser
```

### Option 3: Netlify

1. **Create a new site:**
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Set build settings:
     - Base directory: `skill_tree`
     - Build command: (leave empty)
     - Publish directory: `.`

2. **Deploy:**
   - Netlify will automatically deploy on push to main
   - Custom domain can be configured in site settings

### Option 4: Vercel

1. **Import project:**
   - Go to https://vercel.com/
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set root directory to `skill_tree`

2. **Deploy:**
   - Vercel will automatically deploy
   - Custom domains supported

## Pre-Deployment Checklist

- [x] All JavaScript files are present and properly linked
- [x] All library dependencies are included in `lib/` directory
- [x] CSS is optimized and responsive
- [x] Sample data files are included
- [x] README documentation is complete
- [x] Mobile responsive design is tested
- [x] Cross-browser compatibility verified
- [x] Accessibility features implemented (ARIA labels)
- [x] Dark mode toggle working
- [x] All features functional:
  - [x] Node creation/editing/deletion
  - [x] Drag-and-drop reparenting
  - [x] Import/Export JSON
  - [x] Permalink generation
  - [x] Import from URL
  - [x] LLM prompt generation
  - [x] Progress tracking
  - [x] Completion state management
  - [x] LocalStorage persistence

## Post-Deployment Testing

After deployment, verify these features:

1. **Core Functionality:**
   - Create a new tree
   - Add/edit/delete nodes
   - Mark nodes as complete
   - Drag nodes to reparent

2. **Import/Export:**
   - Export current tree
   - Import a JSON file
   - Export a subtree
   - Import sample trees

3. **Permalinks:**
   - Generate a permalink
   - Copy to clipboard
   - Open permalink in new browser
   - Import from URL

4. **UI/UX:**
   - Toggle dark mode
   - Test zoom controls
   - Test on mobile device
   - Test on different browsers (Chrome, Firefox, Safari)

5. **Performance:**
   - Create a tree with 50+ nodes
   - Test drag-and-drop with large tree
   - Verify smooth animations

## Browser Support

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Known Issues

None at this time. If you encounter issues, please report them.

## Environment Variables

This application does not require any environment variables or server-side configuration.

## CDN Fallbacks

All libraries are included locally in the `lib/` directory. No CDN dependencies are required, ensuring the app works offline once loaded.

## Security

- All user input is sanitized with DOMPurify
- Markdown rendering is safe and XSS-protected
- No server-side data storage (all local)
- Permalinks use compression only, no encryption (data is visible in URL)

## Performance Optimization

Current optimizations:
- Minified library files
- CSS variables for theme switching (no recalculation)
- LocalStorage for persistence
- Efficient Cytoscape rendering
- Debounced auto-save

Future optimizations (if needed):
- Canvas renderer for trees >500 nodes
- Code splitting for large libraries
- Service worker for offline support
- Image optimization for node icons

## Monitoring

For GitHub Pages deployment, monitor:
- GitHub Actions build status
- Browser console for errors
- User feedback/issues

## Rollback Procedure

If issues are found after deployment:

1. **Revert to previous commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Or reset to specific commit:**
   ```bash
   git reset --hard <commit-hash>
   git push origin main --force
   ```

3. **GitHub Pages will automatically redeploy** the previous version

## Support

For issues or questions:
- GitHub Issues: Create an issue in the repository
- Email: (Add your support email if desired)

## License

MIT License - See LICENSE file for details
