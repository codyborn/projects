// Boat system and game mechanics
const sailboatImage = new Image();
sailboatImage.src = './images/sailboat.png';
let sailboats = [];
let sailboatSpawnProbability = 0.001;
const boatCollisionPercentage = 0.15;
let lastBoatFrameTime = 0;
let totalSunkShips = 0;

// Boss ship properties
let bossShip = null;
const bossShipImage = new Image();
bossShipImage.src = './images/trimast.gif';
const bossShipDamagedImage = new Image();
bossShipDamagedImage.src = './images/trimast_damaged.gif';
const bossShipFlotsamImage = new Image();
bossShipFlotsamImage.src = './images/trimast_flotsam.png';

// Animated GIF overlay for boss ship
let bossShipGifElement = null;

// Damage icon properties
const damageIconImage = new Image();
damageIconImage.src = './images/damage_icon.png';
const damageIconScale = 0.1;
let damageFlash = null;

// Boat canvas setup
const boatCanvas = document.getElementById('boat-canvas');
const boatCtx = boatCanvas.getContext('2d');

function resizeBoatCanvas() {      
  boatCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  boatCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight, document.body.offsetHeight);
}

function checkSailboatOverlap(sailboatX, sailboatY, sailboatWidth, sailboatHeight) {
  const sailboatBottom = sailboatY + sailboatHeight;
  const sailboatTop = sailboatY + sailboatHeight * (1 - boatCollisionPercentage);
  const sailboatRight = sailboatX + sailboatWidth;

  if (window.debugMode) {
    boatCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    boatCtx.lineWidth = 2;
    boatCtx.beginPath();
    boatCtx.rect(
      sailboatX,
      sailboatTop,
      sailboatWidth,
      sailboatBottom - sailboatTop
    );
    boatCtx.stroke();
  }
  
  for (let island of islandBounds) {
    if ((sailboatX == -1 || (sailboatX < island.right && sailboatRight > island.left)) &&
        sailboatTop < island.bottom && sailboatBottom > island.top) {
      return true;
    }
  }
  return false;
}

function getValidSailboatPosition(sailboatSize) {
  const maxAttempts = 50;
  let attempts = 0;
  
  const initialBoatWidth = sailboatImage.width * sailboatSize;
  const initialBoatHeight = sailboatImage.height * sailboatSize;
  
  while (attempts < maxAttempts) {
    const randomX = Math.random() * boatCanvas.width;
    const randomY = Math.random() * boatCanvas.height;
    
    if (!checkSailboatOverlap(randomX, randomY, initialBoatWidth, initialBoatHeight)) {
      return { x: randomX, y: randomY };
    }
    attempts++;
  }
  
  const fallbackPositions = [
    { x: 50, y: 50 },
    { x: boatCanvas.width - 50, y: 50 },
    { x: 50, y: boatCanvas.height - 50 },
    { x: boatCanvas.width - 50, y: boatCanvas.height - 50 }
  ];
  
  for (let pos of fallbackPositions) {
    if (!checkSailboatOverlap(pos.x, pos.y, initialBoatWidth, initialBoatHeight)) {
      return pos;
    }
  }
  
  return { x: 50, y: 50 };
}

function initializeSailboats() {
  sailboats = [];
}

