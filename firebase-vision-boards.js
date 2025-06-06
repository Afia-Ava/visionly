// Vision board management functions

// Create a new vision board
async function createVisionBoard(boardName, userId, metadata = {}) {
    try {
        console.log('Creating vision board with data:', { boardName, userId, metadata });
        
        if (!firebase.firestore || !userId) {
            throw new Error('Firestore not available or user not authenticated');
        }
        
        const db = firebase.firestore();
        const boardData = {
            name: boardName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userId: userId,
            elements: [],
            category: metadata.category || '',
            description: metadata.description || ''
        };
        
        console.log('Board data to save:', boardData);
        
        const docRef = await db.collection('visionBoards').add(boardData);
        console.log('Vision board created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error creating vision board:', error);
        throw error;
    }
}

// Add an image element to a vision board
async function addImageToBoard(boardId, imageData, position) {
    try {
        console.log('Adding image to board:', { boardId, imageData, position });
        
        if (!firebase.firestore) {
            throw new Error('Firestore not available');
        }
        
        const db = firebase.firestore();
        const boardRef = db.collection('visionBoards').doc(boardId);
        
        const element = {
            id: Date.now().toString(),
            type: 'image',
            data: imageData,
            position: position,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        console.log('Element to add:', element);
        
        await boardRef.update({
            elements: firebase.firestore.FieldValue.arrayUnion(element)
        });
        
        console.log('Image added to board successfully');
        return element.id;
    } catch (error) {
        console.error('Error adding image to board:', error);
        throw error;
    }
}

// Get all vision boards for a user
async function getUserVisionBoards(userId) {
    try {
        console.log('Getting vision boards for user:', userId);
        
        if (!firebase.firestore) {
            throw new Error('Firestore not available');
        }
        
        const db = firebase.firestore();
        const snapshot = await db.collection('visionBoards')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const boards = [];
        snapshot.forEach(doc => {
            boards.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('Found boards:', boards);
        return boards;
    } catch (error) {
        console.error('Error getting user vision boards:', error);
        throw error;
    }
}

// Get a specific vision board
async function getVisionBoard(boardId) {
    try {
        console.log('Getting vision board:', boardId);
        
        if (!firebase.firestore) {
            throw new Error('Firestore not available');
        }
        
        const db = firebase.firestore();
        const doc = await db.collection('visionBoards').doc(boardId).get();
        
        if (doc.exists) {
            console.log('Board found:', doc.data());
            return { id: doc.id, ...doc.data() };
        } else {
            throw new Error('Vision board not found');
        }
    } catch (error) {
        console.error('Error getting vision board:', error);
        throw error;
    }
}

// Update vision board elements
async function updateBoardElements(boardId, elements) {
    try {
        console.log('Updating board elements:', { boardId, elements });
        
        if (!firebase.firestore) {
            throw new Error('Firestore not available');
        }
        
        const db = firebase.firestore();
        await db.collection('visionBoards').doc(boardId).update({
            elements: elements,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Board elements updated successfully');
    } catch (error) {
        console.error('Error updating board elements:', error);
        throw error;
    }
}

// Delete a vision board
async function deleteVisionBoard(boardId) {
    try {
        console.log('Deleting vision board:', boardId);
        
        if (!firebase.firestore) {
            throw new Error('Firestore not available');
        }
        
        const db = firebase.firestore();
        await db.collection('visionBoards').doc(boardId).delete();
        
        console.log('Vision board deleted successfully');
    } catch (error) {
        console.error('Error deleting vision board:', error);
        throw error;
    }
}
