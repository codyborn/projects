#!/usr/bin/env node

/**
 * Discard Pile Functionality Test
 * Tests the discard pile features implemented according to DISCARD_PILE_SPECIFICATION.md
 */

const { JSDOM } = require('jsdom');

// Mock DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
    <title>Discard Pile Test</title>
</head>
<body>
    <div id="card-table">
        <div id="discard-pile-area" class="discard-pile-area">
            <div class="discard-pile-container">
                <div class="discard-pile-label">Discard</div>
                <div class="discard-pile-content"></div>
            </div>
            <div class="discard-pile-counter">
                <span id="discard-pile-count">0</span>
                <button id="shuffle-discard-btn" class="shuffle-btn" title="Shuffle discard pile back to deck">🔄</button>
            </div>
        </div>
        <div id="private-hand-area" class="private-hand-area">
            <div id="private-hand-zone" class="private-hand-zone"></div>
        </div>
    </div>
</body>
</html>
`, {
    url: 'http://localhost:8002',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock console for testing
const originalConsole = console;
global.console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {}
};

// Load the game modules
require('./src/shared/cards.js');
require('./src/shared/StandardDeck.js');
require('./src/shared/VirusDeck.js');

// Mock WebSocket for testing
class MockWebSocket {
    constructor() {
        this.readyState = 1; // OPEN
        this.connectionStatus = 'connected';
        this.playerId = 'test_player';
        this.playerAlias = 'test_player';
        this.connectedPlayers = new Set(['test_player']);
    }
    
    send() {}
    close() {}
}

// Load the main game
const CardGame = require('./src/client/app.js').CardGame;

console.log('🧪 Starting Discard Pile Functionality Test\n');

async function runDiscardPileTests() {
    let testResults = [];
    
    try {
        // Initialize game
        const game = new CardGame();
        game.multiplayer = new MockWebSocket();
        
        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('📋 Test 1: Discard Pile Initialization');
        const discardPileArea = document.getElementById('discard-pile-area');
        const discardPileContent = document.querySelector('.discard-pile-content');
        const discardPileCount = document.getElementById('discard-pile-count');
        const shuffleBtn = document.getElementById('shuffle-discard-btn');
        
        const initTest = {
            areaExists: !!discardPileArea,
            contentExists: !!discardPileContent,
            counterExists: !!discardPileCount,
            shuffleBtnExists: !!shuffleBtn,
            initialCount: discardPileCount?.textContent === '0'
        };
        
        const initPassed = Object.values(initTest).every(Boolean);
        console.log(`  ${initPassed ? '✅' : '❌'} Discard Pile Initialization: ${JSON.stringify(initTest)}`);
        testResults.push({ name: 'Discard Pile Initialization', passed: initPassed, details: initTest });
        
        console.log('\n📋 Test 2: Right-Click to Discard');
        // Deal a card to private hand
        game.dealCardToPosition(100, 100);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const cards = document.querySelectorAll('.card');
        const card = cards[0];
        const initialCardCount = cards.length;
        
        // Simulate right-click
        const rightClickEvent = new dom.window.MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100
        });
        
        card.dispatchEvent(rightClickEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const cardsAfterRightClick = document.querySelectorAll('.card');
        const discardPileCards = document.querySelectorAll('.discard-pile-content .card');
        const discardCount = document.getElementById('discard-pile-count').textContent;
        
        const rightClickTest = {
            cardMoved: cardsAfterRightClick.length === initialCardCount,
            cardInDiscardPile: discardPileCards.length === 1,
            counterUpdated: discardCount === '1',
            cardRemovedFromOriginalPosition: !card.parentNode || card.parentNode.classList.contains('discard-pile-content')
        };
        
        const rightClickPassed = Object.values(rightClickTest).every(Boolean);
        console.log(`  ${rightClickPassed ? '✅' : '❌'} Right-Click to Discard: ${JSON.stringify(rightClickTest)}`);
        testResults.push({ name: 'Right-Click to Discard', passed: rightClickPassed, details: rightClickTest });
        
        console.log('\n📋 Test 3: Shuffle Discard Pile Back to Deck');
        const initialDeckCount = game.getDeckCount();
        
        // Simulate shuffle button click
        const shuffleEvent = new dom.window.MouseEvent('click', {
            bubbles: true,
            cancelable: true
        });
        
        shuffleBtn.dispatchEvent(shuffleEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const finalDeckCount = game.getDeckCount();
        const discardCountAfterShuffle = document.getElementById('discard-pile-count').textContent;
        const cardsAfterShuffle = document.querySelectorAll('.card');
        
        const shuffleTest = {
            deckCountIncreased: finalDeckCount > initialDeckCount,
            discardPileEmpty: discardCountAfterShuffle === '0',
            cardRemovedFromDiscardPile: document.querySelectorAll('.discard-pile-content .card').length === 0,
            totalCardsConsistent: cardsAfterShuffle.length === initialCardCount
        };
        
        const shufflePassed = Object.values(shuffleTest).every(Boolean);
        console.log(`  ${shufflePassed ? '✅' : '❌'} Shuffle Discard Pile: ${JSON.stringify(shuffleTest)}`);
        testResults.push({ name: 'Shuffle Discard Pile', passed: shufflePassed, details: shuffleTest });
        
        console.log('\n📋 Test 4: Multi-Card Selection');
        // Deal multiple cards to main table
        game.dealCardToPosition(200, 200);
        game.dealCardToPosition(250, 250);
        game.dealCardToPosition(300, 300);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const tableCards = document.querySelectorAll('.card');
        const initialSelectionState = {
            isSelecting: game.isSelecting,
            selectedCards: game.selectedCards.size,
            selectionBox: !!game.selectionBox
        };
        
        // Simulate mousedown on table for multi-card selection
        const mousedownEvent = new dom.window.MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: 150,
            clientY: 150,
            target: document.getElementById('card-table')
        });
        
        document.getElementById('card-table').dispatchEvent(mousedownEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const afterMousedownState = {
            isSelecting: game.isSelecting,
            selectionBoxCreated: !!game.selectionBox
        };
        
        // Simulate mousemove to create selection box
        const mousemoveEvent = new dom.window.MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 350,
            clientY: 350
        });
        
        document.dispatchEvent(mousemoveEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const afterMousemoveState = {
            isSelecting: game.isSelecting,
            selectionBoxVisible: !!game.selectionBox && game.selectionBox.style.display !== 'none'
        };
        
        // Simulate mouseup to finish selection
        const mouseupEvent = new dom.window.MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: 350,
            clientY: 350
        });
        
        document.dispatchEvent(mouseupEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const finalSelectionState = {
            isSelecting: game.isSelecting,
            selectedCards: game.selectedCards.size,
            selectionBoxCleaned: !game.selectionBox || game.selectionBox.style.display === 'none'
        };
        
        const multiSelectionTest = {
            ...initialSelectionState,
            ...afterMousedownState,
            ...afterMousemoveState,
            ...finalSelectionState
        };
        
        const multiSelectionPassed = multiSelectionTest.isSelecting === false && 
                                   multiSelectionTest.selectionBoxCreated === true &&
                                   multiSelectionTest.selectionBoxVisible === true &&
                                   multiSelectionTest.selectionBoxCleaned === true;
        
        console.log(`  ${multiSelectionPassed ? '✅' : '❌'} Multi-Card Selection: ${JSON.stringify(multiSelectionTest)}`);
        testResults.push({ name: 'Multi-Card Selection', passed: multiSelectionPassed, details: multiSelectionTest });
        
        console.log('\n📋 Test 5: Card Counting Logic');
        // Test the card counting logic
        const privateHandZone = document.getElementById('private-hand-zone');
        const allCards = document.querySelectorAll('.card');
        
        let cardsInPrivateZone = 0;
        allCards.forEach(card => {
            const privateTo = card.dataset.privateTo;
            if (privateTo && privateTo !== 'null' && privateTo !== 'undefined') {
                const cardRect = card.getBoundingClientRect();
                const zoneRect = privateHandZone.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const cardCenterY = cardRect.top + cardRect.height / 2;
                
                const isInPrivateZone = cardCenterX >= zoneRect.left && 
                                      cardCenterX <= zoneRect.right && 
                                      cardCenterY >= zoneRect.top && 
                                      cardCenterY <= zoneRect.bottom;
                
                if (isInPrivateZone) {
                    cardsInPrivateZone++;
                }
            }
        });
        
        const countingTest = {
            totalCards: allCards.length,
            cardsInPrivateZone: cardsInPrivateZone,
            privateHandCount: document.getElementById('your-hand-count')?.textContent || '0',
            countingLogicWorking: cardsInPrivateZone === parseInt(document.getElementById('your-hand-count')?.textContent || '0')
        };
        
        const countingPassed = countingTest.countingLogicWorking;
        console.log(`  ${countingPassed ? '✅' : '❌'} Card Counting Logic: ${JSON.stringify(countingTest)}`);
        testResults.push({ name: 'Card Counting Logic', passed: countingPassed, details: countingTest });
        
    } catch (error) {
        console.log(`❌ Test Error: ${error.message}`);
        console.log(error.stack);
        testResults.push({ name: 'Test Execution', passed: false, details: { error: error.message } });
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passedTests = testResults.filter(test => test.passed);
    const failedTests = testResults.filter(test => !test.passed);
    
    testResults.forEach(test => {
        console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
        if (!test.passed && test.details) {
            console.log(`   Details: ${JSON.stringify(test.details)}`);
        }
    });
    
    console.log(`\n🎯 Overall: ${passedTests.length}/${testResults.length} tests passed`);
    
    if (failedTests.length > 0) {
        console.log('⚠️  Some tests failed. Check the details above.');
    } else {
        console.log('🎉 All tests passed!');
    }
    
    return testResults;
}

// Run the tests
runDiscardPileTests().then(results => {
    const exitCode = results.every(test => test.passed) ? 0 : 1;
    process.exit(exitCode);
}).catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
