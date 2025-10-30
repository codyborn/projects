# Card Game Event State Management & UI Updates Flow

```mermaid
graph TD
    %% Connection Flow
    CONNECT[User Connects] --> CHECK_STATUS{Connection Status?}
    CHECK_STATUS -->|Offline/Connecting| SHOW_OVERLAY[Show Board Connection Overlay]
    SHOW_OVERLAY --> BLOCK_ACTIONS[Block All Card Actions]
    CHECK_STATUS -->|Connected| HIDE_OVERLAY[Hide Overlay, Enable Actions]
    
    JOIN_ROOM[User Joins Room] --> WS_CONNECT[WebSocket Connect]
    WS_CONNECT --> SEND_JOIN[Send joinRoom with playerId + playerAlias]
    SEND_JOIN --> SERVER_JOIN[Server: joinRoom]
    SERVER_JOIN --> CREATE_ROOM{Room Exists?}
    CREATE_ROOM -->|No| NEW_ROOM[Create Room State]
    CREATE_ROOM -->|Yes| ADD_PLAYER[Add Player to Room]
    NEW_ROOM --> ADD_PLAYER
    ADD_PLAYER --> SEND_FULL_STATE[Server: Send roomJoined with fullState + players]
    SEND_FULL_STATE --> CLIENT_RECEIVE[Client: Receive fullState]
    CLIENT_RECEIVE --> UPDATE_STATUS[Update Connection Status to 'connected']
    UPDATE_STATUS --> HIDE_OVERLAY
    
    %% User Interactions with Connection Checks
    DEAL_CARD[User Clicks Deck] --> CHECK_CONNECTION{Is Connected?}
    CHECK_CONNECTION -->|No| PREVENT_DEAL[Prevent Deal Card Action]
    CHECK_CONNECTION -->|Yes| POP_CARD[Pop Card from Deck]
    POP_CARD --> CREATE_ELEMENT[Create Card Element]
    CREATE_ELEMENT --> POSITION_CARD[Position Card on Table]
    POSITION_CARD --> BROADCAST_DEAL[Broadcast cardState with position]
    
    DRAG_CARD[User Drags Card] --> CHECK_CONNECTION_DRAG{Is Connected?}
    CHECK_CONNECTION_DRAG -->|No| PREVENT_DRAG[Prevent Drag]
    CHECK_CONNECTION_DRAG -->|Yes| SET_ZINDEX[Set card z-index to highest]
    SET_ZINDEX --> TRACK_MOUSE[Track Mouse Movement]
    TRACK_MOUSE --> DROP_CHECK{Card Dropped?}
    
    DROP_CHECK -->|In Private Zone| SET_PRIVATE[Set privateTo = playerId]
    DROP_CHECK -->|In Discard Area| DISCARD_AREA[Position over discard area on table]
    DROP_CHECK -->|On Table| TABLE_POS[Calculate table position]
    
    DISCARD_AREA --> ENFORCE_FACEUP[Enforce isFlipped = false]
    ENFORCE_FACEUP --> POSITION_OVER_AREA[Position card on table over discard area]
    POSITION_OVER_AREA --> BROADCAST_DISCARD[Broadcast location='discardPile']
    
    TABLE_POS --> BROADCAST_TABLE[Broadcast location='table' with position]
    SET_PRIVATE --> BROADCAST_PRIVATE[Broadcast privateTo + position]
    
    %% Right-Click Discard
    RIGHT_CLICK[User Right-Clicks Card] --> CHECK_CONNECTION_RIGHT{Is Connected?}
    CHECK_CONNECTION_RIGHT -->|No| PREVENT_RIGHT[Prevent Right-Click]
    CHECK_CONNECTION_RIGHT -->|Yes| ADD_TO_DISCARD[addCardToDiscardPile]
    ADD_TO_DISCARD --> ENFORCE_FACEUP
    ENFORCE_FACEUP --> POSITION_OVER_AREA
    POSITION_OVER_AREA --> BROADCAST_DISCARD
    
    %% Card Flip
    CLICK_CARD[User Clicks Card Short] --> FLIP_CARD[Toggle flipped class]
    FLIP_CARD --> BROADCAST_FLIP[Broadcast isFlipped state]
    
    %% Server-Side Processing
    BROADCAST_DEAL --> SERVER_UPDATE[Server: updateCardState]
    BROADCAST_DISCARD --> SERVER_UPDATE
    BROADCAST_TABLE --> SERVER_UPDATE
    BROADCAST_PRIVATE --> SERVER_UPDATE
    BROADCAST_FLIP --> SERVER_UPDATE
    
    SERVER_UPDATE --> PRESERVE_LOCATION{Location Field Present?}
    PRESERVE_LOCATION -->|No| KEEP_EXISTING[Preserve Existing Location]
    PRESERVE_LOCATION -->|Yes| UPDATE_LOCATION[Update Location State]
    
    UPDATE_LOCATION --> CHECK_DISCARD{Location = discardPile?}
    CHECK_DISCARD -->|Yes| ENFORCE_FACEUP_SERVER[Server: Set isFlipped = false]
    CHECK_DISCARD -->|No| UPDATE_DISCARD_TRACK[Update discardPile array]
    ENFORCE_FACEUP_SERVER --> UPDATE_DISCARD_TRACK
    UPDATE_DISCARD_TRACK --> BROADCAST_STATE[Broadcast to All Clients]
    
    KEEP_EXISTING --> UPDATE_CARD_STATE[Update Card in cards Map]
    UPDATE_CARD_STATE --> BROADCAST_STATE
    
    %% Client Receives State
    BROADCAST_STATE --> CLIENT_RECEIVE_STATE[Client: Receive cardState update]
    CLIENT_RECEIVE_STATE --> CHECK_LOCATION_RECEIVE{Location = discardPile?}
    CHECK_LOCATION_RECEIVE -->|Yes| POSITION_DISCARD_RECEIVE[Position on table over discard area]
    CHECK_LOCATION_RECEIVE -->|No| APPLY_POSITION[Apply position from server]
    POSITION_DISCARD_RECEIVE --> ENFORCE_FACEUP_CLIENT[Client: Enforce face-up]
    APPLY_POSITION --> APPLY_FLIP[Apply isFlipped state]
    ENFORCE_FACEUP_CLIENT --> UPDATE_UI
    APPLY_FLIP --> UPDATE_UI
    
    %% Discard Pile Shuffle
    SHUFFLE_DISCARD[User Clicks Shuffle Discard] --> COLLECT_CARDS[Collect discard pile card uniqueIds]
    COLLECT_CARDS --> SEND_SHUFFLE[Send shuffleDiscardPile request]
    SEND_SHUFFLE --> SERVER_SHUFFLE[Server: Remove cards from discardPile]
    SERVER_SHUFFLE --> REMOVE_CARDS[Remove cards from state]
    REMOVE_CARDS --> ADD_TO_DECK[Add cards back to deckData]
    ADD_TO_DECK --> SHUFFLE_DECK_DATA[Shuffle deckData.cards]
    SHUFFLE_DECK_DATA --> BROADCAST_DECK[Broadcast deckChange]
    BROADCAST_DECK --> CLIENT_DECK_UPDATE[Client: Clear board + load deck]
    
    %% Full State Request
    RECONNECT[Client Reconnects] --> REQUEST_FULL[Request fullState from server]
    REQUEST_FULL --> SERVER_SERIALIZE[Server: serializeGameState]
    SERVER_SERIALIZE --> ENFORCE_DISCARD_FACEUP[Enforce isFlipped=false for discard cards]
    ENFORCE_DISCARD_FACEUP --> SEND_FULL_STATE_RESPONSE[Send fullState response]
    SEND_FULL_STATE_RESPONSE --> CLIENT_APPLY_FULL[Client: Apply full state]
    CLIENT_APPLY_FULL --> POSITION_ALL_DISCARD[Position all discard pile cards over area]
    POSITION_ALL_DISCARD --> UPDATE_PRIVATE_HAND[Update private hand display]
    
    %% Deck Management
    CHANGE_DECK[User Changes Deck] --> LOAD_LOCAL[Load Deck Locally]
    LOAD_LOCAL --> CLEAR_BOARD[Clear All Cards]
    CLEAR_BOARD --> SET_ORIGINAL_SIZE[Set originalDeckSize]
    SET_ORIGINAL_SIZE --> BROADCAST_DECK_CHANGE[Broadcast updateDeck]
    BROADCAST_DECK_CHANGE --> SERVER_DECK[Server: Update deckData]
    SERVER_DECK --> CLEAR_SERVER_CARDS[Clear cards and discardPile on server]
    CLEAR_SERVER_CARDS --> BROADCAST_DECK_TO_ALL[Broadcast deckChange to all]
    BROADCAST_DECK_TO_ALL --> OTHER_CLIENTS[Other Clients: Clear + Load Remote Deck]
    
    %% UI Updates
    UPDATE_UI --> UPDATE_PRIVATE_COUNT[Update Private Hand Display]
    UPDATE_PRIVATE_COUNT --> COUNT_BY_PRIVATE[Count Cards by privateTo attribute]
    COUNT_BY_PRIVATE --> SHOW_COUNTS[Show Your Hand + Other Players Counts]
    
    UPDATE_DISCARD_COUNT[Update Discard Pile Counter] --> COUNT_DISCARD[Count Cards in Discard Area]
    COUNT_DISCARD --> SHOW_DISCARD_COUNT[Show Discard Pile Count]
    
    %% Styling
    classDef userAction fill:#e1f5fe
    classDef connection fill:#fff3e0
    classDef localUpdate fill:#f3e5f5
    classDef broadcast fill:#ffeb3b
    classDef server fill:#e8f5e8
    classDef uiUpdate fill:#fce4ec
    classDef discard fill:#ff9800
    classDef private fill:#9c27b0
    
    class CONNECT,JOIN_ROOM,DEAL_CARD,DRAG_CARD,RIGHT_CLICK,CLICK_CARD,SHUFFLE_DISCARD,CHANGE_DECK userAction
    class CHECK_STATUS,SHOW_OVERLAY,HIDE_OVERLAY,BLOCK_ACTIONS,CHECK_CONNECTION,CHECK_CONNECTION_DRAG,CHECK_CONNECTION_RIGHT,WS_CONNECT,SEND_JOIN connection
    class POP_CARD,CREATE_ELEMENT,POSITION_CARD,SET_ZINDEX,TRACK_MOUSE,SET_PRIVATE,TABLE_POS,FLIP_CARD localUpdate
    class BROADCAST_DEAL,BROADCAST_DISCARD,BROADCAST_TABLE,BROADCAST_PRIVATE,BROADCAST_FLIP,BROADCAST_STATE,BROADCAST_DECK,BROADCAST_DECK_CHANGE,BROADCAST_DECK_TO_ALL broadcast
    class SERVER_JOIN,CREATE_ROOM,ADD_PLAYER,SEND_FULL_STATE,SERVER_UPDATE,UPDATE_LOCATION,CHECK_DISCARD,ENFORCE_FACEUP_SERVER,UPDATE_DISCARD_TRACK,UPDATE_CARD_STATE,SERVER_SHUFFLE,REMOVE_CARDS,ADD_TO_DECK,SHUFFLE_DECK_DATA,SERVER_SERIALIZE,ENFORCE_DISCARD_FACEUP,SERVER_DECK,CLEAR_SERVER_CARDS server
    class DISCARD_AREA,ENFORCE_FACEUP,POSITION_OVER_AREA,ADD_TO_DISCARD,CHECK_LOCATION_RECEIVE,POSITION_DISCARD_RECEIVE,ENFORCE_FACEUP_CLIENT,COLLECT_CARDS,SEND_SHUFFLE,UPDATE_DISCARD_COUNT,COUNT_DISCARD,SHOW_DISCARD_COUNT discard
    class SET_PRIVATE,BROADCAST_PRIVATE,UPDATE_PRIVATE_COUNT,COUNT_BY_PRIVATE,SHOW_COUNTS private
    class CLIENT_RECEIVE,CLIENT_RECEIVE_STATE,APPLY_POSITION,APPLY_FLIP,UPDATE_UI,CLIENT_DECK_UPDATE,CLIENT_APPLY_FULL,POSITION_ALL_DISCARD,OTHER_CLIENTS,LOAD_LOCAL,CLEAR_BOARD,SET_ORIGINAL_SIZE uiUpdate
```