// Base Boat class
class Boat {
  constructor(x, y, size, speedX, speedY, image, sinkProgress, sinkSpeed, hasFlotsam) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.originalSpeedX = speedX;
    this.image = image;
    this.stopped = false;
    this.stopTimer = 0;
    this.bobbingPhase = Math.PI * 2;
    this.sinking = false;
    this.rotation = 0;
    this.sinkProgress = sinkProgress;
    this.sinkSpeed = sinkSpeed;
    this.isFlotsam = false;
    this.flotsamTimer = 0;
    this.hasFlotsam = hasFlotsam;
    this.sinkStartY = 0;
    this.opacity = 1;
    this.hasEnteredScreen = false;
  }

  setSinking() {
    if (!this.sinking) {
        this.sinking = true;
        totalSunkShips++;
        updateSunkShipsCounter();
    }
  }

  update(deltaTime) {
    if (this.isFlotsam) {
      if (this.hasFlotsam) {
        this.sinking = false;
        this.sinkProgress = 0;
        this.y = this.sinkStartY + 100; // Lower the flotsam position
        
        this.y += Math.sin(this.flotsamTimer * 0.005 + this.bobbingPhase) * .08 * (deltaTime / 16.67);

        const boatWidth = this.image.width * this.size;
        const boatHeight = this.image.height * this.size;
        this.flotsamBounds = {
          left: this.x,
          right: this.x + boatWidth,
          top: this.y,
          bottom: this.y + boatHeight
        };
        islandBounds.push(this.flotsamBounds);
      }
      else {
        return false;
      }
      this.flotsamTimer += deltaTime;
    } else if (this.sinking) {
      if (this.sinkStartY === 0) {
        this.sinkStartY = this.y;
      }
      this.speedX = this.speedX * Math.pow(0.99, deltaTime / 16.67);
      this.x += this.speedX * (deltaTime / 16.67);
      const sinkSpeed = this.sinkSpeed * (deltaTime / 16.67);
      this.sinkProgress += sinkSpeed;
      this.y += sinkSpeed * this.size * this.image.height * 0.8;
      
      if (this.sinkProgress >= 1) {
        this.isFlotsam = true;
        this.flotsamTimer = 0;
      }
    } else {
      if (this.stopped) {
        this.stopTimer += deltaTime;
        this.y += Math.sin(this.stopTimer * 0.005 + this.bobbingPhase) * .08 * (deltaTime / 16.67);
        
        if (this.stopTimer >= 5000) {
          this.stopped = false;
          this.stopTimer = 0;
          this.speedX = -this.originalSpeedX;
          this.speedY = -this.speedY;
        }
      } else {
        const prevX = this.x;
        const prevY = this.y;
        
        this.x += this.speedX * (deltaTime / 16.67);
        this.y += this.speedY * (deltaTime / 16.67);
        
        const currentBoatWidth = this.image.width * this.size;
        const currentBoatHeight = this.image.height * this.size;
        if (checkSailboatOverlap(this.x, this.y, currentBoatWidth, currentBoatHeight)) {
          this.x = prevX;
          this.y = prevY;
          this.stopped = true;
          this.stopTimer = 0;
        }
        
        if (this.y < 0) {
          this.y = 0;
          this.speedY = Math.abs(this.speedY);
        }
        if (this.y + this.image.height * this.size > boatCanvas.height) {
          this.y = boatCanvas.height - this.image.height * this.size;
          this.speedY = -Math.abs(this.speedY);
        }

        const boatWidth = this.image.width * this.size;
        if (this instanceof BossShip) {
          if (this.hasEnteredScreen && (this.x + boatWidth < 0 || this.x > boatCanvas.width)) {
            return 'respawn';
          }
          
          if (this.x + boatWidth >= 0 && this.x <= boatCanvas.width) {
            this.hasEnteredScreen = true;
          }
        } else {
          if (this.x + boatWidth < 0 || this.x > boatCanvas.width) {
            return false;
          }
        }
      }
    }
    return true;
  }

  draw(ctx) {
    ctx.save();
    
    const centerX = this.x + (this.image.width * this.size) / 2;
    const centerY = this.y + (this.image.height * this.size) / 2;
    
    ctx.translate(centerX, centerY);
    
    if (this.speedX > 0) {
      ctx.scale(-1, 1);
    }
    
    if (this.sinkProgress > 0) {
      const clipHeight = this.image.height * this.size * (1 - this.sinkProgress);
      
      ctx.beginPath();
      const width = this.image.width * this.size;
      const segments = 20;
      const segmentWidth = width / segments;
      
      ctx.moveTo(-width/2, -this.image.height * this.size / 2);
      
      const time = Date.now() * 0.001;
      const waveAmplitude = this.size * 2;
      const waveDirection = this.speedX > 0 ? -1 : 1;
      
      for (let i = 0; i <= segments; i++) {
        const x = -width/2 + (i * segmentWidth);
        const phase1 = i * 1.2 - (time * 2);
        const phase2 = i * 0.8 - (time * 1.5);
        const phase3 = i * 1.5 - (time * 2.5);
        
        const wave1 = Math.sin(phase1) * waveAmplitude;
        const wave2 = Math.sin(phase2) * (waveAmplitude * 0.7);
        const wave3 = Math.sin(phase3) * (waveAmplitude * 0.5);
        
        const combinedWave = waveDirection * (wave1 + wave2 + wave3);
        const y = -this.image.height * this.size / 2 + clipHeight + combinedWave;
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width/2, -this.image.height * this.size / 2);
      ctx.closePath();
      ctx.clip();
    }

    if (this.isFlotsam) {
      const fadeDuration = 1000;
      this.opacity = Math.min(1, this.flotsamTimer / fadeDuration);
      ctx.globalAlpha = this.opacity;
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
    const boatWidth = this.image.width * this.size;
    const boatHeight = this.image.height * this.size;
    
    const adjustedX = this.speedX > 0 ? 
      this.x + boatWidth - (x - this.x) : 
      x;
    
    return adjustedX >= this.x && 
           adjustedX <= this.x + boatWidth &&
           y >= this.y && 
           y <= this.y + boatHeight;
  }
}

