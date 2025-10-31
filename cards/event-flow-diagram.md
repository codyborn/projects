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
    CHECK_CONNECTION -->|Yes| REQUEST_DEAL[Client: Send dealCard request]
    REQUEST_DEAL --> SERVER_DEAL[Server: dealCard]
    SERVER_DEAL --> VALIDATE_DECK{Deck Exists & Has Cards?}
    VALIDATE_DECK -->|No| SEND_ERROR[Send DECK_EMPTY error]
    VALIDATE_DECK -->|Yes| POP_FROM_DECK[Server: Pop card from deckData]
    POP_FROM_DECK --> CREATE_CARD_STATE[Server: Create cardState with privateTo=playerId]
    CREATE_CARD_STATE --> STORE_IN_STATE[Server: Store in cards Map]
    STORE_IN_STATE --> SEND_CARD_DEALT[Server: Send cardDealt to requesting player]
    STORE_IN_STATE --> BROADCAST_DECK_CHANGE[Server: Broadcast deckChange with reduced deck]
    STORE_IN_STATE --> BROADCAST_CARD_STATE[Server: Broadcast cardState to all (exclude requester)]
    SEND_CARD_DEALT --> CLIENT_HANDLE_DEALT[Client: handleCardDealt]
    CLIENT_HANDLE_DEALT --> CREATE_ELEMENT[Create Card Element]
    CREATE_ELEMENT --> POSITION_PRIVATE[Position Card in Private Zone]
    POSITION_PRIVATE --> UPDATE_PRIVATE_DISPLAY[Update Private Hand Display]
    BROADCAST_CARD_STATE --> CLIENT_RECEIVE_DEALT[Other Clients: Receive cardState]
    BROADCAST_DECK_CHANGE --> CLIENT_DECK_UPDATE[All Clients: Update deck display]
    
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
    BROADCAST_DISCARD --> SERVER_UPDATE[Server: updateCardState with array]
    BROADCAST_TABLE --> SERVER_UPDATE
    BROADCAST_PRIVATE --> SERVER_UPDATE
    BROADCAST_FLIP --> SERVER_UPDATE
    
    SERVER_UPDATE --> VALIDATE_ARRAY{Validate cardStates Array}
    VALIDATE_ARRAY -->|Invalid| SEND_ERROR_STATE[Send INVALID_STATE error]
    VALIDATE_ARRAY -->|Valid| PROCESS_CARDS[Process Each Card State]
    
    PROCESS_CARDS --> CHECK_STATUS{status = 'discarded'?}
    CHECK_STATUS -->|Yes| REMOVE_CARD[Remove from cards Map & discardPile]
    CHECK_STATUS -->|No| CHECK_NEW_CARD{Is New Card?}
    
    REMOVE_CARD --> BROADCAST_STATE[Broadcast cardState with status='discarded']
    
    CHECK_NEW_CARD -->|Yes - Not in State| REMOVE_FROM_DECK[Remove card from deckData]
    CHECK_NEW_CARD -->|No - Exists| MERGE_STATE[Merge with existing state]
    REMOVE_FROM_DECK --> BROADCAST_DECK_UPDATE[Broadcast deckChange]
    REMOVE_FROM_DECK --> MERGE_STATE
    
    MERGE_STATE --> CHECK_LOCATION_FIELD{Location Field Present?}
    CHECK_LOCATION_FIELD -->|No| PRESERVE_LOCATION[Preserve Existing Location]
    CHECK_LOCATION_FIELD -->|Yes| UPDATE_LOCATION[Update Location State]
    
    UPDATE_LOCATION --> CHECK_DISCARD{Location = discardPile?}
    CHECK_DISCARD -->|Yes| ENFORCE_FACEUP_SERVER[Server: Set isFlipped = false]
    CHECK_DISCARD -->|Yes| ADD_TO_DISCARD[Add uniqueId to discardPile array]
    CHECK_DISCARD -->|No| REMOVE_FROM_DISCARD[Remove uniqueId from discardPile]
    ENFORCE_FACEUP_SERVER --> UPDATE_CARD_STATE[Update Card in cards Map]
    ADD_TO_DISCARD --> UPDATE_CARD_STATE
    REMOVE_FROM_DISCARD --> UPDATE_CARD_STATE
    PRESERVE_LOCATION --> UPDATE_CARD_STATE
    
    UPDATE_CARD_STATE --> BROADCAST_STATE[Broadcast cardState to All Clients]
    
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
    COLLECT_CARDS --> SEND_SHUFFLE[Client: Send shuffleDiscardPile request]
    SEND_SHUFFLE --> SERVER_SHUFFLE[Server: shuffleDiscardPile]
    SERVER_SHUFFLE --> COLLECT_CARD_DATA[Collect card data BEFORE removal]
    COLLECT_CARD_DATA --> REMOVE_FROM_STATE[Remove from cards Map & discardPile]
    REMOVE_FROM_STATE --> BROADCAST_REMOVAL[Broadcast cardState with status='discarded']
    BROADCAST_REMOVAL --> CHECK_DECK_SIZE{Calculate deck size limits}
    CHECK_DECK_SIZE --> CHECK_ORIGINAL{currentSize < originalSize?}
    CHECK_ORIGINAL -->|Yes| ADD_TO_DECK[Add cards back to deckData]
    CHECK_ORIGINAL -->|No| TRUNCATE_CARDS[Truncate to fit originalSize]
    ADD_TO_DECK --> SHUFFLE_DECK_DATA[Shuffle deckData.cards]
    TRUNCATE_CARDS --> SHUFFLE_DECK_DATA
    SHUFFLE_DECK_DATA --> ENSURE_SIZE{Ensure deck <= originalSize}
    ENSURE_SIZE --> BROADCAST_DECK[Broadcast deckChange with shuffled deck]
    BROADCAST_DECK --> CLIENT_DECK_UPDATE[Client: Update deck without clearing board]
    BROADCAST_REMOVAL --> CLIENT_REMOVE_CARDS[Client: Remove cards from DOM]
    
    %% Full State Request & Reconnection
    RECONNECT[Client Reconnects] --> WS_RECONNECT[WebSocket Reconnects]
    WS_RECONNECT --> SEND_JOIN_AGAIN[Client: Send joinRoom again]
    SEND_JOIN_AGAIN --> SERVER_JOIN_AGAIN[Server: joinRoom (room exists)]
    SERVER_JOIN_AGAIN --> SEND_ROOM_JOINED[Server: Send roomJoined with fullState + players]
    SEND_ROOM_JOINED --> CLIENT_APPLY_FULL[Client: Apply full state]
    
    REQUEST_FULL[Client: Request fullState] --> SERVER_SERIALIZE[Server: serializeGameState]
    SERVER_SERIALIZE --> ENFORCE_DISCARD_FACEUP[Enforce isFlipped=false for discard cards]
    ENFORCE_DISCARD_FACEUP --> CONVERT_MAPS[Convert Maps to objects for JSON]
    CONVERT_MAPS --> SEND_FULL_STATE_RESPONSE[Send fullState response]
    SEND_FULL_STATE_RESPONSE --> CLIENT_APPLY_FULL
    
    CLIENT_APPLY_FULL --> CLEAR_BOARD[Client: Clear board]
    CLEAR_BOARD --> LOAD_DECK[Load deck from state]
    LOAD_DECK --> PROCESS_CARDS[Process all card states from state]
    PROCESS_CARDS --> POSITION_ALL_DISCARD[Position all discard pile cards over area]
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
    class CHECK_STATUS,SHOW_OVERLAY,HIDE_OVERLAY,BLOCK_ACTIONS,CHECK_CONNECTION,CHECK_CONNECTION_DRAG,CHECK_CONNECTION_RIGHT,WS_CONNECT,SEND_JOIN,WS_RECONNECT,SEND_JOIN_AGAIN connection
    class CREATE_ELEMENT,POSITION_CARD,POSITION_PRIVATE,SET_ZINDEX,TRACK_MOUSE,SET_PRIVATE,TABLE_POS,FLIP_CARD localUpdate
    class BROADCAST_DISCARD,BROADCAST_TABLE,BROADCAST_PRIVATE,BROADCAST_FLIP,BROADCAST_STATE,BROADCAST_DECK,BROADCAST_DECK_CHANGE,BROADCAST_DECK_TO_ALL,BROADCAST_DECK_UPDATE,BROADCAST_CARD_STATE,BROADCAST_REMOVAL broadcast
    class SERVER_JOIN,CREATE_ROOM,ADD_PLAYER,SEND_FULL_STATE,SERVER_UPDATE,SERVER_DEAL,VALIDATE_DECK,POP_FROM_DECK,CREATE_CARD_STATE,STORE_IN_STATE,SEND_CARD_DEALT,VALIDATE_ARRAY,PROCESS_CARDS,CHECK_STATUS,CHECK_NEW_CARD,REMOVE_CARD,REMOVE_FROM_DECK,MERGE_STATE,CHECK_LOCATION_FIELD,PRESERVE_LOCATION,UPDATE_LOCATION,CHECK_DISCARD,ENFORCE_FACEUP_SERVER,ADD_TO_DISCARD,REMOVE_FROM_DISCARD,UPDATE_CARD_STATE,SERVER_SHUFFLE,COLLECT_CARD_DATA,REMOVE_FROM_STATE,CHECK_DECK_SIZE,CHECK_ORIGINAL,ADD_TO_DECK,TRUNCATE_CARDS,SHUFFLE_DECK_DATA,ENSURE_SIZE,SERVER_SERIALIZE,ENFORCE_DISCARD_FACEUP,CONVERT_MAPS,SERVER_DECK,SERVER_JOIN_AGAIN,SEND_ROOM_JOINED,CLEAR_SERVER_CARDS,SEND_ERROR_STATE server
    class DISCARD_AREA,ENFORCE_FACEUP,POSITION_OVER_AREA,ADD_TO_DISCARD,CHECK_LOCATION_RECEIVE,POSITION_DISCARD_RECEIVE,ENFORCE_FACEUP_CLIENT,COLLECT_CARDS,SEND_SHUFFLE,UPDATE_DISCARD_COUNT,COUNT_DISCARD,SHOW_DISCARD_COUNT discard
    class SET_PRIVATE,BROADCAST_PRIVATE,UPDATE_PRIVATE_COUNT,COUNT_BY_PRIVATE,SHOW_COUNTS,UPDATE_PRIVATE_DISPLAY,CLIENT_HANDLE_DEALT private
    class CLIENT_RECEIVE,CLIENT_RECEIVE_STATE,CLIENT_RECEIVE_DEALT,APPLY_POSITION,APPLY_FLIP,UPDATE_UI,CLIENT_DECK_UPDATE,CLIENT_APPLY_FULL,CLIENT_REMOVE_CARDS,POSITION_ALL_DISCARD,OTHER_CLIENTS,LOAD_LOCAL,CLEAR_BOARD,LOAD_DECK,PROCESS_CARDS,SET_ORIGINAL_SIZE,REQUEST_FULL,SEND_FULL_STATE_RESPONSE,UPDATE_PRIVATE_HAND uiUpdate
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
- **Array Validation**: Server validates `cardStates` is always an array before processing
- **New Card Detection**: Server detects if card is new (not in `cards` Map) and removes it from `deckData.cards` if card data provided
- **Location Preservation**: Server preserves existing `location` if not explicitly provided in updates
- **State Reconciliation**: Server maintains `discardPile` array of uniqueIds and `cards` Map (uniqueId → CardState)
- **Face-Up Enforcement**: Server enforces `isFlipped=false` when `location='discardPile'` is set
- **Discard Pile Tracking**: Server updates `discardPile` array when `location` field is explicitly provided
- **Full State Sync**: `serializeGameState` enforces face-up for all discard pile cards and converts Maps to objects before sending

