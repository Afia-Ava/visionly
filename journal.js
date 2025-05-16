// Journal entry class
class JournalEntry {
    constructor(id, title, content, date, mood, isShared = false) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.date = date;
        this.mood = mood;
        this.isShared = isShared;
    }
}

// Journal manager class
class JournalManager {
    constructor() {
        this.entries = this.loadEntries();
        this.currentEntry = null;
        this.autoSaveTimeout = null;
        this.setupEventListeners();
        this.setupCalendar();
        this.prompts = [
            "What did you visualize today?",
            "What's one small step you took toward your goal?",
            "Where do you see yourself in 5 years?",
            "What are you most grateful for today?",
            "What's your biggest dream and why?",
            "What's holding you back and how can you overcome it?",
            "What inspired you today?",
            "What's one thing you'd like to improve about yourself?",
            "Describe your perfect day",
            "What makes you feel most alive?"
        ];
    }

    // Load entries from localStorage
    loadEntries() {
        const savedEntries = localStorage.getItem('journalEntries');
        return savedEntries ? JSON.parse(savedEntries) : [];
    }

    // Save entries to localStorage
    saveEntries() {
        localStorage.setItem('journalEntries', JSON.stringify(this.entries));
    }

    // Setup event listeners
    setupEventListeners() {
        // New entry button
        document.getElementById('new-entry-btn').addEventListener('click', () => this.createNewEntry());

        // Auto-save on content change
        document.getElementById('entry-content').addEventListener('input', () => this.startAutoSave());
        document.getElementById('entry-title').addEventListener('input', () => this.startAutoSave());

        // Prompt button
        document.getElementById('prompt-btn').addEventListener('click', () => this.showRandomPrompt());
        document.getElementById('close-prompt').addEventListener('click', () => this.hidePrompt());

        // Delete button
        document.getElementById('delete-entry').addEventListener('click', () => this.deleteCurrentEntry());

        // Share toggle
        document.getElementById('share-entry').addEventListener('change', (e) => {
            if (this.currentEntry) {
                this.currentEntry.isShared = e.target.checked;
                this.saveEntries();
            }
        });

        // Mood selector
        document.getElementById('mood-selector').addEventListener('change', (e) => {
            if (this.currentEntry) {
                this.currentEntry.mood = e.target.value;
                this.saveEntries();
            }
        });
    }

    // Setup calendar
    setupCalendar() {
        const calendar = document.getElementById('journal-calendar');
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        // Create calendar header
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
        calendar.appendChild(header);

        // Create calendar grid
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        
        // Add day labels
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'calendar-day-label';
            dayLabel.textContent = day;
            grid.appendChild(dayLabel);
        });

        // Add date cells
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            cell.textContent = day;

            // Check if there's an entry for this day
            const dateStr = new Date(year, month, day).toISOString().split('T')[0];
            if (this.entries.some(entry => entry.date.split('T')[0] === dateStr)) {
                cell.classList.add('has-entry');
            }

            cell.addEventListener('click', () => this.showEntriesForDate(dateStr));
            grid.appendChild(cell);
        }

        calendar.appendChild(grid);
        this.updateEntriesList();
    }

    // Create new entry
    createNewEntry() {
        const id = Date.now().toString();
        const newEntry = new JournalEntry(
            id,
            '',
            '',
            new Date().toISOString(),
            '😊',
            false
        );

        this.entries.unshift(newEntry);
        this.currentEntry = newEntry;
        this.loadEntry(newEntry);
        this.saveEntries();
        this.updateEntriesList();
    }

    // Load entry into editor
    loadEntry(entry) {
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-content').value = entry.content;
        document.getElementById('mood-selector').value = entry.mood;
        document.getElementById('share-entry').checked = entry.isShared;
        document.getElementById('delete-entry').style.display = 'block';
        document.getElementById('current-date').textContent = new Date(entry.date).toLocaleDateString();
    }

    // Start auto-save timer
    startAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => this.saveCurrentEntry(), 1000);
    }

    // Save current entry
    saveCurrentEntry() {
        if (!this.currentEntry) return;

        const title = document.getElementById('entry-title').value;
        const content = document.getElementById('entry-content').value;

        this.currentEntry.title = title;
        this.currentEntry.content = content;

        this.saveEntries();
        this.updateSaveStatus('All changes saved');
        this.updateEntriesList();
    }

    // Update save status
    updateSaveStatus(message) {
        const statusElement = document.getElementById('save-status');
        statusElement.textContent = message;
        setTimeout(() => {
            statusElement.textContent = 'All changes saved';
        }, 2000);
    }

    // Show random prompt
    showRandomPrompt() {
        const promptContainer = document.querySelector('.prompt-container');
        const promptElement = document.getElementById('current-prompt');
        const randomPrompt = this.prompts[Math.floor(Math.random() * this.prompts.length)];
        
        promptElement.textContent = randomPrompt;
        promptContainer.style.display = 'block';
    }

    // Hide prompt
    hidePrompt() {
        document.querySelector('.prompt-container').style.display = 'none';
    }

    // Delete current entry
    deleteCurrentEntry() {
        if (!this.currentEntry) return;

        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== this.currentEntry.id);
            this.saveEntries();
            this.currentEntry = null;
            this.clearEditor();
            this.updateEntriesList();
        }
    }

    // Clear editor
    clearEditor() {
        document.getElementById('entry-title').value = '';
        document.getElementById('entry-content').value = '';
        document.getElementById('mood-selector').value = '😊';
        document.getElementById('share-entry').checked = false;
        document.getElementById('delete-entry').style.display = 'none';
        document.getElementById('current-date').textContent = '';
    }

    // Update entries list
    updateEntriesList() {
        const container = document.getElementById('entries-container');
        container.innerHTML = '';

        this.entries.forEach(entry => {
            const entryCard = document.createElement('div');
            entryCard.className = 'entry-card';
            entryCard.innerHTML = `
                <div class="entry-header">
                    <span class="entry-mood">${entry.mood}</span>
                    <span class="entry-date">${new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <div class="entry-title">${entry.title || 'Untitled'}</div>
                <div class="entry-preview">${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</div>
            `;

            entryCard.addEventListener('click', () => {
                this.currentEntry = entry;
                this.loadEntry(entry);
            });

            container.appendChild(entryCard);
        });
    }

    // Show entries for specific date
    showEntriesForDate(dateStr) {
        const dateEntries = this.entries.filter(entry => entry.date.split('T')[0] === dateStr);
        if (dateEntries.length > 0) {
            this.currentEntry = dateEntries[0];
            this.loadEntry(dateEntries[0]);
        }
    }
}

// Initialize the journal manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.journalManager = new JournalManager();
}); 