// BossShip class
class BossShip extends Boat {
  constructor(x, y, size, speedX, image, damagedImage, flotsamImage) {
    super(x, y, size, speedX, 0, image, 0.08, .002, true);
    this.damagedImage = damagedImage;
    this.flotsamImage = flotsamImage;
    this.damage = 0;
    this.gifElement = null;
    this.currentGifState = 'normal'; // Track current GIF state
  }

  draw(ctx) {
    const currentImage = this.isFlotsam ? 
      this.flotsamImage : 
      (this.damage >= 20 ? this.damagedImage : this.image);
    
    this.image = currentImage;
    
    // For boss ship (undamaged or damaged), use HTML overlay instead of canvas
    if (!this.isFlotsam) {
      this.updateGifOverlay();
      
      // If sinking, apply wave clipping to the GIF overlay
      if (this.sinkProgress > 0) {
        this.applySinkingEffect();
      } else {
        // Clear clipping when not sinking
        if (this.gifElement) {
          this.gifElement.style.clipPath = 'none';
        }
      }
    } else {
      // Hide GIF overlay for flotsam state
      if (this.gifElement) {
        this.gifElement.style.display = 'none';
      }
      super.draw(ctx);
    }
  }

  updateGifOverlay() {
    if (!this.gifElement) {
      // Create GIF element
      this.gifElement = document.createElement('img');
      this.gifElement.style.position = 'absolute';
      this.gifElement.style.pointerEvents = 'none';
      this.gifElement.style.zIndex = '5'; // Lower than canvas z-index
      document.body.appendChild(this.gifElement);
      
      // Set initial source
      this.currentGifState = 'normal';
      this.gifElement.src = './images/trimast.gif';
    }

    // Only change the GIF source when the damage state actually changes
    const newGifState = this.damage >= 20 ? 'damaged' : 'normal';
    if (newGifState !== this.currentGifState) {
      this.currentGifState = newGifState;
      if (this.damage >= 20) {
        this.gifElement.src = './images/trimast_damaged.gif';
      } else {
        this.gifElement.src = './images/trimast.gif';
      }
    }

    // Update position and size
    const canvasRect = boatCanvas.getBoundingClientRect();
    const scale = this.size;
    const width = bossShipImage.width * scale;
    const height = bossShipImage.height * scale;
    
    this.gifElement.style.left = (canvasRect.left + this.x) + 'px';
    this.gifElement.style.top = (0 + this.y) + 'px';
    this.gifElement.style.width = width + 'px';
    this.gifElement.style.height = height + 'px';
    this.gifElement.style.display = 'block';
    this.gifElement.style.zIndex = '5'; // Lower than canvas z-index
    
    // Flip horizontally if moving right
    if (this.speedX > 0) {
      this.gifElement.style.transform = 'scaleX(-1)';
    } else {
      this.gifElement.style.transform = 'scaleX(1)';
    }
  }

