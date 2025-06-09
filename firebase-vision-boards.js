// Vision board management functions

// Save a new vision board
async function saveVisionBoard(boardData) {
    try {
        console.log('Saving vision board:', boardData);
        
        if (!firebase.auth().currentUser) {
            throw new Error('User not authenticated');
        }

        const db = firebase.firestore();
        
        // Prepare the board document
        const boardDoc = {
            name: boardData.name || 'Untitled Board',
            description: boardData.description || '',
            userId: firebase.auth().currentUser.uid,
            elements: boardData.elements || [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            isPublic: false,
            tags: boardData.tags || []
        };

        // Add the document to Firestore
        const docRef = await db.collection('visionBoards').add(boardDoc);
        
        console.log('Vision board saved with ID:', docRef.id);
        return docRef.id;
        
    } catch (error) {
        console.error('Error saving vision board:', error);
        throw error;
    }
}

// Get user's vision boards
async function getUserVisionBoards(userId) {
    try {
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
        
        console.log('Loaded boards:', boards);
        return boards;
        
    } catch (error) {
        console.error('Error loading vision boards:', error);
        throw error;
    }
}

// Update an existing vision board
async function updateVisionBoard(boardId, updateData) {
    try {
        const db = firebase.firestore();
        
        const updateDoc = {
            ...updateData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('visionBoards').doc(boardId).update(updateDoc);
        console.log('Vision board updated:', boardId);
        
    } catch (error) {
        console.error('Error updating vision board:', error);
        throw error;
    }
}

// Delete a vision board
async function deleteVisionBoard(boardId) {
    try {
        const db = firebase.firestore();
        await db.collection('visionBoards').doc(boardId).delete();
        console.log('Vision board deleted:', boardId);
        
    } catch (error) {
        console.error('Error deleting vision board:', error);
        throw error;
    }
}

// Get a single vision board by ID
async function getVisionBoard(boardId) {
    try {
        const db = firebase.firestore();
        const doc = await db.collection('visionBoards').doc(boardId).get();
        
        if (doc.exists) {
            return {
                id: doc.id,
                ...doc.data()
            };
        } else {
            throw new Error('Vision board not found');
        }
        
    } catch (error) {
        console.error('Error getting vision board:', error);
        throw error;
    }
}
