// Main application initialization and night mode functionality
const debugMode = false;

// Make debugMode available globally
window.debugMode = debugMode;

// Lock orientation to portrait on mobile devices
if (window.innerWidth <= 600 && screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('portrait').catch(() => {
    console.log('Orientation lock not supported');
  });
}

// Night mode toggle functionality
function toggleNightMode() {
  document.body.classList.toggle('night-mode');
  
  // Save the night mode preference
  const isNightMode = document.body.classList.contains('night-mode');
  localStorage.setItem('night-mode', isNightMode);
}

// Load night mode preference on page load
window.addEventListener('DOMContentLoaded', () => {
  const savedNightMode = localStorage.getItem('night-mode');
  if (savedNightMode === 'true') {
    document.body.classList.add('night-mode');
  }
});

// Add keyboard shortcut for night mode (N key)
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.altKey && !event.metaKey) {
    toggleNightMode();
  }
});

// Add window resize and scroll handlers to update island bounds
window.addEventListener('resize', () => {
  updateAllCanvasSizes();
  updateIslandBounds();
});

window.addEventListener('scroll', updateIslandBounds);

// Export for use in other modules
window.toggleNightMode = toggleNightMode; 