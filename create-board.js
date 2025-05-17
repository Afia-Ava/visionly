// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDs9_aRBzltPKNU3i8uZxoyaGiBZSoPb5s",
    authDomain: "visionly-webapp.firebaseapp.com",
    projectId: "visionly-webapp",
    storageBucket: "visionly-webapp.appspot.com",
    messagingSenderId: "708324469283",
    appId: "1:708324469283:web:5495341a010f8f04c51f96",
    measurementId: "G-JB5T2YBVEC"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    console.log('Firebase Auth:', !!auth);
    console.log('Firebase Storage:', !!storage);
    console.log('Firebase Firestore:', !!db);

    // DOM Elements
    const boardTitle = document.getElementById('board-title');
    const goalType = document.getElementById('goal-type');
    const fileUpload = document.getElementById('file-upload');
    const imageSearch = document.getElementById('image-search');
    const searchBtn = document.getElementById('search-btn');
    const boardNotes = document.getElementById('board-notes');
    const saveBoard = document.getElementById('save-board');
    const boardGrid = document.getElementById('board-grid');
    const uploadBtn = document.getElementById('upload-btn');

    // Track uploaded images and board items
    let boardItems = [];

    // Handle file uploads
    fileUpload.addEventListener('change', async (e) => {
        console.log('File upload triggered');
        
        // Check if Firebase is properly initialized
        if (!auth || !storage) {
            console.error('Firebase services not initialized');
            alert('Error: Service not available. Please try again later.');
            return;
        }

        const user = auth.currentUser;
        console.log('Current user:', user?.uid);
        
        if (!user) {
            alert('Please sign in to upload images');
            return;
        }

        const files = Array.from(e.target.files);
        console.log('Files selected:', files.length);

        if (files.length === 0) {
            console.log('No files selected');
            return;
        }

        const originalText = uploadBtn.innerHTML;

        for (const file of files) {
            console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            if (!file.type.startsWith('image/')) {
                console.log('Skipping non-image file:', file.name);
                continue;
            }

            try {
                // Create a storage reference with the full path
                const fileName = `${Date.now()}_${file.name}`;
                const filePath = `boards/${user.uid}/${fileName}`;
                console.log('Upload path:', filePath);

                // Create storage reference
                const fileRef = storage.ref().child(filePath);
                console.log('Storage reference created');

                // Create upload task
                const uploadTask = fileRef.put(file);
                console.log('Upload task created');

                // Monitor upload
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress for ${file.name}:`, progress);
                        uploadBtn.innerHTML = `<span>Uploading ${Math.round(progress)}%</span>`;
                    },
                    (error) => {
                        console.error('Upload error:', error);
                        alert(`Error uploading ${file.name}: ${error.message}`);
                        uploadBtn.innerHTML = originalText;
                    },
                    async () => {
                        try {
                            console.log('Upload completed, getting URL');
                            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                            console.log('Download URL:', downloadURL);
                            addImageToBoard(downloadURL);
                            uploadBtn.innerHTML = originalText;
                        } catch (urlError) {
                            console.error('Error getting download URL:', urlError);
                            alert(`Error processing ${file.name}. Please try again.`);
                            uploadBtn.innerHTML = originalText;
                        }
                    }
                );
            } catch (error) {
                console.error('Error processing file:', file.name, error);
                alert(`Error processing ${file.name}: ${error.message}`);
                uploadBtn.innerHTML = originalText;
            }
        }

        // Clear the input
        fileUpload.value = '';
    });

    // Add image to board grid
    function addImageToBoard(imageUrl) {
        const item = {
            type: 'image',
            content: imageUrl,
            position: boardItems.length
        };
        
        boardItems.push(item);
        
        const itemElement = document.createElement('div');
        itemElement.className = 'board-item';
        itemElement.draggable = true;
        itemElement.innerHTML = `
            <img src="${imageUrl}" alt="Board item">
            <button class="delete-item" onclick="deleteItem(${boardItems.length - 1})">×</button>
        `;
        
        boardGrid.appendChild(itemElement);
        setupDragAndDrop(itemElement);
    }

    // Delete item from board
    window.deleteItem = async function(index) {
        try {
            const item = boardItems[index];
            if (item.type === 'image') {
                // Extract the file path from the URL
                const url = new URL(item.content);
                const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
                
                // Delete from Storage
                try {
                    await storage.ref().child(path).delete();
                } catch (error) {
                    console.error('Error deleting from storage:', error);
                }
            }
            
            // Remove from boardItems array
            boardItems.splice(index, 1);
            
            // Update the display
            updateBoardDisplay();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item. Please try again.');
        }
    };

    // Update board display
    function updateBoardDisplay() {
        boardGrid.innerHTML = '';
        boardItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'board-item';
            itemElement.draggable = true;
            
            if (item.type === 'image') {
                itemElement.innerHTML = `
                    <img src="${item.content}" alt="Board item">
                    <button class="delete-item" onclick="deleteItem(${index})">×</button>
                `;
            } else if (item.type === 'text') {
                itemElement.innerHTML = `
                    <p>${item.content}</p>
                    <button class="delete-item" onclick="deleteItem(${index})">×</button>
                `;
            }
            
            boardGrid.appendChild(itemElement);
            setupDragAndDrop(itemElement);
        });
    }

    // Setup drag and drop
    function setupDragAndDrop(element) {
        element.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
        });
        
        element.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    }

    boardGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        const afterElement = getDragAfterElement(boardGrid, e.clientY);
        
        if (afterElement) {
            boardGrid.insertBefore(draggable, afterElement);
        } else {
            boardGrid.appendChild(draggable);
        }
    });

    // Save board
    saveBoard.addEventListener('click', async () => {
        const user = auth.currentUser;
        
        if (!user) {
            alert('Please sign in to save your board');
            return;
        }
        
        if (!boardTitle.value.trim()) {
            alert('Please enter a board title');
            return;
        }
        
        try {
            // Update positions based on current DOM order
            const items = document.querySelectorAll('.board-item');
            items.forEach((item, index) => {
                boardItems[index].position = index;
            });
            
            // Create board document
            const boardData = {
                title: boardTitle.value.trim(),
                goalType: goalType.value,
                notes: boardNotes.value.trim(),
                items: boardItems,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Save to Firestore
            await db.collection('boards').add(boardData);
            
            alert('Board saved successfully!');
            window.location.href = 'boards.html';
            
        } catch (error) {
            console.error('Error saving board:', error);
            alert('Error saving board. Please try again.');
        }
    });

    // Image Search (Placeholder - You'll need to implement API integration)
    searchBtn.addEventListener('click', () => {
        const query = imageSearch.value.trim();
        if (query) {
            // Here you would typically make an API call to Unsplash/Pexels
            // For now, we'll just show a message
            alert('Image search will be implemented with API integration');
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
});

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = '/index.html';
    }
});

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

// Handle drag and drop functionality
const uploadBox = document.getElementById('image-upload-box');
const imagePreviewGrid = document.getElementById('image-preview-grid');
const imageUpload = document.getElementById('image-upload');

let uploadedImages = [];

// Drag and drop handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  uploadBox.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  uploadBox.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  uploadBox.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  uploadBox.classList.add('highlight');
}

function unhighlight(e) {
  uploadBox.classList.remove('highlight');
}

uploadBox.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

// Handle file input change
imageUpload.addEventListener('change', function(e) {
  handleFiles(this.files);
});

function handleFiles(files) {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  [...files].forEach(file => {
    if (!validImageTypes.includes(file.type)) {
      alert(`${file.name} is not a supported image type`);
      return;
    }

    if (file.size > maxFileSize) {
      alert(`${file.name} is too large. Maximum file size is 5MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = createImagePreview(reader.result, file);
      imagePreviewGrid.appendChild(preview);
    };
    reader.readAsDataURL(file);

    uploadedImages.push({
      file: file,
      name: file.name
    });
  });
}

