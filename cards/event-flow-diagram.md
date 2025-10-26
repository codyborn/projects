# Card Game Event State Management & UI Updates Flow

```mermaid
graph TD
    %% User Interactions
    A[User Drags Card] --> B{Card Dropped in Private Zone?}
    C[User Clicks Card] --> D[Flip Card Animation]
    E[User Draws Card] --> F[Create New Card Element]
    AA[User Changes Deck] --> BB[Load New Deck]
    AAA[User Changes Name] --> BBB[Update playerAlias]
    
    %% Local State Updates
    B -->|Yes| G[Set privateTo = playerId]
    B -->|No| H[Delete privateTo attribute]
    D --> I[Toggle flipped class]
    F --> J[Set instanceId from deck]
    BB --> CC[Set currentDeckId]
    BBB --> CCC[Store in localStorage]
    
    %% Broadcast Events
    G --> K[Broadcast cardState with privateTo]
    H --> L[Broadcast cardState without privateTo]
    I --> M[Broadcast cardState with isFlipped]
    J --> N[Broadcast cardState for new card]
    CC --> O[Broadcast deckChange with deckData]
    CCC --> OOO[Broadcast playerAliasUpdate]
    
    %% Remote State Updates
    K --> P[Remote: handleCardState]
    L --> P
    M --> P
    N --> P
    O --> Q[Remote: handleDeckChange]
    OOO --> QQQ[Remote: handlePlayerAliasUpdate]
    
    %% Remote Card Processing
    P --> R{Find existing card by instanceId?}
    R -->|Yes| S[Update existing card element]
    R -->|No| T[Create new card element]
    
    %% Remote Deck Processing
    Q --> U[Clear board]
    U --> V[Load remote deck]
    V --> W[Show remote deck notification]
    
    %% Player Alias Processing
    QQQ --> QQQQ[Update playerAliases Map]
    QQQQ --> QQQQQ[Update private hand display]
    
    %% State Application
    S --> X[Apply position, flipped, privateTo]
    T --> X
    X --> Y[Set visibility based on privateTo]
    Y --> Z[Update card dataset attributes]
    
    %% UI Updates
    Z --> AA[updatePrivateHandDisplay]
    AA --> BB[Count cards by privateTo attribute]
    BB --> CC[Update your hand count]
    BB --> DD[Update other players counts]
    
    %% Display Logic
    CC --> EE[Show count in UI]
    DD --> FF[Show other player counts with aliases]
    
    %% Player Management
    GG[Player Joins Room] --> HH[Send playerId + playerAlias]
    HH --> II[Server stores both ID and alias]
    II --> JJ[Server sends playerList to new player]
    II --> KK[Server broadcasts playerList to all]
    
    %% Player List Updates
    LL[Player Changes Alias] --> MM[Broadcast playerAliasUpdate]
    MM --> NN[Server broadcasts playerList to all]
    OO[Player Leaves Room] --> PP[Server broadcasts playerList to remaining]
    
    %% State Validation
    QQ[Periodic State Validation] --> RR[Generate state hash]
    RR --> SS[Compare with other players]
    SS -->|Mismatch| TT[Request state correction]
    SS -->|Match| UU[Continue normal operation]
    
    %% Sync on Join (Unified deckChange)
    VV[New Player Joins] --> WW[Host sends deckChange]
    WW --> XX[Host broadcasts all card states]
    XX --> YY[New player: handleDeckChange]
    YY --> ZZ[Clear board + load remote deck]
    ZZ --> AAA[New player receives all cards]
    
    %% Deck Architecture
    BBB[StandardDeck extends Deck] --> CCC[52-card playing deck]
    DDD[VirusDeck extends Deck] --> EEE[Virus game deck]
    FFF[Deck base class] --> GGG[Custom decks from data]
    
    %% Player Identity System
    HHH[Fixed playerId] --> III[Used for game state]
    JJJ[Changeable playerAlias] --> KKK[Used for display]
    LLL[localStorage persistence] --> MMM[Both ID and alias stored]
    
    %% Styling
    classDef userAction fill:#e1f5fe
    classDef localUpdate fill:#f3e5f5
    classDef broadcast fill:#fff3e0
    classDef remoteUpdate fill:#e8f5e8
    classDef uiUpdate fill:#fce4ec
    classDef validation fill:#fff8e1
    classDef deckSync fill:#e3f2fd
    classDef architecture fill:#f1f8e9
    classDef playerMgmt fill:#e8eaf6
    classDef identity fill:#f1f8e9
    
    class A,C,E,AA,AAA userAction
    class B,G,H,I,J,CC,BBB,CCC localUpdate
    class K,L,M,N,O,OOO broadcast
    class P,Q,R,S,T,U,V,W,X,Y,Z,QQQ,QQQQ,QQQQQ remoteUpdate
    class AA,BB,CC,DD,EE,FF,QQQQQ uiUpdate
    class QQ,RR,SS,TT,UU,VV,WW,XX,YY,ZZ,AAA validation
    class O,U,V,W,WW,XX,YY,ZZ deckSync
    class BBB,CCC,DDD,EEE,FFF,GGG architecture
    class GG,HH,II,JJ,KK,LL,MM,NN,OO,PP playerMgmt
    class HHH,III,JJJ,KKK,LLL,MMM identity
```

