// Cities data
const cities = [
  { 
    name: 'Miami',
    subtitle: 'Miami, Key Largo, New Orleans',
    dates: 'Jan 1st - Apr 6th',
    duration: '96 days',
    islandImg: './images/miami.png',
    blog: './posts/miami.md',
    blogTitle: 'Tied down',
  },
  { 
    name: 'New York', 
    dates: 'Apr 6 - Apr 25th', 
    duration: '21 days',
    islandImg: './images/NY.png',
    size: 200
  },
  { 
    name: 'Madrid', 
    dates: 'Apr 26 - May 2nd', 
    duration: '7 days',
    islandImg: './images/madrid.png' ,
    size: 150
  },
  { 
    name: 'Granada', 
    dates: 'May 2nd - May 11th', 
    duration: '10 days',
    islandImg: './images/granada.png' ,
    size: 200
  },
  { 
    name: 'Hyeres',
    subtitle: 'Marseille, Hyeres, Toulon, St Tropez',
    dates: 'May 12th - Jun 7th', 
    duration: '26 days',
    islandImg: './images/hyeres.png',
    size: 160
  },
  { 
    name: 'Antibes', 
    subtitle: 'Antibes, Nice, Monaco',
    dates: 'Jun 7th - Jun 28th', 
    duration: '22 days',
    islandImg: './images/antibes.png',
    size: 160
  },
  { 
    name: 'Cannes', 
    dates: 'Jun 28th - Jul 6th', 
    duration: '8 days',
    islandImg: './images/cannes.png',
    size: 160
  },
  { 
    name: 'Scotland',
    subtitle: 'Inverness, Aviemore, Isle of Skye, Edinburgh',
    dates: 'Jul 6th - Aug 17th', 
    duration: '42 days',
    islandImg: './images/scotland.png',
    size: 150
  },
  { 
    name: 'Morocco', 
    subtitle: 'Casablanca, Dakhla, Marrakech',
    dates: 'Aug 17th - Sep 21st', 
    duration: '36 days',
    islandImg: './images/dakhla.png',
    size: 160
  },
  { 
    name: 'Azores', 
    dates: 'Sep 21st - Oct 4th', 
    duration: '14 days',
    islandImg: './images/azores.png',
    size: 160
  },
  { 
    name: 'New York', 
    dates: 'Oct 4th - Oct 10th', 
    duration: '7 days',
    islandImg: './images/NY.png',
    size: 200
  },
  { 
    name: '???', 
    dates: 'September-October', 
    duration: '???',
    islandImg: './images/mystery.png',
  },
  { 
    name: 'Buenos Aires', 
    dates: 'November', 
    duration: '???',
    islandImg: './images/buenos_aires.png',
    size: 160
  },
  { 
    name: 'Antarctica', 
    dates: 'November', 
    duration: '12 days',
    islandImg: './images/antarctica.png',
    size: 160
  },
  { 
    name: 'Orange County', 
    dates: 'December', 
    duration: '1 month',
    islandImg: './images/orange_county.png',
    size: 140
  },
];

// Utility functions
function getColumnCount() {
  const grid = document.querySelector('.island-grid');
  const style = window.getComputedStyle(grid);
  const templateColumns = style.getPropertyValue('grid-template-columns');
  return templateColumns.split(' ').length;
}

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