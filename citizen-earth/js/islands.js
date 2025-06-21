// Island rendering and management
let canvasesInitialized = false;
let islandBounds = [];

// Initialize SpaceTracker with page height
const spaceTracker = new SpaceTracker(document.documentElement.scrollHeight);

// Grid and SVG elements
const grid = document.querySelector('.island-grid');
const svg = document.getElementById('island-lines');

// Preload all images to prevent mobile lazy loading
function preloadImages() {
  cities.forEach(cityObj => {
    const img = new Image();
    img.src = cityObj.islandImg;
  });
}

// Start preloading immediately
preloadImages();

function renderIslands() {
  grid.innerHTML = '';
  const cols = getColumnCount();
  const rows = Math.ceil(cities.length / cols);
  const positions = [];
  
  cities.forEach((cityObj, i) => {
    const row = Math.floor(i / cols);
    let col = i % cols;
    if (row % 2 === 1) col = cols - 1 - col;
    const div = document.createElement('div');
    div.className = 'island';
    div.onclick = () => {
      if (cityObj.blog) {
        openBlogPost(cityObj.blog, cityObj.blogTitle, cityObj.name);
      }
    };
    div.style.gridRow = (row + 1).toString();
    div.style.gridColumn = (col + 1).toString();
    div.innerHTML = `
      <img src="${cityObj.islandImg}" alt="${cityObj.name}" style="width: ${cityObj.size ? cityObj.size + 'px' : '120px'}; height: auto;" loading="eager">
      <div class="city-name">${cityObj.name}</div>
      <div class="island-tooltip">
        <div><strong>${cityObj.duration}</strong></div>
        <div>${cityObj.dates}</div>
        ${cityObj.blog ? `<div><a href="#">${cityObj.blogTitle}</a></div>` : ''}
      </div>
    `;
    positions.push({row, col, div});
    
    // Tooltip show/hide
    div.addEventListener('mouseenter', () => {
      div.querySelector('.island-tooltip').style.opacity = 1;
    });
    div.addEventListener('mouseleave', () => {
      div.querySelector('.island-tooltip').style.opacity = 0;
    });
    grid.appendChild(div);
  });
  
  setTimeout(updateIslandBounds, 100);
  
  // Wait for all island images to load before drawing lines
  const waitForImagesAndDraw = () => {
    const islandImages = Array.from(document.querySelectorAll('.island img'));
    const imagePromises = islandImages.map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      });
    });
    
    Promise.all(imagePromises).then(() => {
        setTimeout(() => {
            if (!canvasesInitialized) {
                canvasesInitialized = true;
                updateAllCanvasSizes();
                initializeClouds();
                initializeSailboats();
            }
            drawLines(positions, cols, rows);
            setupMobileTooltips();
            handleScroll();
        }, 200);
    });
  };
  
  waitForImagesAndDraw();
}

function updateIslandBounds() {
  islandBounds = [];
  const islands = document.querySelectorAll('.island img');
  islands.forEach(img => {
    const rect = img.getBoundingClientRect();
    islandBounds.push({
      top: rect.top + window.scrollY,
      bottom: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      right: rect.right + window.scrollX
    });
  });
  
  if (debugMode) {
    drawIslandBounds();
  }
}

function drawLines(positions, cols, rows) {
  svg.innerHTML = '';
  svg.setAttribute('width', document.body.scrollWidth);
  svg.setAttribute('height', document.body.scrollHeight);
  
  const centers = positions.map(({div}) => {
    const img = div.querySelector('img');
    const rect = img.getBoundingClientRect();
    return {
      x: rect.left + rect.width/2 + window.scrollX,
      y: rect.top + rect.height/2 + window.scrollY
    };
  });
  
  for (let i = 0; i < centers.length - 1; i++) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centers[i].x);
    line.setAttribute('y1', centers[i].y);
    line.setAttribute('x2', centers[i+1].x);
    line.setAttribute('y2', centers[i+1].y);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
    line.setAttribute('stroke-width', '4');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-dasharray', '8,8');
    svg.appendChild(line);
  }
}

function storeIslandBounds() {
  spaceTracker.reset(document.documentElement.scrollHeight);
  const islands = document.querySelectorAll('.island');
  // Add the top of the page as an occupied space
  spaceTracker.addOccupiedSpace(0, 200);
  islands.forEach(island => {
    const img = island.querySelector('img');
    const rect = img.getBoundingClientRect();
    spaceTracker.addOccupiedSpace(rect.top + window.scrollY, rect.height);
  });
  if (debugMode) {
    drawSpaceTrackerLines();
  }
}

function setupMobileTooltips() {
//   const isMobile = window.innerWidth <= 600;
//   if (!isMobile) return;

  const islands = document.querySelectorAll('.island');
  const firstIsland = islands[0];
  const lastIsland = islands[islands.length - 1];

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const tooltip = entry.target.querySelector('.island-tooltip');
      if (entry.isIntersecting) {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(-10px)';
      } else {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  islands.forEach(island => {
    observer.observe(island);
  });

  function handleScroll() {
    if (debugMode) {
      drawSpaceTrackerLines();
    }
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollY <= 50) {
      const firstTooltip = firstIsland.querySelector('.island-tooltip');
      firstTooltip.style.opacity = '1';
      firstTooltip.style.transform = 'translateY(-10px)';
    }
    
    if (scrollY + windowHeight >= documentHeight - 50) {
      const lastTooltip = lastIsland.querySelector('.island-tooltip');
      lastTooltip.style.opacity = '1';
      lastTooltip.style.transform = 'translateY(-10px)';
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();
}

// Debug functions
function getDebugCanvas() {
  let debugCanvas = document.getElementById('debug-canvas');
  if (!debugCanvas) {
    debugCanvas = document.createElement('canvas');
    debugCanvas.id = 'debug-canvas';
    debugCanvas.style.position = 'absolute';
    debugCanvas.style.top = '0';
    debugCanvas.style.left = '0';
    debugCanvas.style.pointerEvents = 'none';
    debugCanvas.style.zIndex = '9999';
    document.body.appendChild(debugCanvas);
  }
  return debugCanvas;
}

function drawIslandBounds() {
  let debugCanvas = getDebugCanvas();
  const ctx = debugCanvas.getContext('2d');
  debugCanvas.width = window.innerWidth;
  debugCanvas.height = document.documentElement.scrollHeight;
  
  ctx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
  
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  
  islandBounds.forEach(bounds => {
    ctx.beginPath();
    ctx.rect(
      bounds.left,
      bounds.top,
      bounds.right - bounds.left,
      bounds.bottom - bounds.top
    );
    ctx.stroke();
  });
}

function drawSpaceTrackerLines() {
  let debugCanvas = getDebugCanvas();
  const ctx = debugCanvas.getContext('2d');
  debugCanvas.width = window.innerWidth;
  debugCanvas.height = document.documentElement.scrollHeight;
  
  const availableSpaces = spaceTracker.getAvailableSpaces(1);
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
  ctx.lineWidth = 2;
  
  availableSpaces.forEach(space => {
    ctx.beginPath();
    ctx.moveTo(1, space.start);
    ctx.lineTo(1, space.end);
    ctx.stroke();
  });
}

// Initialize islands
grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
window.addEventListener('resize', renderIslands);
renderIslands();

// Export for use in other modules
window.islandBounds = islandBounds;
window.storeIslandBounds = storeIslandBounds; 