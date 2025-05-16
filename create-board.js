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
        window.location.href = 'auth.html';
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