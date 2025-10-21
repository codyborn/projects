// Bottle system for message bottles
// NOTE: Make sure to add a bottle.png image to the images/ directory
const bottleImage = new Image();
bottleImage.src = './images/bottle.png';
let bottles = [];
let bottleSpawnProbability = 0.0003;
let lastBottleFrameTime = 0;
let bottleLifetime = 15000; // 15 seconds in milliseconds
let bottleSinkTime = 3000; // 3 seconds to sink
let bottleSize = 0.1;
let quoteDisplayDuration = 10000; // 10 seconds in milliseconds

// Bottle canvas setup
const bottleCanvas = document.getElementById('bottle-canvas');
const bottleCtx = bottleCanvas.getContext('2d');

function resizeBottleCanvas() {      
  bottleCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  bottleCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight, document.body.offsetHeight);
}

function checkBottleOverlap(bottleX, bottleY, bottleWidth, bottleHeight) {
  const bottleBottom = bottleY + bottleHeight;
  const bottleTop = bottleY;
  const bottleRight = bottleX + bottleWidth;

  if (window.debugMode) {
    bottleCtx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    bottleCtx.lineWidth = 2;
    bottleCtx.beginPath();
    bottleCtx.rect(
      bottleX,
      bottleTop,
      bottleWidth,
      bottleHeight
    );
    bottleCtx.stroke();
  }
  
  for (let island of islandBounds) {
    if ((bottleX == -1 || (bottleX < island.right && bottleRight > island.left)) &&
        bottleTop < island.bottom && bottleBottom > island.top) {
      return true;
    }
  }
  return false;
}

function getValidBottlePosition(bottleSize) {
  const maxAttempts = 50;
  let attempts = 0;
  
  const initialBottleWidth = bottleImage.width * bottleSize;
  const initialBottleHeight = bottleImage.height * bottleSize;
  
  while (attempts < maxAttempts) {
    const randomX = Math.random() * bottleCanvas.width;
    const randomY = Math.random() * bottleCanvas.height;
    
    if (!checkBottleOverlap(randomX, randomY, initialBottleWidth, initialBottleHeight)) {
      return { x: randomX, y: randomY };
    }
    attempts++;
  }
  
  const fallbackPositions = [
    { x: 100, y: 100 },
    { x: bottleCanvas.width - 100, y: 100 },
    { x: 100, y: bottleCanvas.height - 100 },
    { x: bottleCanvas.width - 100, y: bottleCanvas.height - 100 }
  ];
  
  for (let pos of fallbackPositions) {
    if (!checkBottleOverlap(pos.x, pos.y, initialBottleWidth, initialBottleHeight)) {
      return pos;
    }
  }
  
  return { x: 100, y: 100 };
}