## Key Features:

### 🎯 **Single Source of Truth**
- All card state stored in `data-*` attributes on DOM elements
- No redundant data structures (removed `privateHands` Map)
- State derived directly from DOM queries

### 🔄 **Unified Event Flow**
1. **User Action** → **Local State Update** → **Broadcast** → **Remote Processing** → **UI Update**
2. **Single Message Type**: `deckChange` handles both deck changes and new player sync
3. **Consistent State**: All players see the same card states

### 🎨 **UI Updates**
- **Private Hand Display**: Counts cards by `privateTo` attribute
- **Visibility**: Cards hidden based on `privateTo` field
- **Real-time**: Updates triggered by every card state change
- **Player Names**: Shows player aliases instead of IDs in UI

### 🔒 **Private Hand Logic**
- **Local**: Set `privateTo = playerId` when dropped in private zone
- **Remote**: Hide card if `privateTo !== currentPlayerId`
- **Display**: Count cards where `privateTo === currentPlayerId`

### 👥 **Player Identity System**
- **Fixed playerId**: Unique identifier for game state (never changes)
- **Changeable playerAlias**: Display name that can be updated anytime
- **Game State Integrity**: All cards, private hands use fixed `playerId`
- **Display Names**: UI shows `playerAlias` for better user experience
- **localStorage**: Both ID and alias persisted between sessions

### 🔄 **Automatic Player List Management**
- **Player Joins**: Server automatically sends player list to new player
- **Alias Changes**: Server broadcasts updated player list to all players
- **Player Leaves**: Server sends updated list to remaining players
- **No Requests**: Eliminated `requestPlayerList` - lists sent automatically
- **Real-time Sync**: All players always have current player information

### 🃏 **Deck Architecture**
- **Base Deck Class**: Handles custom decks from data
- **StandardDeck**: Extends Deck for 52-card playing deck
- **VirusDeck**: Extends Deck for virus game deck
- **Common Methods**: All deck types share shuffle, deal, exportToJSON, etc.

### 🔄 **Deck Synchronization**
- **Host Changes Deck**: Broadcasts `deckChange` with `deckData`
- **New Player Joins**: Host sends `deckChange` to sync them
- **Remote Processing**: Clear board → Load remote deck → Show notification
- **Perfect Sync**: All players have identical deck state

### ✅ **No Redundancy**
- Removed `privateHands` Map
- Removed `addCardToPrivateHand`/`removeCardFromPrivateHand` functions
- Removed `privateHandUpdate` messages
- Removed `syncDeckData` (consolidated with `deckChange`)
- Removed `requestPlayerList` (automatic player list sending)
- Single `updatePrivateHandDisplay()` method handles all counting
- Single `deckChange` message handles all deck synchronization
- Automatic player list management eliminates manual requests
