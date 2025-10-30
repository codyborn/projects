# Multi-Card Selection Feature Specification

## Overview
Add the ability for players to click and drag to create a selection rectangle (in player's color) that selects multiple cards on the board. Selected cards are highlighted and can be moved together as a group.

## Core Requirements

### 1. Selection Rectangle Creation
- **Trigger**: Click and drag on empty table area (not on a card)
- **Visual**: Rectangle border in player's color (using `generatePlayerColor()`)
- **Behavior**:
  - Start position: Where mouse is pressed
  - End position: Current mouse position while dragging
  - Rectangle updates in real-time as mouse moves
  - Only visible while dragging (disappears on mouseup)

### 2. Card Selection Rules
- **Include**:
  - Cards on the table (location='table')
  - Cards in private zone (cards with `privateTo` attribute set to current player)
- **Exclude**:
  - Cards in discard pile (location='discardPile' or positioned over discard area)
  - Cards belonging to other players' private zones (`privateTo` != current player)
  - Deck element

### 3. Selection Detection Logic
When creating selection rectangle, determine which cards are selected:
```
For each card on the table:
  1. Get card's bounding rectangle
  2. Check if card center or any corner intersects with selection rectangle
  3. Check card's location:
     - If location='discardPile' → EXCLUDE
     - If privateTo exists and != currentPlayerId → EXCLUDE
     - Otherwise → INCLUDE if rectangle intersects
```

### 4. Visual Feedback

#### Selection Highlighting
- **Method**: Add CSS class `card-selected` to selected card elements
- **Styling**:
  - Border: 3px solid player's color (via CSS variable `--selection-color`)
  - Box-shadow: Glow effect in player's color
  - Z-index: Ensure selected cards are above non-selected cards

#### Selection Rectangle
- **Element**: Temporary `<div>` element with class `selection-rectangle`
- **Styling**:
  - Border: 2px dashed player's color
  - Background: Semi-transparent fill in player's color (opacity ~0.2)
  - Position: Absolute, relative to `#card-table`
  - Z-index: High enough to be visible above cards but below dragging cards (e.g., 5000)

### 5. Group Movement

#### Starting Group Drag
- **Trigger**: 
  - User clicks and drags on any selected card, OR
  - User clicks and drags on selection rectangle (if it exists)
- **Behavior**:
  - All selected cards move together
  - Maintain relative positions to each other
  - Calculate offset from mouse to first selected card's position
  - Apply same offset to all cards in group

#### During Drag
- All selected cards move together maintaining their relative positions
- Cards follow mouse movement
- Update positions in real-time (no server communication yet)

#### Drop Handling

##### Drop on Table
- Calculate final positions for all cards
- Maintain relative spacing between cards
- Send single `moveCards()` call with all card positions

##### Drop in Private Zone
- Check if center of selection group is within `#private-hand-zone`
- If yes:
  - Remove selection highlighting
  - Calculate organized positions using `findBestPositionInPrivateZone()` for each card
  - Set `privateTo` attribute on all cards to current player
  - Send `moveCards()` with organized positions
- Cards should be neatly organized (side-by-side, rows)

##### Drop in Discard Pile
- Check if center of selection group is within `#discard-pile-area`
- If yes:
  - Use `addCardsToDiscardPile()` for all selected cards
  - Remove selection highlighting
  - Cards are positioned over discard area with stacking

### 6. State Management

#### Selection State
```javascript
{
  selectedCards: Array<HTMLElement>,  // Array of selected card elements
  isSelecting: boolean,               // Currently dragging selection rectangle
  isDraggingGroup: boolean,           // Currently dragging group of cards
  selectionStart: {x, y},             // Selection rectangle start position
  selectionCurrent: {x, y},           // Current mouse position
  selectionRect: HTMLElement          // Selection rectangle DOM element
}
```

#### Selection Persistence
- Selection persists until:
  - User clicks on empty table area (clears selection)
  - User completes a group drag operation
  - User presses Escape key (clears selection)
  - Connection is lost (clears selection on disconnect)

### 7. Server Communication

#### Update Protocol
- **Single Update**: Only send final moved state to server (after mouseup)
- **Method**: Use existing `moveCards(cardElements, positions)` API
- **Format**: Array of card states with final positions
- **No Intermediate Updates**: Don't send updates during drag (only on drop)

#### Multi-Card Update Example
```javascript
// After drop, calculate all final positions
const cardStates = selectedCards.map(cardElement => {
  return {
    uniqueId: cardElement.dataset.uniqueId,
    card: game.getCardFromElement(cardElement),
    position: {
      x: parseInt(cardElement.style.left) || 0,
      y: parseInt(cardElement.style.top) || 0
    },
    location: determineLocation(cardElement), // 'table' or 'discardPile'
    isFlipped: cardElement.classList.contains('flipped'),
    privateTo: cardElement.dataset.privateTo || null,
    zIndex: parseInt(cardElement.style.zIndex) || 0,
    timestamp: Date.now()
  };
});

// Send single update
game.moveCards(selectedCards, cardStates.map(cs => cs.position));
```

### 8. Edge Cases

#### Empty Selection
- If no cards are selected after rectangle drag, clear selection state
- Don't show selection highlight on empty selection

#### Single Card Selection
- Allow rectangle selection of single card
- Same group movement behavior applies

#### Overlapping Cards
- Selection rectangle can select multiple overlapping cards
- All intersecting cards are included in selection

#### Mixed Zone Selection
- If selection includes both table and private zone cards, that's valid
- When moving group, all cards move together regardless of original zone
- Final zone assignment based on drop location

#### Drag Cancellation
- If user presses Escape during drag, cancel operation
- Return cards to original positions
- Clear selection state

#### Connection State
- Check connection status before starting selection
- Block selection when not connected (same as single card drag)
- Clear selection if connection lost during operation

## Implementation Details

### New Methods in CardGame Class

```javascript
// Selection Management
startSelection(e)              // Begin selection rectangle on mousedown
updateSelection(e)             // Update rectangle during mousemove
endSelection(e)                // Complete selection on mouseup
getCardsInRectangle(rect)      // Find cards intersecting selection rectangle
selectCards(cardElements)      // Add cards to selection
deselectCards(cardElements)   // Remove cards from selection
clearSelection()               // Clear all selections
isCardSelectable(cardElement)  // Check if card can be selected

// Group Movement
startGroupDrag(e)              // Begin dragging selected group
updateGroupDrag(e)             // Update positions during drag
endGroupDrag(e)                // Complete group drag, send to server
calculateGroupOffset(cards, mousePos)  // Calculate relative offset for group
```

### New CSS Classes

```css
.card-selected {
    border: 3px solid var(--selection-color);
    box-shadow: 0 0 10px var(--selection-color);
    z-index: 1003; /* Above normal cards, below dragging */
}

.selection-rectangle {
    position: absolute;
    border: 2px dashed var(--selection-color);
    background: rgba(var(--selection-color-rgb), 0.2);
    pointer-events: none;
    z-index: 5000;
    border-radius: 4px;
}

.card-dragging-group {
    /* Special styling for cards being dragged as group */
    z-index: 1004; /* Above selected, below individual dragging */
}
```

### Event Handling Modifications

#### Table Click Handler
- Distinguish between:
  - Single click on empty area → Clear selection (if any)
  - Click and drag on empty area → Start selection rectangle
  - Click on card → Handle single card interaction (existing behavior)

#### Card Interaction Modifications
- If card is selected and user clicks on it:
  - Start group drag (if multiple cards selected)
  - OR single card drag (if only that card selected)
- Prevent default card flip when starting group drag

### Integration Points

1. **`setupEventListeners()`**: Add selection rectangle event handlers on `#card-table`
2. **`addCardInteractions()`**: Modify to check for selection state before starting drag
3. **`moveCards()`**: Already supports multi-card arrays (no changes needed)
4. **`addCardsToDiscardPile()`**: Already supports multi-card arrays (no changes needed)
5. **`findBestPositionInPrivateZone()`**: Reuse for organizing selected cards in private zone

## User Experience Flow

### Selection Flow
1. User clicks and drags on empty table area
2. Selection rectangle appears in player's color
3. As rectangle expands, cards intersecting it become highlighted
4. User releases mouse button
5. Selection is locked, rectangle disappears
6. Selected cards remain highlighted in player's color

### Movement Flow
1. User clicks and drags on any selected card (or selection area)
2. All selected cards move together maintaining relative positions
3. User drags to target location (table, private zone, or discard pile)
4. User releases mouse button
5. Cards snap to final positions
6. Single server update is sent with all card states
7. Selection highlighting is removed
8. Cards receive movement highlight (existing behavior)

## Testing Considerations

### Test Cases
1. **Selection**:
   - Select cards on table (should work)
   - Select cards in private zone (should work)
   - Try to select discard pile cards (should be ignored)
   - Try to select other players' private cards (should be ignored)

2. **Group Movement**:
   - Move selected group to empty table area
   - Move selected group to private zone (should organize neatly)
   - Move selected group to discard pile
   - Cancel drag mid-operation (should return cards to original positions)

3. **Edge Cases**:
   - Select single card (should work as group)
   - Select overlapping cards
   - Select cards from different zones
   - Clear selection (Escape key, click empty area)
   - Selection during connection loss

4. **Server Sync**:
   - Verify only final state is sent
   - Verify all cards in group are updated correctly
   - Verify other players see correct final positions
   - Verify private zone assignment works correctly

## Success Criteria

✅ Player can click and drag to create selection rectangle
✅ Rectangle displays in player's color
✅ Selected cards are highlighted in player's color
✅ Discard pile cards are excluded from selection
✅ Private zone cards are included in selection
✅ Group can be moved together maintaining relative positions
✅ Group can be dropped in private zone and organized neatly
✅ Group can be dropped in discard pile
✅ Only final state is sent to server (no intermediate updates)
✅ Other players see correct final positions
✅ Selection can be cleared
✅ Works with existing single-card drag functionality

