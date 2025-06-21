// Cities data
const cities = [
  { 
    name: 'Miami',
    dates: 'January - April',
    duration: '3 months',
    islandImg: './images/miami.png',
    blog: './posts/miami.md',
    blogTitle: 'Tied down',
  },
  { 
    name: 'New York', 
    dates: 'April', 
    duration: '1 month',
    islandImg: './images/NY.png',
    size: 200
  },
  { 
    name: 'Madrid', 
    dates: 'April - May', 
    duration: '1 week',
    islandImg: './images/madrid.png' ,
    size: 150
  },
  { 
    name: 'Granada', 
    dates: 'May', 
    duration: '2 weeks',
    islandImg: './images/granada.png' ,
    size: 200
  },
  { 
    name: 'Hyeres', 
    dates: 'May - June', 
    duration: '1 month',
    islandImg: './images/hyeres.png',
    size: 160
  },
  { 
    name: 'Antibes', 
    dates: 'June', 
    duration: '3 weeks',
    islandImg: './images/antibes.png',
    size: 160
  },
  { 
    name: 'Cannes', 
    dates: 'June-July', 
    duration: '1 week',
    islandImg: './images/cannes.png',
    size: 160
  },
  { 
    name: 'Scotland', 
    dates: 'July', 
    duration: '???',
    islandImg: './images/scotland.png',
    size: 150
  },
  { 
    name: '???', 
    dates: 'July-August', 
    duration: '???',
    islandImg: './images/mystery.png',
  },
  { 
    name: 'Azores', 
    dates: 'August', 
    duration: '2 weeks',
    islandImg: './images/azores.png',
    size: 160
  },
  { 
    name: 'Morocco', 
    dates: 'August', 
    duration: '???',
    islandImg: './images/dakhla.png',
    size: 160
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