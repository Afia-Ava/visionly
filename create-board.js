import UnsplashAuth from './unsplash-auth.js';
import UNSPLASH_CONFIG from './unsplash-config.js';

let milestones = [];
let boardThumbnail = null;

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
        } 
        else {
            boardGrid.appendChild(draggable);
        }
    });    // Save board
   
    

    saveBoard.addEventListener('click', async () => {
        const user = auth.currentUser;
        const submitButton = saveBoard;

        if (!user) {
            alert('Please sign in to save your board');
            return;
        }
        if (!boardTitle.value.trim()) {
            alert('Please enter a title for your vision board');
            return;
        }
        // Validate board has at least one item
        const boardItems = document.querySelectorAll('.board-item');
        if (boardItems.length === 0) {
            alert('Please add at least one image or note to your vision board');
            return;
        }

        // Disable button and show loading state
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Saving...';
        
        try {
            // Update positions based on current DOM order
            const items = document.querySelectorAll('.board-item');
            const updatedBoardItems = [];
            
            items.forEach((item, index) => {
                const itemData = {
                    type: item.querySelector('.note') ? 'text' : 'image',
                    content: item.querySelector('.note') ? 
                            item.querySelector('.note').textContent : 
                            item.querySelector('img').src,
                    position: index
                };
                updatedBoardItems.push(itemData);
            });
            
            // Create board document with all data
            const boardData = {
                title: boardTitle.value.trim(),
                goalType: goalType.value || 'personal',
                notes: boardNotes.value.trim(),
                items: updatedBoardItems,
                milestones: milestones.map(m => ({
                    id: m.id,
                    text: m.text,
                    completed: m.completed || false,
                    order: m.order
                })),
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                thumbnail: boardThumbnail || null,
                category: goalType.value || 'personal',
                isPublic: false,
                totalItems: updatedBoardItems.length
            };
            
            // Save to Firestore
            console.log('Saving board:', boardData);
            const docRef = await db.collection('boards').add(boardData);
            console.log('Board saved successfully with ID:', docRef.id);
            
            // Show success message and redirect
            // Add animation style if it doesn't exist
            if (!document.querySelector('#notification-animation')) {
                const style = document.createElement('style');
                style.id = 'notification-animation';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            const notification = document.createElement('div');
            notification.className = 'visionly-notification'; 
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = 'rgba(46, 125, 50, 0.9)';
            notification.style.color = 'white';
            notification.style.padding = '15px 25px';
            notification.style.borderRadius = '8px';
            notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            notification.style.zIndex = '9999'; 
            notification.innerHTML = '✨ Vision board saved successfully!';
            document.body.appendChild(notification);
            console.log('Notification appended:', notification);

            // Force reflow to ensure animation triggers
            void notification.offsetWidth;
            notification.style.animation = 'slideIn 0.5s ease-out';

            // Show notification for 3 seconds, then fade out and remove
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s ease-out';
                setTimeout(() => {
                    try {
                        if (notification && notification.parentNode) {
                            document.body.removeChild(notification);
                        }
                    } catch (e) {
                        console.error('Error removing notification:', e);
                    }

                    // Reset the form
                    boardTitle.value = '';
                    boardNotes.value = '';
                    boardGrid.innerHTML = '';
                    boardItems = [];
                    milestones = [];
                    renderMilestones();
                    if (goalType) goalType.value = 'personal';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }, 500);
            }, 3000);
            

        } catch (error) {
            console.error('Error saving board:', error);
            alert('There was an error saving your vision board. Please try again.');
            
            // Reset button state on error
            submitButton.disabled = false;
            submitButton.textContent = originalText;
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

    // Milestone Management
    let milestones = [];

    function setupMilestoneHandlers() {
        const addMilestoneButton = document.getElementById('add-milestone-button');
        const milestoneInput = document.getElementById('add-milestone-input');
        const milestonesList = document.getElementById('milestones-list');

        if (addMilestoneButton && milestoneInput) {
            addMilestoneButton.addEventListener('click', () => addMilestone());
            milestoneInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addMilestone();
                }
            });
        }
    }
    

    function addMilestone() {
        const milestoneInput = document.getElementById('add-milestone-input');
        const text = milestoneInput.value.trim();
        
        if (text) {
            const milestone = {
                id: Date.now().toString(),
                text: text,
                completed: false,
                order: milestones.length
            };
            
            milestones.push(milestone);
            renderMilestones();
            milestoneInput.value = '';
        }
    }

    function renderMilestones() {
        const milestonesList = document.getElementById('milestones-list');
        if (!milestonesList) return;
        milestonesList.innerHTML = '';

        milestones.sort((a, b) => a.order - b.order).forEach((milestone) => {
            const milestoneElement = document.createElement('div');
            milestoneElement.className = 'milestone-item';
            milestoneElement.dataset.id = milestone.id;
            
            milestoneElement.innerHTML = `
                <span class="milestone-identifier">${milestone.text}</span>
                <button class="delete-milestone-button" onclick="deleteMilestone('${milestone.id}')" title="Delete milestone">×</button>
            `;

            milestonesList.appendChild(milestoneElement);
        });
    }

    // Make deleteMilestone function globally accessible
    window.deleteMilestone = function(id) {
        milestones = milestones.filter(m => m.id !== id);
        renderMilestones();
    };

    // Add to your initialization code
    setupMilestoneHandlers();

    // Alternative approach using event delegation
    const milestonesList = document.getElementById('milestones-list');
    
    // Add event delegation for delete buttons
    milestonesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-milestone-button')) {
            const milestoneItem = e.target.closest('.milestone-item');
            if (milestoneItem) {
                const id = milestoneItem.dataset.id;
                deleteMilestone(id);
            }
        }
    });
});