function createImagePreview(src, file) {
  const div = document.createElement('div');
  div.className = 'image-preview';
  
  const img = document.createElement('img');
  img.src = src;
  img.alt = file.name;
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-image';
  removeBtn.innerHTML = '×';
  removeBtn.onclick = () => {
    div.remove();
    uploadedImages = uploadedImages.filter(img => img.name !== file.name);
  };
  
  div.appendChild(img);
  div.appendChild(removeBtn);
  return div;
}

// Handle form submission
const createBoardForm = document.getElementById('create-board-form');

createBoardForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!uploadedImages.length) {
    alert('Please add at least one image to your vision board');
    return;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Saving...';

  try {
    const boardData = {
      title: document.getElementById('board-title').value,
      description: document.getElementById('board-description').value,
      tags: document.getElementById('board-tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
      images: uploadedImages
    };

    const boardId = await boardOperations.saveBoard(boardData);
    alert('Board saved successfully!');
    window.location.href = `/view-board.html?id=${boardId}`;
  } catch (error) {
    console.error('Error saving board:', error);
    alert('Error saving board. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Save Board';
  }
});

// Handle thumbnail creation
document.getElementById('create-thumbnail').addEventListener('click', async () => {
  const boardGrid = document.getElementById('board-grid');
  const images = boardGrid.querySelectorAll('img');
  
  if (images.length === 0) {
    alert('Please add some images to create a thumbnail');
    return;
  }

  // Select top 4 images for thumbnail
  const topImages = Array.from(images).slice(0, 4);
  
  try {
    // Create a canvas for the thumbnail
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 400;
    
    // Draw background
    ctx.fillStyle = '#120c1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate grid layout
    const imageSize = 190;
    const gap = 10;
    const startX = (canvas.width - (2 * imageSize + gap)) / 2;
    const startY = (canvas.height - (2 * imageSize + gap)) / 2;
    
    // Draw images in a 2x2 grid
    const positions = [
      [startX, startY],
      [startX + imageSize + gap, startY],
      [startX, startY + imageSize + gap],
      [startX + imageSize + gap, startY + imageSize + gap]
    ];
    
    // Load and draw images
    await Promise.all(topImages.map(async (img, index) => {
      const [x, y] = positions[index];
      ctx.drawImage(img, x, y, imageSize, imageSize);
      
      // Add a subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, imageSize, imageSize);
    }));
    
    // Convert canvas to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    const thumbnailFile = new File([blob], 'board-thumbnail.jpg', { type: 'image/jpeg' });
    
    // Save thumbnail URL for later use
    const reader = new FileReader();
    reader.onloadend = () => {
      boardThumbnail = reader.result;
    };
    reader.readAsDataURL(thumbnailFile);
    
    alert('Thumbnail created successfully!');
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    alert('Error creating thumbnail. Please try again.');
  }
});

// Handle drag and drop between image collection and board grid
function setupDragAndDrop() {
  const imageGrid = document.getElementById('image-collection-grid');
  const boardGrid = document.getElementById('board-grid');
  let draggedItem = null;

  // Add drag events to images in collection
  function addDragEvents(element) {
    element.draggable = true;
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
  }

  function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
  }

  function handleDragEnd(e) {
    draggedItem = null;
    this.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(item => {
      item.classList.remove('drag-over');
    });
  }

  // Board grid drop zone
  boardGrid.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    boardGrid.classList.add('drag-over');
  });

  boardGrid.addEventListener('dragleave', () => {
    boardGrid.classList.remove('drag-over');
  });

  boardGrid.addEventListener('drop', (e) => {
    e.preventDefault();
    boardGrid.classList.remove('drag-over');

    if (draggedItem) {
      // Create new board item
      const boardItem = document.createElement('div');
      boardItem.className = 'board-item';
      boardItem.draggable = true;
      
      // Clone the image
      const img = draggedItem.cloneNode(true);
      
      // Add delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.onclick = () => boardItem.remove();
      
      boardItem.appendChild(img);
      boardItem.appendChild(deleteBtn);
      
      // Add drag functionality to board item
      addDragEvents(boardItem);
      
      // Add to board grid
      boardGrid.appendChild(boardItem);
    }
  });

  // Make board items sortable
  boardGrid.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(boardGrid, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (draggable) {
      if (afterElement) {
        boardGrid.insertBefore(draggable, afterElement);
      } else {
        boardGrid.appendChild(draggable);
      }
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
}

// Initialize drag and drop
setupDragAndDrop(); 