### 🎯 **Card State Updates**
- **Explicit Location**: All client updates include `location` property (discardPile or table)
- **Top-Left Coordinates**: Positions sent as top-left relative to table (prevents post-drop drift)
- **Z-Index Management**: Dragged cards always get highest z-index (10000+)
- **Private Zone Detection**: Cards dropped in private zone get `privateTo` attribute set

### 🎴 **Server-Dealt Cards Flow**
- **Deal Request**: Client sends `dealCard` request to server (server is authoritative)
- **Server Processing**: Server pops card from `deckData.cards`, creates card state with `privateTo=playerId`, stores in `cards` Map
- **Client Notification**: Server sends `cardDealt` message to requesting player only
- **Broadcast**: Server broadcasts `deckChange` (reduced deck) and `cardState` (excludes requester) to all players
- **Client Handling**: Client receives `cardDealt`, creates card element, positions in private zone
- **Other Clients**: Receive `cardState` with `privateTo`, card is hidden from them (visibility controlled by `privateTo`)

### 🔄 **Event Flow Patterns**
1. **Connection**: User Action → Connection Check → Action Allowed/Blocked → Update → Broadcast → Server Processing → Broadcast to All → UI Update
2. **Deal Card**: Click Deck → Send `dealCard` request → Server pops from deck → Server creates card state → Server sends `cardDealt` to requester → Server broadcasts `deckChange` + `cardState` to all
3. **Card State Update**: Client action → Send `updateCardState` with array → Server validates array → Server processes each card (new card detection, location updates, deck removal) → Server broadcasts to all
4. **Discard**: Drop in Area → Position Over Area → Enforce Face-Up → Broadcast `location='discardPile'` → Server Updates State → Server Updates discardPile array → Broadcast to All
5. **Drag Out**: Drag from Discard → Calculate Position → Broadcast `location='table'` → Server Removes from discardPile array → Server Updates State → Broadcast to All
6. **Right-Click**: Right-Click Card → `addCardToDiscardPile` → Same flow as drag-drop discard
7. **Shuffle Discard**: Click Shuffle → Collect uniqueIds → Send `shuffleDiscardPile` → Server collects card data → Server removes from state → Server adds to deck (size limits) → Server shuffles → Server broadcasts `deckChange` + card removals