// Check authentication state
auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? 'User is logged in' : 'User is not logged in');
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
  uploadBox.addEventListener('dragleave', unhighlight, false);
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

// Handle thumbnail creation
document.getElementById('create-thumbnail').addEventListener('click', async () => {
    const thumbnailButton = document.getElementById('create-thumbnail');
    const boardGrid = document.getElementById('board-grid');
    const images = boardGrid.querySelectorAll('img');
    
    if (images.length === 0) {
        alert('Please add some images to create a thumbnail');
        return;
    }

    // Disable button and show loading state
    thumbnailButton.disabled = true;
    const originalText = thumbnailButton.textContent;
    thumbnailButton.textContent = 'Creating...';

    // Select top 4 images for thumbnail
    const topImages = Array.from(images).slice(0, 4);
    
    try {
        // Create a canvas for the thumbnail
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 400;
        canvas.height = 400;
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a122b');
        gradient.addColorStop(1, '#2c2046');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate grid layout
        const imageSize = 180; // Slightly smaller for better spacing
        const gap = 20; // Increased gap for better spacing
        const startX = (canvas.width - (2 * imageSize + gap)) / 2;
        const startY = (canvas.height - (2 * imageSize + gap)) / 2;
        
        // Draw images in a 2x2 grid
        const positions = [
            [startX, startY],
            [startX + imageSize + gap, startY],
            [startX, startY + imageSize + gap],
            [startX + imageSize + gap, startY + imageSize + gap]
        ];
        
        // Load and draw images with rounded corners and shadows
        await Promise.all(topImages.map(async (img, index) => {
            const [x, y] = positions[index];
            
            // Add shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 4;
            
            // Create rounded rectangle clip
            ctx.save();
            ctx.beginPath();
            const radius = 10;
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + imageSize - radius, y);
            ctx.quadraticCurveTo(x + imageSize, y, x + imageSize, y + radius);
            ctx.lineTo(x + imageSize, y + imageSize - radius);
            ctx.quadraticCurveTo(x + imageSize, y + imageSize, x + imageSize - radius, y + imageSize);
            ctx.lineTo(x + radius, y + imageSize);
            ctx.quadraticCurveTo(x, y + imageSize, x, y + imageSize - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.clip();
            
            // Draw image
            ctx.drawImage(img, x, y, imageSize, imageSize);
            
            // Add subtle border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, imageSize, imageSize);
            
            ctx.restore();
            ctx.shadowColor = 'transparent';
        }));
        
        // Convert canvas to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        const thumbnailFile = new File([blob], 'board-thumbnail.jpg', { type: 'image/jpeg' });
        
        // Save thumbnail URL for later use
        const reader = new FileReader();
        reader.onloadend = () => {
            boardThumbnail = reader.result;
            // Show preview
            const previewContainer = document.createElement('div');
            previewContainer.style.position = 'fixed';
            previewContainer.style.top = '50%';
            previewContainer.style.left = '50%';
            previewContainer.style.transform = 'translate(-50%, -50%)';
            previewContainer.style.backgroundColor = 'rgba(26, 18, 43, 0.95)';
            previewContainer.style.padding = '20px';
            previewContainer.style.borderRadius = '12px';
            previewContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            previewContainer.style.zIndex = '1000';
            
            const previewImage = new Image();
            previewImage.src = reader.result;
            previewImage.style.maxWidth = '300px';
            previewImage.style.borderRadius = '8px';
            
            const closeButton = document.createElement('button');
            closeButton.textContent = '✕';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.color = '#fff';
            closeButton.style.fontSize = '20px';
            closeButton.style.cursor = 'pointer';
            
            closeButton.onclick = () => {
                document.body.removeChild(previewContainer);
            };
            
            previewContainer.appendChild(previewImage);
            previewContainer.appendChild(closeButton);
            document.body.appendChild(previewContainer);
        };
        reader.readAsDataURL(thumbnailFile);
        
        alert('Thumbnail created successfully!');
    } catch (error) {
        console.error('Error creating thumbnail:', error);
        alert('Error creating thumbnail. Please try again.');
    } finally {
        // Reset button state
        thumbnailButton.disabled = false;
        thumbnailButton.textContent = originalText;
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