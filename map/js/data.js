// Cities data. Chronological, oldest first. Duration is inclusive days.
const cities = [
  {
    name: 'Vitalia',
    subtitle: 'Roatan, Honduras',
    dates: 'Jan 3rd - Feb 10th',
    duration: '39 days',
    islandImg: './images/roatan.png',
    size: 180,
    year: 2024
  },
  {
    name: 'Tokyo',
    dates: 'Feb 12th - Mar 2nd',
    duration: '20 days',
    islandImg: './images/tokyo.png',
    islandGif: './images/tokyo.gif',
    size: 180,
    year: 2024
  },
  {
    name: 'Orange County',
    dates: 'Mar 3rd - Mar 10th',
    duration: '8 days',
    islandImg: './images/orange_county.png',
    size: 140,
    year: 2024
  },
  {
    name: 'New York',
    dates: 'Mar 10th - Mar 16th',
    duration: '7 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2024
  },
  {
    name: 'Lisbon',
    subtitle: 'Carvoeiro, Sintra',
    dates: 'Mar 17th - May 25th',
    duration: '70 days',
    islandImg: './images/lisbon.png',
    islandGif: './images/lisbon.gif',
    size: 150,
    year: 2024
  },
  {
    name: 'London',
    dates: 'May 26th - Jul 6th',
    duration: '42 days',
    islandImg: './images/london.png',
    size: 180,
    year: 2024
  },
  {
    name: 'Brussels',
    dates: 'Jul 6th - Jul 13th',
    duration: '8 days',
    islandImg: './images/brussels.png',
    size: 160,
    year: 2024
  },
  {
    name: 'Amsterdam',
    dates: 'Jul 13th - Jul 20th',
    duration: '8 days',
    islandImg: './images/amsterdam.png',
    size: 160,
    year: 2024
  },
  {
    name: 'New York',
    dates: 'Jul 20th - Aug 6th',
    duration: '18 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2024
  },
  {
    name: 'Las Vegas',
    dates: 'Aug 6th - Aug 11th',
    duration: '6 days',
    islandImg: './images/vegas.png',
    size: 180,
    year: 2024
  },
  {
    name: 'Boulder',
    dates: 'Aug 11th - Sep 2nd',
    duration: '23 days',
    islandImg: './images/boulder.png',
    size: 180,
    year: 2024
  },
  {
    name: 'New York',
    dates: 'Sep 2nd - Sep 8th',
    duration: '7 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2024
  },
  {
    name: 'Montreal',
    dates: 'Sep 8th - Sep 22nd',
    duration: '15 days',
    islandImg: './images/montreal.png',
    size: 160,
    year: 2024
  },
  {
    name: 'Miami',
    dates: 'Sep 22nd - Sep 28th',
    duration: '7 days',
    islandImg: './images/miami.png',
    year: 2024
  },
  {
    name: 'Iceland',
    dates: 'Sep 28th - Oct 6th',
    duration: '9 days',
    islandImg: './images/iceland.png',
    size: 180,
    year: 2024
  },
  {
    name: 'Lisbon',
    dates: 'Oct 6th - Oct 19th',
    duration: '14 days',
    islandImg: './images/lisbon.png',
    islandGif: './images/lisbon.gif',
    size: 150,
    year: 2024
  },
  {
    name: 'New York',
    dates: 'Oct 19th - Oct 26th',
    duration: '8 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2024
  },
  {
    name: 'Seoul',
    dates: 'Oct 26th - Nov 2nd',
    duration: '8 days',
    islandImg: './images/seoul.png',
    size: 160,
    year: 2024
  },
  {
    name: 'Chiang Mai',
    dates: 'Nov 2nd - Nov 10th',
    duration: '9 days',
    islandImg: './images/chiang_mai.png',
    size: 160,
    year: 2024
  },
  {
    name: 'Bangkok',
    dates: 'Nov 10th - Nov 17th',
    duration: '8 days',
    islandImg: './images/bangkok.png',
    size: 160,
    year: 2024
  },
  {
    name: 'Hong Kong',
    dates: 'Nov 17th - Nov 24th',
    duration: '8 days',
    islandImg: './images/hong_kong.png',
    size: 180,
    year: 2024
  },
  {
    name: 'Tokyo',
    subtitle: 'Minakami, Nikko',
    dates: 'Nov 24th - Dec 14th',
    duration: '21 days',
    islandImg: './images/tokyo.png',
    islandGif: './images/tokyo.gif',
    size: 180,
    year: 2024
  },
  {
    name: 'Orange County',
    subtitle: 'Yorba Linda',
    dates: 'Dec 14th - Dec 24th',
    duration: '11 days',
    islandImg: './images/orange_county.png',
    size: 140,
    year: 2024
  },
  {
    name: 'Boulder',
    dates: 'Dec 24th - Dec 28th',
    duration: '5 days',
    islandImg: './images/denver.png',
    size: 180,
    year: 2024
  },
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
    name: 'Dakhla',
    subtitle: 'Casablanca, Morocco',
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
    subtitle: 'La Paz, Puerto San Carlos',
    dates: 'Dec 27th - Jan 5th', 
    duration: '10 days',
    islandImg: './images/la_ventana.png',
    size: 140,
    year: 2025
  },
  { 
    name: 'New York', 
    dates: 'Jan 5th - Jan 13th', 
    duration: '9 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2026
  },
  { 
    name: 'Miami', 
    dates: 'Jan 13th - Feb 13th', 
    duration: '32 days',
    islandImg: './images/miami.png',
    year: 2026
  },
  { 
    name: 'Denver',
    subtitle: 'Boulder, Tabernash',
    dates: 'Feb 15th - Mar 30th', 
    duration: '45 days',
    islandImg: './images/denver.png',
    size: 180,
    year: 2026
  },
  { 
    name: 'New York', 
    dates: 'Mar 30th - May 16th', 
    duration: '48 days',
    islandImg: './images/NY.png',
    blog: './posts/new_york.md',
    blogTitle: 'The City',
    size: 200,
    year: 2026
  },
  { 
    name: 'Montana', 
    dates: 'May 16th - Jun 21st', 
    duration: '37 days',
    islandImg: './images/montana.png',
    islandGif: './images/montana.gif',
    heroImg: '../islands/montana.webp',
    blog: './posts/montana.md',
    blogTitle: 'Minerals',
    size: 200,
    year: 2026
  },
  {
    name: 'New York',
    dates: 'Jun 21st - Jun 30th',
    duration: '10 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2026
  },
  {
    name: 'Boulder',
    dates: 'Jun 30th - Aug 16th',
    duration: '48 days',
    islandImg: './images/boulder.png',
    heroImg: '../islands/boulder.webp',
    blog: './posts/boulder.md',
    blogTitle: 'Bierstadt',
    size: 180,
    year: 2026
  },
  {
    name: 'Munich',
    dates: 'Aug 17th - Aug 22nd',
    duration: '6 days',
    islandImg: './images/munich.png',
    size: 160,
    year: 2026
  },
  {
    name: 'Innsbruck',
    subtitle: 'Rotholz, Oktoberfest',
    dates: 'Aug 24th - Sep 26th',
    duration: '34 days',
    islandImg: './images/innsbruck.png',
    size: 180,
    year: 2026
  },
  {
    name: 'Salzkammergut',
    subtitle: 'Bad Goisern, Gosau',
    dates: 'Sep 27th - Oct 4th',
    duration: '8 days',
    islandImg: './images/salzkammergut.png',
    size: 160,
    year: 2026
  },
  {
    name: 'New York',
    dates: 'Oct 4th - Oct 17th',
    duration: '14 days',
    islandImg: './images/NY.png',
    size: 200,
    year: 2026
  },
  {
    name: 'Zermatt',
    subtitle: 'Switzerland',
    dates: 'Oct 17th - Oct 31st',
    duration: '15 days',
    islandImg: './images/switzerland.png',
    heroImg: '../islands/switzerland.webp',
    blog: './posts/zermatt.md',
    blogTitle: 'Zermatt',
    size: 180,
    year: 2026
  },
  {
    name: 'Mumbai',
    subtitle: 'Devcon 8',
    dates: 'Nov 1st - Nov 7th',
    duration: '7 days',
    islandImg: './images/mumbai.png',
    size: 160,
    year: 2026
  },
  {
    name: 'Nepal',
    subtitle: 'Manaslu Circuit',
    dates: 'Nov 7th - Nov 22nd',
    duration: '16 days',
    islandImg: './images/nepal.png',
    heroImg: '../islands/nepal.webp',
    blog: './posts/kathmandu.md',
    blogTitle: 'Kathmandu',
    size: 180,
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

function parseDateString(dateStr, year) {
  // Fall back to current year if a city doesn't specify one
  const baseYear = year ?? new Date().getFullYear();

  // Handle different date formats
  if (dateStr.includes(' - ')) {
    // Format: "Jan 1st - Apr 6th" or "Sep 13th - Sept 21st"
    const [startStr, endStr] = dateStr.split(' - ');
    const startDate = parseSingleDate(startStr, baseYear);
    let endDate = parseSingleDate(endStr, baseYear);

    // If the range wraps across New Year (e.g. "Dec 27th - Jan 4th"),
    // the end date belongs to the following year.
    if (startDate && endDate && endDate < startDate) {
      endDate = parseSingleDate(endStr, baseYear + 1);
    }

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
    const dateRange = parseDateString(city.dates, city.year);
    
    if (dateRange && dateRange.start && dateRange.end) {
      // Check if current date falls within this city's date range
      if (now >= dateRange.start && now <= dateRange.end) {
        // Islands render most-recent-first, so the DOM index is the reverse of
        // the chronological index used to scan `cities` above.
        return { city, index: cities.length - 1 - i };
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