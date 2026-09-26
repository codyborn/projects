# Skill Tree Visualizer

A video game-style skill tree visualizer built with vanilla JavaScript and Cytoscape.js. Create, visualize, and track progress through interactive skill trees.

## Features

### ✅ All Phases Complete!

**Phase 1: Foundation**
- ✅ Interactive skill tree visualization with Cytoscape.js
- ✅ Hierarchical dagre layout for tree structures
- ✅ Node states: locked, unlocked, completed
- ✅ Pan/zoom controls
- ✅ Light/dark theme support
- ✅ Progress tracking
- ✅ Auto-save to localStorage

**Phase 2: Core Interactivity**
- ✅ Click nodes to view/edit details
- ✅ Completion tracking toggle
- ✅ Right-click context menu
- ✅ Add/edit/delete nodes
- ✅ Drag-and-drop reparenting with validation
- ✅ Node detail panel with markdown support

**Phase 3: Import/Export**
- ✅ JSON import/export with validation
- ✅ Subtree export functionality
- ✅ Tree library management in localStorage
- ✅ Sample tree library
- ✅ Merge and replace import modes

**Phase 4: Permalinks**
- ✅ Compressed URL sharing with LZ-String
- ✅ Import from permalinks
- ✅ Subtree attachment from URLs
- ✅ One-click copy to clipboard

**Phase 5: Polish & Features**
- ✅ LLM prompt template generator
- ✅ Quick AI prompt builder
- ✅ Markdown rendering with DOMPurify sanitization
- ✅ Enhanced animations and transitions
- ✅ Game-style visual effects
- ✅ Unlock logic based on prerequisites

**Phase 6: Deployment**
- ✅ GitHub Pages ready
- ✅ Mobile responsive design
- ✅ Accessibility features (ARIA labels)
- ✅ Cross-browser compatible
- ✅ Touch-optimized interface
- ✅ Performance optimized

## Getting Started

### Local Development

1. Clone the repository
2. Navigate to the skill_tree directory
3. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Open http://localhost:8000/skill_tree/ in your browser

### Usage

- **Click a node** to view and edit details
- **Right-click a node** for context menu options
- **Drag nodes** to rearrange the tree
- **Add child nodes** via the context menu
- **Mark nodes complete** to track your progress
- **Use zoom controls** to navigate large trees

## Technology Stack

- **Cytoscape.js** - Interactive graph visualization
- **Cytoscape-dagre** - Hierarchical layout algorithm
- **LZ-String** - URL compression for permalinks
- **Marked.js** - Markdown rendering
- **DOMPurify** - XSS protection for markdown
- **Vanilla JavaScript** - No framework dependencies

## File Structure

```
skill_tree/
├── index.html              # Main entry point
├── styles.css              # Styles and themes
├── js/
│   ├── main.js            # App initialization
│   ├── skill-tree.js      # Core SkillTree class
│   ├── node-renderer.js   # Node styling
│   ├── ui-controls.js     # UI components
│   ├── themes.js          # Theme management
│   ├── data-manager.js    # Import/export (Phase 3)
│   ├── permalink.js       # URL sharing (Phase 4)
│   └── llm-prompt.js      # AI prompts (Phase 5)
├── lib/                    # Third-party libraries
├── data/                   # Sample trees
└── assets/                 # Icons and images
```

## Data Model

### Node Structure
```javascript
{
  id: "unique_id",
  label: "Skill Name",
  description: "Markdown description",
  image: "path/to/image",
  completed: false,
  locked: false,
  parent: "parent_id",
  prerequisites: ["prereq_id"],
  metadata: { /* custom properties */ }
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (responsive design)

## License

MIT License - feel free to use and modify for your projects!

## Deployment

### Live Demo
Visit the live application: **https://codyborn.github.io/projects/skill_tree/**

### Deploy Your Own

The application is a static site that can be deployed anywhere:

```bash
# Local testing
cd skill_tree
python3 -m http.server 8000
# Visit http://localhost:8000

# Deploy to GitHub Pages (already configured)
git add .
git commit -m "Deploy Skill Tree Visualizer"
git push origin main
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions and options.

## Development Status

**Status:** ✅ All 6 Phases Complete

The Skill Tree Visualizer is production-ready with all planned features implemented:
- Full interactive editing and visualization
- Import/export with multiple formats
- Permalink sharing system
- AI-assisted tree generation
- Mobile-optimized responsive design
- Comprehensive accessibility support

## Contributing

Contributions are welcome! Some ideas for enhancements:
- Additional layout algorithms
- Canvas renderer for very large trees (>500 nodes)
- Collaborative editing features
- More sample trees
- Export to image/PDF
- Keyboard shortcuts for power users

## Acknowledgments

Built with:
- [Cytoscape.js](https://js.cytoscape.org/) - Graph visualization
- [Dagre](https://github.com/dagrejs/dagre) - Layout algorithm
- [LZ-String](https://github.com/pieroxy/lz-string) - Compression
- [Marked.js](https://marked.js.org/) - Markdown parsing
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS protection
