import UnsplashAuth from './unsplash-auth.js';
import UNSPLASH_CONFIG from './unsplash-config.js';

// DOM Elements
const searchInput = document.getElementById('image-search');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const boardGrid = document.getElementById('board-grid');

// Initialize elements check
if (!searchInput || !searchButton || !searchResults || !boardGrid) {
    console.error('Required DOM elements not found:', {
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        searchResults: !!searchResults,
        boardGrid: !!boardGrid
    });
}

// Loading spinner
const showLoading = () => {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner active';
    spinner.innerHTML = '<div class="spinner"></div>';
    searchResults.appendChild(spinner);
};

const hideLoading = () => {
    const spinner = searchResults.querySelector('.loading-spinner');
    if (spinner) spinner.remove();
};

// Search images from Unsplash
async function searchImages(query) {
    try {
        console.log('Searching for:', query);
        showLoading();
        
        const headers = {
            'Authorization': `Client-ID ${UNSPLASH_CONFIG.ACCESS_KEY}`
        };
        
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20`,
            { headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch images: ${response.status}`);
        }
        
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error('Error searching images:', error);
        searchResults.innerHTML = `<p class="error">Failed to load images: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Display search results
function displaySearchResults(images) {
    searchResults.innerHTML = '';
    
    if (!images.length) {
        searchResults.innerHTML = '<p class="no-results">No images found. Try a different search term.</p>';
        return;
    }
    
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'search-results-grid';
    
    images.forEach(image => {
        const imageItem = document.createElement('div');
        imageItem.className = 'search-result-item';
        
        imageItem.innerHTML = `
            <img src="${image.urls.small}" alt="${image.alt_description || 'Vision board image'}" />
            <div class="select-overlay">
                <span>Add to Board</span>
            </div>
            <div class="image-credit">
                Photo by <a href="${image.user.links.html}" target="_blank" rel="noopener">${image.user.name}</a> on Unsplash
            </div>
        `;

        imageItem.addEventListener('click', () => {
            addToBoard(image);
        });

        resultsGrid.appendChild(imageItem);
    });

    searchResults.appendChild(resultsGrid);
}

// Add image directly to board
function addToBoard(image) {
    const boardItem = document.createElement('div');
    boardItem.className = 'board-item';
    boardItem.draggable = true;
    
    boardItem.innerHTML = `
        <img src="${image.urls.regular}" alt="${image.alt_description || 'Vision board image'}" />
        <button class="delete-btn" title="Remove from board">×</button>
        <div class="image-credit">
            Photo by <a href="${image.user.links.html}" target="_blank" rel="noopener">${image.user.name}</a>
        </div>
    `;

    // Add to board
    boardGrid.appendChild(boardItem);
    
    // Setup delete button
    const deleteBtn = boardItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        boardItem.remove();
    });

    // Setup drag and drop
    setupDragAndDrop(boardItem);

    // Show feedback
    const feedback = document.createElement('div');
    feedback.className = 'add-feedback';
    feedback.textContent = 'Added to board!';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
}

// Drag and Drop functionality
function setupDragAndDrop(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
}

// Make sure boardGrid has the necessary event listeners (only add once)
if (!boardGrid.hasDropListener) {
    boardGrid.addEventListener('dragover', handleDragOver);
    boardGrid.addEventListener('drop', handleDrop);
    boardGrid.addEventListener('dragenter', handleDragEnter);
    boardGrid.addEventListener('dragleave', handleDragLeave);
    boardGrid.hasDropListener = true;
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.board-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragEnter(e) {
    e.preventDefault();
    e.target.closest('.board-grid')?.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    if (!e.relatedTarget?.closest('.board-grid')) {
        e.target.closest('.board-grid')?.classList.remove('drag-over');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const boardGrid = e.target.closest('.board-grid');
    boardGrid?.classList.remove('drag-over');

    const draggingItem = document.querySelector('.dragging');
    if (!draggingItem) return;

    // Reordering within the board
    const dropPosition = e.clientY;
    const items = [...boardGrid.querySelectorAll('.board-item:not(.dragging)')];
    
    const insertAfter = items.reduce((closest, item) => {
        const box = item.getBoundingClientRect();
        const offset = dropPosition - (box.top + box.height / 2);
        
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: item };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;

    if (insertAfter) {
        insertAfter.parentNode.insertBefore(draggingItem, insertAfter.nextSibling);
    } else {
        boardGrid?.prepend(draggingItem);
    }
}

const style = document.createElement('style');
style.textContent = `
    .search-results {
        padding: 0;
        margin: 0;
        width: 100%;
        background: transparent;
        height: auto;
        overflow-y: auto;
        box-sizing: border-box;
    }

    .search-results-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 0;
        width: calc(100% - 12px);
        margin: 0;
        background: transparent;
    }

    .image-search-container {
        background: transparent;
        padding: 0;
        margin: 0 0 0 20px;
        width: 85%;
        position: relative;
    }

    .search-result-item {
        aspect-ratio: 1/1;
        width: 100%;
        margin: 0;
        height: auto;
    }

    .search-result-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .divider {
        margin: 10px 0;
        width: 100%;
    }

    .board-item.dragging {
        opacity: 0.5;
        cursor: move;
    }

    .board-grid.drag-over {
        background: rgba(136, 84, 208, 0.1);
        border: 2px dashed #8854d0;
    }

    .board-item {
        transition: transform 0.2s ease;
    }

    .board-item:hover {
        transform: scale(1.02);
    }

    .add-feedback {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #8854d0;
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        animation: fadeInOut 2s ease-in-out;
        z-index: 1000;
    }

    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 20px); }
        20% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);


// Event Listeners
searchButton?.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchImages(query);
    }
});

searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchImages(query);
        }
    }
});

// Initialize search input with placeholder text
const placeholders = [
    'Search for inspiration...',
    'Try "success" or "motivation"',
    'Search "nature" or "urban"',
    'Look for "business" or "tech"'
];
let currentPlaceholder = 0;

function rotatePlaceholder() {
    if (searchInput) {
        searchInput.setAttribute('placeholder', placeholders[currentPlaceholder]);
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
    }
}

rotatePlaceholder();
setInterval(rotatePlaceholder, 3000);

// Log initialization
console.log('Image search initialized with config:', {
    accessKey: UNSPLASH_CONFIG.ACCESS_KEY ? 'Present' : 'Missing',
    elements: {
        searchInput: !!searchInput,
        searchButton: !!searchButton,
        searchResults: !!searchResults
    }
});