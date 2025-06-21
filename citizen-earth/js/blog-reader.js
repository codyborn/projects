// Blog Reader Overlay Functions
let typingInterval = null;
let currentText = '';
let currentIndex = 0;
let currentBlogCity = null;

// Animation type - change this to switch between different animations
const ANIMATION_TYPE = 'paragraph-fade'; // Options: 'typing', 'fade-in', 'slide-up', 'reveal', 'paragraph-fade', 'gentle-type'

// Check for auto-open on page load
window.addEventListener('DOMContentLoaded', () => {
  checkForAutoOpen();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  checkForAutoOpen();
});

function checkForAutoOpen() {
  const urlParams = new URLSearchParams(window.location.search);
  const cityParam = urlParams.get('city');
  
  // If there's no city parameter and a blog is currently open, close it
  if (!cityParam) {
    if (document.getElementById('blog-overlay').classList.contains('active')) {
      closeBlogOverlay();
    }
    return;
  }
  
  // If there is a city parameter, find and open the corresponding blog
  const cityObj = cities.find(city => 
    city.name.toLowerCase() === cityParam.toLowerCase() && city.blog
  );
  
  if (cityObj) {
    // Only open if not already open with the same city
    if (!document.getElementById('blog-overlay').classList.contains('active') || 
        currentBlogCity !== cityObj.name) {
      setTimeout(() => {
        openBlogPost(cityObj.blog, cityObj.blogTitle, cityObj.name);
      }, 100);
    }
  } else {
    // City not found, close any open blog
    if (document.getElementById('blog-overlay').classList.contains('active')) {
      closeBlogOverlay();
    }
  }
}

function copyBlogLink() {
  if (!currentBlogCity) return;
  
  const shareUrl = `${window.location.origin}${window.location.pathname}?city=${encodeURIComponent(currentBlogCity)}`;
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showShareFeedback();
    }).catch(() => {
      fallbackCopyToClipboard(shareUrl);
    });
  } else {
    fallbackCopyToClipboard(shareUrl);
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showShareFeedback();
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
  
  document.body.removeChild(textArea);
}

function showShareFeedback() {
  const shareButton = document.getElementById('share-button');
  shareButton.textContent = 'Copied!';
  shareButton.classList.add('copied');
  
  setTimeout(() => {
    shareButton.textContent = 'Share';
    shareButton.classList.remove('copied');
  }, 2000);
}

// Simple Markdown Parser
function parseMarkdown(text) {
  return text
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraphs
    .replace(/^(.+)$/gm, '<p>$1</p>')
    
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p><br><\/p>/g, '')
    
    // Clean up consecutive paragraph tags
    .replace(/<\/p><p>/g, '</p>\n<p>');
}

