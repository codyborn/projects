// Cities data
const cities = [
  { 
    name: 'Miami',
    subtitle: 'Key Largo, New Orleans',
    dates: 'Jan 1st - Apr 6th',
    duration: '96 days',
    islandImg: './images/miami.png',
    blog: './posts/miami.md',
    blogTitle: 'Tied down',
    year: 2025
  },
  { 
    name: 'New York', 
    dates: 'Apr 6 - Apr 25th', 
    duration: '21 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2025
  },
  { 
    name: 'Madrid', 
    dates: 'Apr 26 - May 2nd', 
    duration: '7 days',
    islandImg: './images/madrid.png' ,
    size: 150,
    year: 2025
  },
  { 
    name: 'Granada', 
    dates: 'May 2nd - May 11th', 
    duration: '10 days',
    islandImg: './images/granada.png' ,
    size: 180,
    year: 2025
  },
  { 
    name: 'Hyeres',
    subtitle: 'Marseille, Toulon, St Tropez',
    dates: 'May 12th - Jun 7th', 
    duration: '26 days',
    islandImg: './images/hyeres.png',
    islandGif: './images/hyeres.gif',
    blog: './posts/hyeres.md',
    blogTitle: 'Bread is the answer',
    size: 160,
    year: 2025
  },
  { 
    name: 'Antibes', 
    subtitle: 'Nice, Monaco',
    dates: 'Jun 7th - Jun 28th', 
    duration: '22 days',
    islandImg: './images/antibes.png',
    blog: './posts/antibes.md',
    blogTitle: 'When you can\'t beat em',
    size: 160,
    year: 2025
  },
  { 
    name: 'Cannes', 
    dates: 'Jun 28th - Jul 6th', 
    duration: '8 days',
    islandImg: './images/cannes.png',
    islandGif: './images/cannes.gif',
    size: 160,
    year: 2025
  },
  { 
    name: 'Scotland',
    subtitle: 'Aviemore, Isle of Skye, Glencoe',
    dates: 'Jul 6th - Aug 17th', 
    duration: '43 days',
    islandImg: './images/scotland.png',
    size: 150,
    year: 2025
  },
  { 
    name: 'Morocco',
    subtitle: 'Casablanca, Dakhla',
    dates: 'Aug 17th - Sep 13th', 
    duration: '26 days',
    islandImg: './images/dakhla.png',
    blog: './posts/dakhla.md',
    blogTitle: 'The French have watches',
    size: 160,
    year: 2025
  },
  { 
    name: 'Lisbon', 
    dates: 'Sep 13th - Sep 21st', 
    duration: '9 days',
    islandImg: './images/lisbon.png',
    islandGif: './images/lisbon.gif',
    size: 150,
    year: 2025
  },
  { 
    name: 'New York', 
    dates: 'Sep 21st - Oct 11th', 
    duration: '20 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2025
  },
  { 
    name: 'Santiago',
    dates: 'Oct 11th - Oct 18th', 
    duration: '8 days',
    islandImg: './images/santiago.png',
    size: 160,
    year: 2025
  },
  { 
    name: 'Patagonia',
    dates: 'Oct 18th - Nov 15th', 
    duration: '28 days',
    islandImg: './images/patagonia.png',
    islandGif: './images/patagonia.gif',
    size: 180,
    year: 2025
  },
  { 
    name: 'Buenos Aires', 
    subtitle: 'Colonia del Sacramento, Iguazu Falls',
    dates: 'Nov 15th - Nov 29th', 
    duration: '14 days',
    islandImg: './images/buenos_aires.png',
    size: 160,
    year: 2025
  },
  { 
    name: 'Joshua Tree', 
    dates: 'Nov 29th - Dec 8th', 
    duration: '10 days',
    islandImg: './images/joshua_tree.png',
    size: 140,
    year: 2025
  },
  { 
    name: 'New York', 
    dates: 'Dec 8th - Dec 12th', 
    duration: '5 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2025
  },
  { 
    name: 'Orange County', 
    dates: 'Dec 12th - Dec 27th', 
    duration: '15 days',
    islandImg: './images/orange_county.png',
    size: 140,
    year: 2025
  },
  { 
    name: 'La Ventana', 
    dates: 'Dec 27th - Jan 4th', 
    duration: '9 days',
    islandImg: './images/la_ventana.png',
    size: 140,
    year: 2025
  },
  { 
    name: 'New York', 
    dates: 'Jan 4th - Jan 11th', 
    duration: '8 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2026
  },
  { 
    name: 'Miami', 
    dates: 'Jan 11th - Feb 14th', 
    duration: '44 days',
    islandImg: './images/miami.png',
    year: 2026
  },
  { 
    name: 'Denver',
    subtitle: 'Boulder, Tabernash',
    dates: 'Feb 14th - Feb 27th', 
    duration: '8 days',
    islandImg: './images/denver.png',
    size: 180,
    year: 2026
  },
  { 
    name: 'Miami', 
    dates: 'Feb 27th - ???', 
    duration: '? days',
    islandImg: './images/miami.png',
    year: 2026
  },
  { 
    name: '???', 
    dates: '??? - ???', 
    duration: '2 months',
    islandImg: './images/mystery.png',
    size: 200,
    year: 2026
  },
];