## Key Features:

### 🔌 **Connection Management & Action Blocking**
- **Connection Status Overlay**: Shows on-board overlay when offline/connecting, hides when connected
- **Action Prevention**: All card actions (deal, drag, right-click, flip) check connection status first
- **Visual Feedback**: Overlay covers entire board (including deck and private zone) with status indicator
- **Z-Index Hierarchy**: Menu (z-index: 10000) > Menu Toggle (z-index: 10001) > Overlay (z-index: 2000) > Cards

### 🗑️ **Discard Pile System (Area-Based)**
- **Area-Based Detection**: Cards are positioned on `card-table` over the `discard-pile-area` (not in a container)
- **Face-Up Enforcement**: Both server and client enforce `isFlipped=false` for discard pile cards
- **Location Property**: Cards use `location='discardPile'` vs `location='table'` to track state
- **No Reparenting**: Cards remain on `card-table` but positioned over discard area
- **Perfect Stacking**: No offsets - cards stack directly on top of each other

### 📡 **Server-Authoritative State**
- **Location Preservation**: Server preserves existing `location` if not explicitly provided in updates
- **State Reconciliation**: Server maintains `discardPile` array of uniqueIds and `cards` Map
- **Face-Up Enforcement**: Server enforces `isFlipped=false` when `location='discardPile'` is set
- **Full State Sync**: `serializeGameState` enforces face-up for all discard pile cards before sending

