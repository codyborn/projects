class SublimeFlash {
    constructor() {
        this.words = [];
        this.isPlaying = false;
        this.currentIndex = 0;
        this.flashInterval = null;
        this.colorInterval = null;
        
        // DOM elements
        this.elements = {
            wordList: document.getElementById('word-list'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            importBtn: document.getElementById('import-btn'),
            exportBtn: document.getElementById('export-btn'),
            importFile: document.getElementById('import-file'),
            flashText: document.getElementById('flash-text'),
            speedInput: document.getElementById('speed'),
        };

        this.initializeEventListeners();
        this.loadSavedWords();
        this.startColorCycle();
    }

    initializeEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startFlashing());
        this.elements.stopBtn.addEventListener('click', () => this.stopFlashing());
        this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.exportBtn.addEventListener('click', () => this.exportWords());
        this.elements.importFile.addEventListener('change', (e) => this.importWords(e));
        this.elements.wordList.addEventListener('input', () => this.saveWords());
        this.elements.speedInput.addEventListener('input', () => this.saveSpeed());
    }

    async loadSavedWords() {
        const saved = localStorage.getItem('sublimeWords');
        const savedSpeed = localStorage.getItem('sublimeSpeed');
        
        // Load saved speed if it exists
        if (savedSpeed) {
            this.elements.speedInput.value = savedSpeed;
        }

        if (saved) {
            this.elements.wordList.value = saved;
        } else {
            // Load example.json by default
            try {
                const response = await fetch('example.json');
                const data = await response.json();
                this.elements.wordList.value = data.words.join('\n');
                this.saveWords();
            } catch (error) {
                console.error('Error loading example.json:', error);
            }
        }
    }

    saveWords() {
        localStorage.setItem('sublimeWords', this.elements.wordList.value);
    }

    saveSpeed() {
        localStorage.setItem('sublimeSpeed', this.elements.speedInput.value);
    }

    startFlashing() {
        this.words = this.elements.wordList.value.split('\n').filter(word => word.trim());
        if (this.words.length === 0) return;

        this.isPlaying = true;
        this.currentIndex = 0;
        this.elements.startBtn.disabled = true;
        this.elements.stopBtn.disabled = false;

        const speed = parseInt(this.elements.speedInput.value);
        this.flashInterval = setInterval(() => {
            this.elements.flashText.textContent = this.words[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.words.length;
        }, speed);
        this.toggleControls();
    }

    stopFlashing() {
        this.isPlaying = false;
        clearInterval(this.flashInterval);
        this.elements.flashText.textContent = '';
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.toggleControls();
    }

    startColorCycle() {
        const colors = [
            '#FFE5E5', '#E5FFE5', '#E5E5FF',
            '#FFE5FF', '#E5FFFF', '#FFFFE5'
        ];
        let colorIndex = 0;

        this.colorInterval = setInterval(() => {
            document.body.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        }, 5000);
    }

    exportWords() {
        const words = this.elements.wordList.value.split('\n').filter(word => word.trim());
        const data = { words };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sublime-words.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importWords(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data.words)) {
                    this.elements.wordList.value = data.words.join('\n');
                    this.saveWords();
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Invalid JSON file format');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    toggleControls() {
        const controls = document.querySelector('.controls');
        controls.classList.toggle('collapsed');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SublimeFlash();
}); 