const quotes = [
  "The things you own end up owning you.",
  "Travel is not a reward for working, it's education for living.",
  "If a problem can be solved by money or time, it's not a problem.",
  "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to."
]

// Utility functions
function getColumnCount() {
  const grid = document.querySelector('.island-grid');
  const style = window.getComputedStyle(grid);
  const templateColumns = style.getPropertyValue('grid-template-columns');
  return templateColumns.split(' ').length;
}

// Date parsing and current island detection
let hasScrolledToCurrentIsland = false;

function parseDateString(dateStr) {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Handle different date formats
  if (dateStr.includes(' - ')) {
    // Format: "Jan 1st - Apr 6th" or "Sep 13th - Sept 21st"
    const [startStr, endStr] = dateStr.split(' - ');
    const startDate = parseSingleDate(startStr, currentYear);
    const endDate = parseSingleDate(endStr, currentYear);
    return { start: startDate, end: endDate };
  }
}

function parseSingleDate(dateStr, year) {
  // Remove ordinal suffixes (st, nd, rd, th)
  const cleanDate = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
  
  // Handle different month formats
  const monthMap = {
    'Jan': 0, 'January': 0,
    'Feb': 1, 'February': 1,
    'Mar': 2, 'March': 2,
    'Apr': 3, 'April': 3,
    'May': 4,
    'Jun': 5, 'June': 5,
    'Jul': 6, 'July': 6,
    'Aug': 7, 'August': 7,
    'Sep': 8, 'Sept': 8, 'September': 8,
    'Oct': 9, 'October': 9,
    'Nov': 10, 'November': 10,
    'Dec': 11, 'December': 11
  };
  
  const parts = cleanDate.trim().split(' ');
  const monthName = parts[0];
  const day = parseInt(parts[1]);
  
  const month = monthMap[monthName];
  if (month !== undefined && !isNaN(day)) {
    return new Date(year, month, day);
  }
  
  return null;
}

function getCurrentIsland() {
  const now = new Date();
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const dateRange = parseDateString(city.dates);
    
    if (dateRange && dateRange.start && dateRange.end) {
      // Check if current date falls within this city's date range
      if (now >= dateRange.start && now <= dateRange.end) {
        return { city, index: i };
      }
    }
  }
  
  return null;
}

function scrollToCurrentIsland() {
  // Only run on mobile devices and only once per page load
  if (window.innerWidth > 600 || hasScrolledToCurrentIsland) return;
  
  const currentIsland = getCurrentIsland();
  if (!currentIsland) return;
  
  // Mark as scrolled to prevent future scrolls
  hasScrolledToCurrentIsland = true;
  
  // Wait for islands to be rendered
  setTimeout(() => {
    const islands = document.querySelectorAll('.island');
    const targetIsland = islands[currentIsland.index];
    
    if (targetIsland) {
      const islandRect = targetIsland.getBoundingClientRect();
      const scrollTop = window.scrollY + islandRect.top - (window.innerHeight / 2) + (islandRect.height / 2);
      
      window.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, 200); // Give time for islands to render
}

// Make functions available globally
window.scrollToCurrentIsland = scrollToCurrentIsland;
window.getCurrentIsland = getCurrentIsland;

// SpaceTracker class for managing available space
class SpaceTracker {
  constructor(pageHeight) {
    this.ranges = [{
      start: 0,
      end: pageHeight
    }];
  }

  addOccupiedSpace(start, height) {
    const end = start + height;
    const newRanges = [];
    
    for (const range of this.ranges) {
      if (end <= range.start || start >= range.end) {
        newRanges.push({...range});
        continue;
      }
      
      if (start > range.start && end < range.end) {
        newRanges.push({
          start: range.start,
          end: start
        });
        newRanges.push({
          start: end,
          end: range.end
        });
      }
      else if (start <= range.start && end < range.end) {
        newRanges.push({
          start: end,
          end: range.end
        });
      }
    }
    
    this.ranges = newRanges;
  }

  getAvailableSpaces(minHeight) {
    return this.ranges.filter(range => (range.end - range.start) >= minHeight);
  }

  getRandomAvailableSpace(minHeight) {
    const availableSpaces = this.getAvailableSpaces(minHeight);
    if (availableSpaces.length === 0) return null;
    
    const randomSpace = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
    
    return {
      start: randomSpace.start,
      height: minHeight
    };
  }

  reset(pageHeight) {
    this.ranges = [{
      start: 0,
      end: pageHeight
    }];
  }

  getTotalAvailableSpace() {
    return this.ranges.reduce((total, range) => total + (range.end - range.start), 0);
  }
} 