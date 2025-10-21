// Water effects and canvas management
const waterCanvas = document.getElementById('water-canvas');
const ctx = waterCanvas.getContext('2d');

function resizeWaterCanvas() {      
  waterCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  waterCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight, document.body.offsetHeight);
}

function updateAllCanvasSizes() {
  resizeWaterCanvas();
  resizeCloudCanvas(); 
  resizeBoatCanvas();
  resizeBottleCanvas();
}

function drawWater(time) {
  ctx.clearRect(0, 0, waterCanvas.width, waterCanvas.height);
  
  // Base water color - teal/turquoise
  ctx.fillStyle = '#4DD0E1';
  ctx.fillRect(0, 0, waterCanvas.width, waterCanvas.height);
  
  // Draw subtle crescent wave lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineCap = 'round';
  
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    
    // Create crescent shapes at different positions with independent movement
    const baseX = (i / 15) * waterCanvas.width + Math.sin(i * 1.7) * (waterCanvas.width * 0.2);
    
    // Calculate Y position with downward movement
    const waveSpeed = 0.005; // Speed of downward movement
    const waveHeight = waterCanvas.height + 100; // Extra height for smooth transition
    const baseY = ((time * waveSpeed) + (i * 80)) % waveHeight;
    
    const xCenter = baseX;
    const crescentWidth = 20 + Math.sin(i * 0.3) * 2;
    const crescentHeight = 3 + Math.sin(i * 0.7) * .7;
    
    // Draw crescent curve with shadow for dimension
    const alpha = 0.2 + Math.sin(i * 0.5 + time * 0.001) * 0.1;
    
    // First draw the shadow (darker, offset down)
    ctx.beginPath();
    for (let t = -Math.PI * 0.4; t <= Math.PI * 0.4; t += 0.05) {
      const x = xCenter + Math.sin(t) * crescentWidth;
      const y = baseY + Math.cos(t * 2) * crescentHeight + 2; // Offset shadow down by 2px
      
      if (t === -Math.PI * 0.4) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = `rgba(0, 50, 80, ${alpha * 0.6})`; // Dark blue-gray shadow
    ctx.stroke();
    
    // Then draw the main line (white, on top)
    ctx.beginPath();
    for (let t = -Math.PI * 0.4; t <= Math.PI * 0.4; t += 0.05) {
      const x = xCenter + Math.sin(t) * crescentWidth;
      const y = baseY + Math.cos(t * 2) * crescentHeight;
      
      if (t === -Math.PI * 0.4) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.stroke();
  }
  
  requestAnimationFrame(drawWater);
}

// Start water animation
requestAnimationFrame(drawWater);

// Export for use in other modules
window.updateAllCanvasSizes = updateAllCanvasSizes; 