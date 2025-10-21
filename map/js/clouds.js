// Cloud system and animation
const cloudImage = new Image();
cloudImage.src = './images/cloud.png';
let clouds = [];
const cloudSpeed = 0.1;
const cloudSpawnProbability = 0.0004;
let lastCloudFrameTime = 0;

// Cloud canvas setup
const cloudCanvas = document.getElementById('cloud-canvas');
const cloudCtx = cloudCanvas.getContext('2d');

function resizeCloudCanvas() {      
  cloudCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
  cloudCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight, document.body.offsetHeight);
}

function initializeClouds() {
  clouds = [];
  const cloudCount = 5;
  for (let i = 0; i < cloudCount; i++) {
    const size = 0.3 + Math.random() * 0.5;
    const x = Math.random() * cloudCanvas.width;
    clouds.push({
      x: x,
      y: Math.random() * cloudCanvas.height,
      size: size,
    });
  }
}

function animateClouds(currentTime) {
  if (!lastCloudFrameTime) lastCloudFrameTime = currentTime;
  const deltaTime = currentTime - lastCloudFrameTime;
  lastCloudFrameTime = currentTime;
  
  updateClouds(deltaTime);
  drawClouds();
  requestAnimationFrame(animateClouds);
}

function updateClouds(deltaTime) {
  // Random chance to spawn a new cloud each frame
  if (Math.random() < cloudSpawnProbability * (deltaTime / 16.67)) {
    spawnNewCloud();
  }
  
  // Update existing clouds and remove those that have exited
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.x -= cloudSpeed * (deltaTime / 16.67);
    
    // Remove cloud if it has completely exited the left side
    if (cloud.x + cloudImage.width * cloud.size < 0) {
      clouds.splice(i, 1);
    }
  }
}

function drawClouds() {
  cloudCtx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);
  
  if (cloudImage.complete) {
    clouds.forEach(cloud => {
      cloudCtx.save();
      cloudCtx.globalAlpha = 1.0;
      cloudCtx.drawImage(
        cloudImage,
        cloud.x,
        cloud.y,
        cloudImage.width * cloud.size,
        cloudImage.height * cloud.size
      );
      cloudCtx.restore();
    });
  }
}

function spawnNewCloud() {
  const size = 0.3 + Math.random() * 0.5;
  const x = cloudCanvas.width + 50; // Start off-screen to the right
  clouds.push({
    x: x,
    y: Math.random() * document.documentElement.scrollHeight,
    size: size,
  });
}

// Start cloud animation
requestAnimationFrame(animateClouds);

// Export for use in other modules
window.initializeClouds = initializeClouds;
window.resizeCloudCanvas = resizeCloudCanvas; 