### 🎯 **Card State Updates**
- **Explicit Location**: All client updates include `location` property (discardPile or table)
- **Top-Left Coordinates**: Positions sent as top-left relative to table (prevents post-drop drift)
- **Z-Index Management**: Dragged cards always get highest z-index (10000+)
- **Private Zone Detection**: Cards dropped in private zone get `privateTo` attribute set

### 🔄 **Event Flow Patterns**
1. **Connection**: User Action → Connection Check → Action Allowed/Blocked → Update → Broadcast → Server Processing → Broadcast to All → UI Update
2. **Discard**: Drop in Area → Position Over Area → Enforce Face-Up → Broadcast `location='discardPile'` → Server Updates State → Broadcast to All
3. **Drag Out**: Drag from Discard → Calculate Position → Broadcast `location='table'` → Server Removes from discardPile → Broadcast to All
4. **Right-Click**: Right-Click Card → `addCardToDiscardPile` → Same flow as drag-drop discard

### 🎨 **UI State Management**
- **Private Hand Display**: Counts cards by `privateTo` attribute from DOM
- **Discard Pile Counter**: Counts cards whose center lies within `discard-pile-area` bounds
- **Connection Status**: Displays in both menu and on-board overlay
- **Player Aliases**: Uses aliases for display, playerId for state tracking

### ✅ **Key Improvements**
- **Area-Based Discard**: No container reparenting - cards stay on table with absolute positioning
- **Connection Blocking**: Prevents state loss by blocking actions when disconnected
- **Location Tracking**: Explicit `location` property ensures accurate state synchronization
- **Face-Up Enforcement**: Consistent enforcement at client broadcast, server update, and state serialization
- **Z-Index Management**: Dragged cards always visible above all other elements
- **Position Accuracy**: Top-left coordinates prevent visual drift on drop
