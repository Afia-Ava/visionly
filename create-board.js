document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const boardGrid = document.getElementById('board-grid');
  const fileUpload = document.getElementById('file-upload');
  const imageSearch = document.getElementById('image-search');
  const searchBtn = document.getElementById('search-btn');
  const boardNotes = document.getElementById('board-notes');
  const saveBoard = document.getElementById('save-board');

  // Handle File Upload
  fileUpload.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          addImageToBoard(e.target.result);
        };
        
        reader.readAsDataURL(file);
      }
    });
  });

  // Add Image to Board
  function addImageToBoard(src) {
    const boardItem = document.createElement('div');
    boardItem.className = 'board-item';
    boardItem.draggable = true;
    
    const img = document.createElement('img');
    img.src = src;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      boardItem.remove();
    };
    
    boardItem.appendChild(img);
    boardItem.appendChild(deleteBtn);
    boardGrid.appendChild(boardItem);
    
    setupDragAndDrop(boardItem);
  }

  // Add Note to Board
  function addNoteToBoard(text) {
    const boardItem = document.createElement('div');
    boardItem.className = 'board-item';
    boardItem.draggable = true;
    
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      boardItem.remove();
    };
    
    boardItem.appendChild(note);
    boardItem.appendChild(deleteBtn);
    boardGrid.appendChild(boardItem);
    
    setupDragAndDrop(boardItem);
  }

  // Handle Notes Addition
  boardNotes.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = boardNotes.value.trim();
      if (text) {
        addNoteToBoard(text);
        boardNotes.value = '';
      }
    }
  });

  // Drag and Drop Functionality
  function setupDragAndDrop(element) {
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', '');
      element.classList.add('dragging');
    });

    element.addEventListener('dragend', () => {
      element.classList.remove('dragging');
    });
  }

  boardGrid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(boardGrid, e.clientY);
    
    if (afterElement) {
      boardGrid.insertBefore(draggingItem, afterElement);
    } else {
      boardGrid.appendChild(draggingItem);
    }
  });

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.board-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Image Search (Placeholder - You'll need to implement API integration)
  searchBtn.addEventListener('click', () => {
    const query = imageSearch.value.trim();
    if (query) {
      // Here you would typically make an API call to Unsplash/Pexels
      // For now, we'll just show a message
      alert('Image search will be implemented with API integration');
    }
  });

  // Save Board (Placeholder)
  saveBoard.addEventListener('click', () => {
    const boardTitle = document.getElementById('board-title').value;
    const goalType = document.getElementById('goal-type').value;
    
    // Here you would typically save the board data to a backend
    // For now, we'll just show a success message
    alert('Board saved successfully! (Demo)');
  });
}); 