  applySinkingEffect() {
    if (!this.gifElement) return;
    
    // Create a clipping mask using CSS clip-path
    const clipHeight = this.image.height * this.size * (1 - this.sinkProgress);
    const width = this.image.width * this.size;
    const segments = 20;
    const segmentWidth = width / segments;
    
    const time = Date.now() * 0.001;
    const waveAmplitude = this.size * 2;
    const waveDirection = this.speedX > 0 ? -1 : 1;
    
    // Build the wave path for clip-path
    let wavePath = `polygon(0% 0%, `;
    
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 100; // Convert to percentage
      const phase1 = i * 1.2 - (time * 2);
      const phase2 = i * 0.8 - (time * 1.5);
      const phase3 = i * 1.5 - (time * 2.5);
      
      const wave1 = Math.sin(phase1) * waveAmplitude;
      const wave2 = Math.sin(phase2) * (waveAmplitude * 0.7);
      const wave3 = Math.sin(phase3) * (waveAmplitude * 0.5);
      
      const combinedWave = waveDirection * (wave1 + wave2 + wave3);
      const y = ((clipHeight + combinedWave) / (this.image.height * this.size)) * 100;
      
      wavePath += `${x}% ${y}%, `;
    }
    
    wavePath += `100% 0%)`;
    
    // Apply the clipping mask
    this.gifElement.style.clipPath = wavePath;
  }

  destroy() {
    if (this.gifElement) {
      this.gifElement.remove();
      this.gifElement = null;
    }
  }
}

function createBossShip(x, y, direction, size) {
  return new BossShip(
    x,
    y,
    size,
    (window.debugMode ? 0.5 : 0.18) * direction,
    bossShipImage,
    bossShipDamagedImage,
    bossShipFlotsamImage
  );
}

function spawnNewSailboat() {
  if (!sailboatImage.complete) return;
  
  const size = 0.4;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const boatWidth = sailboatImage.width * size;
  
  const x = direction === 1 ? -boatWidth : boatCanvas.width;
  const validPosition = getValidSailboatPosition(size);
  
  sailboats.push(new Boat(
    x,
    validPosition.y,
    size,
    (0.1 + Math.random() * 0.1) * direction,
    (Math.random() - 0.5) * 0.05,
    sailboatImage,
    0,
    .004,
    false
  ));
}

function findValidBossShipPosition(size, direction) {
  const x = direction === 1 ? bossShipImage.width * -1 : boatCanvas.width + 1;
  
  const boatHeight = bossShipImage.height * size;
  const overlapBufferTop = 20;
  const overlapHeight = boatHeight * boatCollisionPercentage + overlapBufferTop;
  const availableSpace = spaceTracker.getRandomAvailableSpace(overlapHeight);
  
  if (!availableSpace) {
    return { x, y: boatCanvas.height * 0.5 };
  }
  
  return { x, y: availableSpace.start - (boatHeight - overlapHeight) + overlapBufferTop };
}

function spawnBossShip() {
  if (!bossShipImage.complete) return;
  
  storeIslandBounds();
  const size = window.innerWidth <= 600 ? 0.3 : 0.4;
  const direction = Math.random() > 0.5 ? 1 : -1;
  const position = findValidBossShipPosition(size, direction);
  
  bossShip = createBossShip(position.x, position.y, direction, size);
}

function updateSailboats(deltaTime) {
  if (bossShip) {
    const result = bossShip.update(deltaTime);

    if (result === 'respawn') {
      const currentState = {
        damage: bossShip.damage,
        sinking: bossShip.sinking,
        sinkProgress: bossShip.sinkProgress,
        isFlotsam: bossShip.isFlotsam,
        flotsamTimer: bossShip.flotsamTimer
      };
      
      // Clean up old GIF element
      if (bossShip.gifElement) {
        bossShip.gifElement.remove();
      }
      
      const size = window.innerWidth <= 600 ? 0.6 : 0.8;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const position = findValidBossShipPosition(size, direction);
      
      bossShip = createBossShip(position.x, position.y, direction, size);
      
      bossShip.damage = currentState.damage;
      bossShip.sinking = currentState.sinking;
      bossShip.sinkProgress = currentState.sinkProgress;
      bossShip.isFlotsam = currentState.isFlotsam;
      bossShip.flotsamTimer = currentState.flotsamTimer;
    } else if (result === false) {
      // Clean up GIF element when boss ship is destroyed
      if (bossShip.gifElement) {
        bossShip.gifElement.remove();
      }
      bossShip = null;
    }
  }
  
  for (let i = sailboats.length - 1; i >= 0; i--) {
    if (!sailboats[i].update(deltaTime)) {
      sailboats.splice(i, 1);
    }
  }
  
  if (Math.random() < sailboatSpawnProbability * (deltaTime / 16.67)) {
    spawnNewSailboat();
  }
}