async function openBlogPost(blogPath, blogTitle, cityName) {
  try {
    const response = await fetch(blogPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdownText = await response.text();
    
    document.getElementById('blog-title').textContent = blogTitle;
    
    const overlay = document.getElementById('blog-overlay');
    overlay.classList.add('active');
    
    // Reset scroll position to top
    const blogContent = document.querySelector('.blog-content');
    blogContent.scrollTop = 0;
    
    startTextAnimation(markdownText);
    
    document.body.style.overflow = 'hidden';
    
    currentBlogCity = cityName;
    
    // Add city to query string in URL
    if (window.history.pushState) {
      const newUrl = `${window.location.pathname}?city=${encodeURIComponent(cityName)}`;
      window.history.pushState({}, document.title, newUrl);
    }
    
  } catch (error) {
    console.error('Error loading blog post:', error);
    alert('Error loading blog post. Please try again.');
  }
}

function startTextAnimation(text) {
  
  switch (ANIMATION_TYPE) {
    case 'typing':
      startTypingAnimation(text);
      break;
    case 'fade-in':
      startFadeInAnimation(text);
      break;
    case 'slide-up':
      startSlideUpAnimation(text);
      break;
    case 'reveal':
      startRevealAnimation(text);
      break;
    case 'paragraph-fade':
      startParagraphFadeAnimation(text);
      break;
    case 'gentle-type':
      startGentleTypeAnimation(text);
      break;
    default:
      startParagraphFadeAnimation(text);
  }
}

function startTypingAnimation(text) {
  if (typingInterval) {
    clearInterval(typingInterval);
  }
  
  currentText = '';
  currentIndex = 0;
  const blogTextElement = document.getElementById('blog-text');
  blogTextElement.innerHTML = '<span class="typing-cursor"></span>';
  
  typingInterval = setInterval(() => {
    if (currentIndex < text.length) {
      currentText += text[currentIndex];
      blogTextElement.innerHTML = currentText + '<span class="typing-cursor"></span>';
      currentIndex++;
      
      blogTextElement.scrollTop = blogTextElement.scrollHeight;
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      blogTextElement.innerHTML = currentText;
    }
  }, 30);
}

function startFadeInAnimation(text) {
  const blogTextElement = document.getElementById('blog-text');
  const parsedHtml = parseMarkdown(text);
  blogTextElement.innerHTML = parsedHtml;
  blogTextElement.classList.add('fade-in-text');
  
  setTimeout(() => {
    blogTextElement.classList.remove('fade-in-text');
  }, 800);
}

function startSlideUpAnimation(text) {
  const blogTextElement = document.getElementById('blog-text');
  const parsedHtml = parseMarkdown(text);
  blogTextElement.innerHTML = parsedHtml;
  blogTextElement.classList.add('slide-up-text');
  
  setTimeout(() => {
    blogTextElement.classList.remove('slide-up-text');
  }, 600);
}

function startRevealAnimation(text) {
  const blogTextElement = document.getElementById('blog-text');
  const parsedHtml = parseMarkdown(text);
  blogTextElement.innerHTML = parsedHtml;
  blogTextElement.classList.add('reveal-text');
  
  setTimeout(() => {
    blogTextElement.classList.remove('reveal-text');
  }, 1200);
}

function startParagraphFadeAnimation(text) {
  const blogTextElement = document.getElementById('blog-text');
  
  const parsedHtml = parseMarkdown(text);
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = parsedHtml;
  
  const blockElements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
  let html = '';
  
  blockElements.forEach((element, index) => {
    if (element.textContent.trim()) {
      const tagName = element.tagName.toLowerCase();
      const content = element.innerHTML;
      html += `<${tagName} class="paragraph-fade" style="animation-delay: ${index * 0.3}s;">${content}</${tagName}>`;
    }
  });
  
  blogTextElement.innerHTML = html;
  
  const totalDuration = blockElements.length * 0.3 + 0.5;
  setTimeout(() => {
    const animatedElements = blogTextElement.querySelectorAll('.paragraph-fade');
    animatedElements.forEach(el => el.classList.remove('paragraph-fade'));
  }, totalDuration * 1000);
}

function startGentleTypeAnimation(text) {
  if (typingInterval) {
    clearInterval(typingInterval);
  }
  
  currentText = '';
  currentIndex = 0;
  const blogTextElement = document.getElementById('blog-text');
  blogTextElement.innerHTML = '';
  
  const words = text.split(' ');
  typingInterval = setInterval(() => {
    if (currentIndex < words.length) {
      currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
      blogTextElement.innerHTML = currentText + '<span class="typing-cursor"></span>';
      currentIndex++;
      
      blogTextElement.scrollTop = blogTextElement.scrollHeight;
    } else {
      clearInterval(typingInterval);
      typingInterval = null;
      blogTextElement.innerHTML = currentText;
    }
  }, 150);
}

function closeBlogOverlay() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
  
  const overlay = document.getElementById('blog-overlay');
  overlay.classList.remove('active');
  
  document.getElementById('blog-title').textContent = '';
  document.getElementById('blog-text').innerHTML = '';
  
  // Add new history entry without query string
  if (window.history.pushState) {
    const newUrl = window.location.pathname;
    window.history.pushState({}, document.title, newUrl);
  }
  
  currentBlogCity = null;
  
  document.body.style.overflow = '';
}

// Event listeners
document.getElementById('blog-overlay').addEventListener('click', (event) => {
  if (event.target.id === 'blog-overlay') {
    closeBlogOverlay();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.getElementById('blog-overlay').classList.contains('active')) {
    closeBlogOverlay();
  }
});

// Export for use in other modules
window.openBlogPost = openBlogPost;
window.closeBlogOverlay = closeBlogOverlay;
window.copyBlogLink = copyBlogLink; 