// Bottle class
class Bottle {
  constructor(x, y, size, image, quoteIndex) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.image = image;
    this.quoteIndex = quoteIndex;
    this.spawnTime = Date.now();
    this.sinking = false;
    this.sinkProgress = .3;
    this.sinkSpeed = 0.002;
    this.bobbingPhase = Math.random() * Math.PI * 2;
    this.bobbingAmplitude = 2;
    this.bobbingSpeed = 0.003;
    this.originalY = y;
  }

  update(deltaTime) {
    const currentTime = Date.now();
    const timeAlive = currentTime - this.spawnTime;
    
    // Bobbing animation
    this.y = this.originalY + Math.sin(currentTime * this.bobbingSpeed + this.bobbingPhase) * this.bobbingAmplitude;
    
    // Check if bottle should start sinking
    if (timeAlive > bottleLifetime && !this.sinking) {
      this.sinking = true;
    }
    
    if (this.sinking) {
      this.sinkProgress += this.sinkSpeed * (deltaTime / 16.67);
      this.y += this.sinkSpeed * this.size * this.image.height * 0.5 * (deltaTime / 16.67);
      
      if (this.sinkProgress >= 1) {
        return false; // Remove bottle
      }
    }
    
    return true;
  }

  draw(ctx) {
    ctx.save();
    
    const centerX = this.x + (this.image.width * this.size) / 2;
    const centerY = this.y + (this.image.height * this.size) / 2;
    
    ctx.translate(centerX, centerY);
    
    if (this.sinkProgress > 0) {
      const clipHeight = this.image.height * this.size * (1 - this.sinkProgress);
      
      ctx.beginPath();
      const width = this.image.width * this.size;
      const segments = 15;
      const segmentWidth = width / segments;
      
      ctx.moveTo(-width/2, -this.image.height * this.size / 2);
      
      const time = Date.now() * 0.001;
      const waveAmplitude = this.size * 1.5;
      
      for (let i = 0; i <= segments; i++) {
        const x = -width/2 + (i * segmentWidth);
        const phase1 = i * 1.0 - (time * 1.5);
        const phase2 = i * 0.6 - (time * 1.0);
        
        const wave1 = Math.sin(phase1) * waveAmplitude;
        const wave2 = Math.sin(phase2) * (waveAmplitude * 0.6);
        
        const combinedWave = wave1 + wave2;
        const y = -this.image.height * this.size / 2 + clipHeight + combinedWave;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width/2, -this.image.height * this.size / 2);
      ctx.closePath();
      ctx.clip();
    }


    
    ctx.drawImage(
      this.image,
      -(this.image.width * this.size) / 2,
      -(this.image.height * this.size) / 2,
      this.image.width * this.size,
      this.image.height * this.size
    );
    
    ctx.restore();
  }

  isPointInside(x, y) {
    const bottleWidth = this.image.width * this.size;
    const bottleHeight = this.image.height * this.size;
    
    return x >= this.x && 
           x <= this.x + bottleWidth &&
           y >= this.y && 
           y <= this.y + bottleHeight;
  }

  showQuote() {
    if (this.quoteIndex >= 0 && this.quoteIndex < quotes.length) {
      const quote = quotes[this.quoteIndex];
      
      // Create or update quote display
      let quoteDisplay = document.getElementById('quote-display');
      if (!quoteDisplay) {
        quoteDisplay = document.createElement('div');
        quoteDisplay.id = 'quote-display';
        quoteDisplay.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 20px;
          border-radius: 10px;
          max-width: 400px;
          text-align: center;
          font-family: 'Georgia', serif;
          font-style: italic;
          font-size: 16px;
          line-height: 1.5;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          animation: wipeIn 0.8s ease-out forwards;
        `;
        document.body.appendChild(quoteDisplay);
        
        // Close quote on click
        quoteDisplay.addEventListener('click', () => {
          quoteDisplay.remove();
        });
      }
      
              // Create a text span for the mirage effect
        const quoteText = document.createElement('span');
        quoteText.textContent = `"${quote}"`;
        quoteText.style.cssText = `
          display: block;
          opacity: 0;
        `;
        if (quoteDisplay.firstChild) {
          quoteDisplay.removeChild(quoteDisplay.firstChild);
        }
        quoteDisplay.appendChild(quoteText);
        
        // Apply mirage animation to the text after container wipe-in
        quoteText.style.animation = 'mirageIn 2s ease-out forwards';
        
        // Auto-remove after quoteDisplayDuration seconds
        setTimeout(() => {
          if (quoteDisplay.parentNode) {
            quoteDisplay.remove();
          }
        }, quoteDisplayDuration);
    }
  }
}

function spawnNewBottle() {
  if (!bottleImage.complete) return;
  
  const validPosition = getValidBottlePosition(bottleSize);
  
  bottles.push(new Bottle(
    validPosition.x,
    validPosition.y,
    bottleSize,
    bottleImage,
    Math.floor(Math.random() * quotes.length)
  ));
}

function updateBottles(deltaTime) {
  for (let i = bottles.length - 1; i >= 0; i--) {
    if (!bottles[i].update(deltaTime)) {
      bottles.splice(i, 1);
    }
  }
  
  if (Math.random() < bottleSpawnProbability * (deltaTime / 16.67)) {
    spawnNewBottle();
  }
}

function drawBottles(deltaTime) {
  bottleCtx.clearRect(0, 0, bottleCanvas.width, bottleCanvas.height);
  
  if (bottleImage.complete) {
    bottles.forEach(bottle => {
      bottle.draw(bottleCtx);
    });
  }
}

function animateBottles(currentTime) {
  if (!lastBottleFrameTime) lastBottleFrameTime = currentTime;
  const deltaTime = currentTime - lastBottleFrameTime;
  lastBottleFrameTime = currentTime;
  
  updateBottles(deltaTime);
  drawBottles(deltaTime);
  requestAnimationFrame(animateBottles);
}

// Event listeners
document.addEventListener('click', (event) => {
  const rect = bottleCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  let clickedBottle = false;
  
  // Check if click is within bottle canvas bounds
  if (clickX >= 0 && clickX <= bottleCanvas.width && 
      clickY >= 0 && clickY <= bottleCanvas.height) {
    
    for (let bottle of bottles) {
      if (bottle.sinking) continue;
      
      const bottleWidth = bottleImage.width * bottle.size;
      const bottleHeight = bottleImage.height * bottle.size;
      
      if (clickX >= bottle.x && 
          clickX <= bottle.x + bottleWidth &&
          clickY >= bottle.y && 
          clickY <= bottle.y + bottleHeight) {
        bottle.showQuote();
        clickedBottle = true;
        event.preventDefault();
        event.stopPropagation();
        break;
      }
    }
  }
});

document.addEventListener('mousemove', (event) => {
  const rect = bottleCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  let hoveringBottle = false;
  
  // Check if mouse is within bottle canvas bounds
  if (mouseX >= 0 && mouseX <= bottleCanvas.width && 
      mouseY >= 0 && mouseY <= bottleCanvas.height) {
    
    for (let bottle of bottles) {
      if (bottle.sinking) continue;
      
      const bottleWidth = bottleImage.width * bottle.size;
      const bottleHeight = bottleImage.height * bottle.size;
      
      if (mouseX >= bottle.x && 
          mouseX <= bottle.x + bottleWidth &&
          mouseY >= bottle.y && 
          mouseY <= bottle.y + bottleHeight) {
        hoveringBottle = true;
        break;
      }
    }
  }
  
  // Update cursor
  if (!document.body.style.cursor || document.body.style.cursor === 'default') {
    document.body.style.cursor = hoveringBottle ? 'pointer' : 'default';
  }
  
  // Only enable pointer events when hovering over bottles
  bottleCanvas.style.pointerEvents = hoveringBottle ? 'auto' : 'none';
});

// Start bottle animation
requestAnimationFrame(animateBottles);

// Export for use in other modules
window.resizeBottleCanvas = resizeBottleCanvas;