function drawSailboats(deltaTime) {
  boatCtx.clearRect(0, 0, boatCanvas.width, boatCanvas.height);
  
  if (sailboatImage.complete) {
    const allBoats = [...sailboats];
    if (bossShip) {
      allBoats.push(bossShip);
    }
    
    const sortedBoats = allBoats.sort((a, b) => {
      const aBottom = a.y + (a.image.height * a.size * (1-a.sinkProgress));
      const bBottom = b.y + (b.image.height * b.size * (1-b.sinkProgress));
      return aBottom - bBottom;
    });

    sortedBoats.forEach(boat => {
      boat.draw(boatCtx);
    });

    if (damageFlash) {
      damageFlash.opacity -= 0.1 * (deltaTime / 16.67);
      if (damageFlash.opacity <= 0) {
        damageFlash = null;
      } else {
        // Draw damage icon on canvas (will appear on top of GIF overlay)
        boatCtx.save();
        boatCtx.translate(damageFlash.x, damageFlash.y);
        boatCtx.globalAlpha = damageFlash.opacity;
        boatCtx.drawImage(
          damageIconImage,
          -damageIconImage.width * damageIconScale / 2,
          -damageIconImage.height * damageIconScale / 2,
          damageIconImage.width * damageIconScale,
          damageIconImage.height * damageIconScale
        );
        boatCtx.restore();
      }
    }
  }
}

function animateBoats(currentTime) {
  if (!lastBoatFrameTime) lastBoatFrameTime = currentTime;
  const deltaTime = currentTime - lastBoatFrameTime;
  lastBoatFrameTime = currentTime;
  
  updateSailboats(deltaTime);
  drawSailboats(deltaTime);
  requestAnimationFrame(animateBoats);
}

function updateSunkShipsCounter() {
  const sunkShipsCounter = document.getElementById('sunk-ships-counter');
  if (totalSunkShips > 0) {
    sunkShipsCounter.style.display = 'block';
    sunkShipsCounter.textContent = `Ships Sunk: ${totalSunkShips}`;
    
    if (totalSunkShips > 10) {
      sailboatSpawnProbability = 0.01;
    }
    
    const bossShipSpawnThreshold = window.debugMode ? 1 : window.innerWidth <= 600 ? 30 : 50;
    if (totalSunkShips === bossShipSpawnThreshold && !bossShip) {
      spawnBossShip();
    }
  } else {
    sunkShipsCounter.style.display = 'none';
  }
}