### 🎨 **UI State Management**
- **Private Hand Display**: Counts cards by `privateTo` attribute from DOM
- **Discard Pile Counter**: Counts cards whose center lies within `discard-pile-area` bounds
- **Connection Status**: Displays in both menu and on-board overlay
- **Player Aliases**: Uses aliases for display, playerId for state tracking

### ✅ **Key Improvements**
- **Server-Authoritative Dealing**: Server pops cards from deck, creates card state, ensures deck consistency across all clients
- **New Card Detection**: Server detects new cards (not in state) and automatically removes them from deck during `updateCardState`
- **Array-Based Updates**: All card state updates use arrays (even single cards), ensuring consistent batch processing
- **Location Preservation**: Server preserves existing `location` if not explicitly provided in updates, preventing accidental location changes
- **Deck Size Management**: Server enforces `originalDeckSize` limits when shuffling discard pile back to deck
- **Area-Based Discard**: No container reparenting - cards stay on table with absolute positioning
- **Connection Blocking**: Prevents state loss by blocking actions when disconnected
- **Location Tracking**: Explicit `location` property ensures accurate state synchronization
- **Face-Up Enforcement**: Consistent enforcement at client broadcast, server update, and state serialization
- **Z-Index Management**: Dragged cards always visible above all other elements
- **Position Accuracy**: Top-left coordinates prevent visual drift on drop
