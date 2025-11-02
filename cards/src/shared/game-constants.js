/**
 * Shared game constants used by both client and server
 * This ensures dimensions and spacing remain synchronized
 */

// Card table dimensions (fixed size)
const TABLE_WIDTH = 1200;
const TABLE_HEIGHT = 800;

// Private hand zone dimensions (relative to card-table)
const PRIVATE_ZONE_LEFT = 20;
const PRIVATE_ZONE_RIGHT = 20;
const PRIVATE_ZONE_BOTTOM = 20;
const PRIVATE_ZONE_MIN_HEIGHT = 120;

// Card dimensions in private zone (smaller than table cards)
const PRIVATE_ZONE_CARD_WIDTH = 60;
const PRIVATE_ZONE_CARD_HEIGHT = 80;
const PRIVATE_ZONE_CARD_SPACING = 25; // Increased spacing between cards

// Vertical offset for cards in private zone to center them vertically
// Cards should be positioned 46px from the bottom of the table to align with zone center
const PRIVATE_ZONE_CARD_BOTTOM_OFFSET = 72;

// Card dimensions for table cards (default/standard)
const TABLE_CARD_WIDTH = 76;
const TABLE_CARD_HEIGHT = 100;

// Calculate derived values
const PRIVATE_ZONE_WIDTH = TABLE_WIDTH - PRIVATE_ZONE_LEFT - PRIVATE_ZONE_RIGHT; // ~1160px
const PRIVATE_ZONE_TOP = TABLE_HEIGHT - PRIVATE_ZONE_MIN_HEIGHT - PRIVATE_ZONE_BOTTOM; // Start at top of zone
// Y position to center cards vertically in private zone (46px from bottom)
const PRIVATE_ZONE_CARD_Y_BASE = TABLE_HEIGHT - PRIVATE_ZONE_CARD_BOTTOM_OFFSET - PRIVATE_ZONE_CARD_HEIGHT;

// Export for Node.js (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TABLE_WIDTH,
        TABLE_HEIGHT,
        PRIVATE_ZONE_LEFT,
        PRIVATE_ZONE_RIGHT,
        PRIVATE_ZONE_BOTTOM,
        PRIVATE_ZONE_MIN_HEIGHT,
        PRIVATE_ZONE_WIDTH,
        PRIVATE_ZONE_TOP,
        PRIVATE_ZONE_CARD_WIDTH,
        PRIVATE_ZONE_CARD_HEIGHT,
        PRIVATE_ZONE_CARD_SPACING,
        PRIVATE_ZONE_CARD_BOTTOM_OFFSET,
        PRIVATE_ZONE_CARD_Y_BASE,
        TABLE_CARD_WIDTH,
        TABLE_CARD_HEIGHT
    };
}

// Export for browser (ES modules)
if (typeof window !== 'undefined') {
    window.GameConstants = {
        TABLE_WIDTH,
        TABLE_HEIGHT,
        PRIVATE_ZONE_LEFT,
        PRIVATE_ZONE_RIGHT,
        PRIVATE_ZONE_BOTTOM,
        PRIVATE_ZONE_MIN_HEIGHT,
        PRIVATE_ZONE_WIDTH,
        PRIVATE_ZONE_TOP,
        PRIVATE_ZONE_CARD_WIDTH,
        PRIVATE_ZONE_CARD_HEIGHT,
        PRIVATE_ZONE_CARD_SPACING,
        PRIVATE_ZONE_CARD_BOTTOM_OFFSET,
        PRIVATE_ZONE_CARD_Y_BASE,
        TABLE_CARD_WIDTH,
        TABLE_CARD_HEIGHT
    };
}