// Event listeners
document.addEventListener('click', (event) => {
  const rect = boatCanvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  let clickedBoat = false;
  
      // Check if click is within boat canvas bounds
    if (clickX >= 0 && clickX <= boatCanvas.width && 
        clickY >= 0 && clickY <= boatCanvas.height) {
    
      // Check boss ship flotsam first
      if (bossShip && bossShip.isFlotsam) {
        const boatWidth = bossShipImage.width * bossShip.size;
        const boatHeight = bossShipImage.height * bossShip.size;
        
        if (clickX >= bossShip.x && 
            clickX <= bossShip.x + boatWidth &&
            clickY >= bossShip.y && 
            clickY <= bossShip.y + boatHeight) {
          
          // Show the specific quote for boss ship flotsam
          const bossQuote = `
                            My music is the Northwind's roar;

                            The bellowings of the Black Sea's shore,

                            And rolling of my guns.

                            And as the thunders loudly sound,

                            And furious the tempests rave,

                            I calmly rest in sleep profound,

                            So rocked upon the wave.
                            `;
          
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
              white-space: pre-line;
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
          quoteText.textContent = `${bossQuote}`;
          quoteText.style.cssText = `
            display: block;
            opacity: 0;
          `;
          if (!quoteDisplay.firstChild) {
            quoteDisplay.appendChild(quoteText);
          }
          
          // Apply mirage animation to the text after container wipe-in
          quoteText.style.animation = 'mirageIn 2s ease-out forwards';
          
          clickedBoat = true;
          event.preventDefault();
          event.stopPropagation();
        }
      }
      
      // Check boss ship (not flotsam)
      if (bossShip && !bossShip.sinking && !bossShip.isFlotsam) {
        const boatWidth = bossShipImage.width * bossShip.size;
        const boatHeight = bossShipImage.height * bossShip.size;
        
        if (clickX >= bossShip.x && 
            clickX <= bossShip.x + boatWidth &&
            clickY >= bossShip.y && 
            clickY <= bossShip.y + boatHeight) {
          bossShip.damage++;

          damageFlash = {
            x: clickX,
            y: clickY,
            opacity: 1
          };

          if (bossShip.damage >= 40) {
            bossShip.setSinking();
            sailboats.forEach(boat => {
              boat.setSinking();
            });
            sailboatSpawnProbability = 0.003;
          }
          
          clickedBoat = true;
          event.preventDefault();
          event.stopPropagation();
        }
      }
    
    if (!clickedBoat) {
      for (let sailboat of sailboats) {
        if (sailboat.sinking) continue;
        
        const boatWidth = sailboatImage.width * sailboat.size;
        const boatHeight = sailboatImage.height * sailboat.size;
        
        if (clickX >= sailboat.x && 
            clickX <= sailboat.x + boatWidth &&
            clickY >= sailboat.y && 
            clickY <= sailboat.y + boatHeight) {
          sailboat.setSinking();
          clickedBoat = true;
          event.preventDefault();
          event.stopPropagation();
          break;
        }
      }
    }
  }
});

document.addEventListener('mousemove', (event) => {
  const rect = boatCanvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  
  let hoveringBoat = false;
  
      // Check if mouse is within boat canvas bounds
    if (mouseX >= 0 && mouseX <= boatCanvas.width && 
        mouseY >= 0 && mouseY <= boatCanvas.height) {
    
      // Check boss ship flotsam first
      if (bossShip && bossShip.isFlotsam) {
        const boatWidth = bossShipImage.width * bossShip.size;
        const boatHeight = bossShipImage.height * bossShip.size;
        
        if (mouseX >= bossShip.x && 
            mouseX <= bossShip.x + boatWidth &&
            mouseY >= bossShip.y && 
            mouseY <= bossShip.y + boatHeight) {
          hoveringBoat = true;
        }
      }
      
      // Check boss ship (not flotsam)
      if (bossShip && !bossShip.sinking && !bossShip.isFlotsam) {
        const boatWidth = bossShipImage.width * bossShip.size;
        const boatHeight = bossShipImage.height * bossShip.size;
        
        // Adjust mouse position check based on ship direction
        const adjustedX = bossShip.speedX > 0 ? 
          bossShip.x + boatWidth - (mouseX - bossShip.x) :
          mouseX;
        
        if (adjustedX >= bossShip.x && 
            adjustedX <= bossShip.x + boatWidth &&
            mouseY >= bossShip.y && 
            mouseY <= bossShip.y + boatHeight) {
          hoveringBoat = true;
        }
      }
    
    // Check regular boats if not hovering boss ship
    if (!hoveringBoat) {
      for (let sailboat of sailboats) {
        if (sailboat.sinking) continue;
        
        const boatWidth = sailboatImage.width * sailboat.size;
        const boatHeight = sailboatImage.height * sailboat.size;
        
        // Check if mouse is within boat bounds
        if (mouseX >= sailboat.x && 
            mouseX <= sailboat.x + boatWidth &&
            mouseY >= sailboat.y && 
            mouseY <= sailboat.y + boatHeight) {
          hoveringBoat = true;
          break;
        }
      }
    }
  }
  
  // Update cursor
  document.body.style.cursor = hoveringBoat ? 'pointer' : 'default';
  
  // Only enable pointer events when hovering over boats
  // This allows island tooltips to work when not hovering boats
  boatCanvas.style.pointerEvents = hoveringBoat ? 'auto' : 'none';
});

// Start boat animation
requestAnimationFrame(animateBoats);

// Export for use in other modules
window.initializeSailboats = initializeSailboats;
window.resizeBoatCanvas = resizeBoatCanvas;
window.spawnBossShip = spawnBossShip; 