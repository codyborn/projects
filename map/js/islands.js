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

// Load GIFs after PNG images are loaded (for better experience on slow connections)
function loadGifsAfterImages() {
  // Wait for all PNG images to be loaded first
  const islandImages = Array.from(document.querySelectorAll('.island img'));
  const imagePromises = islandImages.map(img => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });
  
  Promise.all(imagePromises).then(() => {
    // All PNG images are loaded, now attempt to load GIFs
    cities.forEach((cityObj, index) => {
      if (cityObj.islandGif) {
        const gifImg = new Image();
        gifImg.onload = () => {
          // Replace PNG with GIF once it's loaded
          const islandDiv = document.querySelectorAll('.island')[index];
          if (islandDiv) {
            const imgElement = islandDiv.querySelector('img');
            if (imgElement) {
              imgElement.src = cityObj.islandGif;
            }
          }
        };
        // Don't handle errors - if GIF fails to load, just keep the PNG
        gifImg.src = cityObj.islandGif;
      }
    });
  });
}

// Start preloading immediately
preloadImages();

function renderIslands() {
  grid.innerHTML = '';
  const cols = getColumnCount();
  const positions = [];
  
  // Track the current row for grid placement (accounts for year separator rows)
  let currentGridRow = 0;
  let currentYear = null;
  let islandIndexInRow = 0;
  
  cities.forEach((cityObj, i) => {
    // Check if we need to insert a year separator
    if (cityObj.year && cityObj.year !== currentYear) {
      // If not the first year, complete the current row if partially filled
      if (currentYear !== null && islandIndexInRow > 0) {
        currentGridRow++;
        islandIndexInRow = 0;
      }
      
      // Create year separator
      const yearSeparator = document.createElement('div');
      yearSeparator.className = 'year-separator';
      yearSeparator.style.gridRow = (currentGridRow + 1).toString();
      yearSeparator.style.gridColumn = `1 / -1`;
      yearSeparator.innerHTML = `<span class="year-label">${cityObj.year}</span>`;
      grid.appendChild(yearSeparator);
      
      currentGridRow++;
      currentYear = cityObj.year;
    }
    
    // Calculate column position with snake pattern
    let col = islandIndexInRow % cols;
    const rowWithinYear = Math.floor(islandIndexInRow / cols);
    if (rowWithinYear % 2 === 1) col = cols - 1 - col;
    
    const div = document.createElement('div');
    div.className = 'island';
    div.onclick = () => {
      if (cityObj.blog) {
        openBlogPost(cityObj.blog, cityObj.blogTitle, cityObj.name);
      }
    };
    div.style.gridRow = (currentGridRow + 1).toString();
    div.style.gridColumn = (col + 1).toString();
    div.innerHTML = `
      <img src="${cityObj.islandImg}" alt="${cityObj.name}" style="width: ${cityObj.size ? cityObj.size + 'px' : '120px'}; height: auto;" loading="eager">
      <div class="city-name">${cityObj.name}</div>
      <div class="island-tooltip">
        ${cityObj.subtitle ? `<div class="city-subtitle">${cityObj.subtitle}</div>` : ''}
        <div class="city-dates">
            ${cityObj.dates} 
            ${cityObj.subtitle ? `<span style="float: right; padding-left: 10px;">${cityObj.duration}</span>` : ''}
        </div>
        ${!cityObj.subtitle ? `<div class="city-duration">${cityObj.duration}</div>` : ''}
        ${cityObj.blog ? `<div><a href="#">${cityObj.blogTitle}</a></div>` : ''}
      </div>
    `;
    positions.push({row: currentGridRow, col, div});
    
    // Tooltip show/hide
    div.addEventListener('mouseenter', () => {
      div.querySelector('.island-tooltip').style.opacity = 1;
    });
    div.addEventListener('mouseleave', () => {
      div.querySelector('.island-tooltip').style.opacity = 0;
    });
    grid.appendChild(div);
    
    islandIndexInRow++;
    // Move to next row when current row is full
    if (islandIndexInRow % cols === 0) {
      currentGridRow++;
    }
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
        if (!canvasesInitialized) {
            canvasesInitialized = true;
            updateAllCanvasSizes();
            initializeClouds();
            initializeSailboats();
        }
        drawLines(positions, cols);
        setupMobileTooltips();
        
        // Scroll to current island on mobile after everything is rendered
        if (typeof scrollToCurrentIsland === 'function') {
            scrollToCurrentIsland();
        }
        
        // Start loading GIFs after PNG images are loaded
        loadGifsAfterImages();
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
  
  if (window.debugMode) {
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
  if (window.debugMode) {
    drawSpaceTrackerLines();
  }
}

function setupMobileTooltips() {
  const isMobile = window.innerWidth <= 600;
  if (!isMobile) return;

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
    if (window.debugMode) {
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
window.addEventListener('resize', () => {
  renderIslands();
});
renderIslands();

// Export for use in other modules
window.islandBounds = islandBounds;
window.storeIslandBounds = storeIslandBounds; 