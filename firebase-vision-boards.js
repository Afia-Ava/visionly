// Vision board management functions

// Save a new vision board
async function saveVisionBoard(boardData) {
    try {
        console.log('Saving vision board with boardData:', boardData); // Log input
        
        if (!firebase.auth().currentUser) {
            throw new Error('User not authenticated');
        }

        const db = firebase.firestore();
        
        // Prepare the board document - now using boardData.images
        const boardDoc = {
            name: boardData.name || 'Untitled Board',
            description: boardData.description || '',
            category: boardData.category || 'General', // Added category from screenshot
            userId: firebase.auth().currentUser.uid,
            images: boardData.images || [], // Expecting an images array now
            goals: boardData.goals || {}, // Added goals from screenshot
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            isPublic: boardData.isPublic !== undefined ? boardData.isPublic : false,
            // Removed tags and elements, assuming images array is the primary way to store visual content
        };

        // Add the document to the user's 'boards' subcollection
        const docRef = await db.collection('users').doc(firebase.auth().currentUser.uid).collection('boards').add(boardDoc);
        
        console.log('Vision board saved to users/{userId}/boards with ID:', docRef.id);
        return docRef.id;
        
    } catch (error) {
        console.error('Error saving vision board:', error);
        throw error;
    }
}

// Get user's vision boards
async function getUserVisionBoards(userId) {
    try {
        console.log(`Fetching boards for userId: ${userId} from top-level 'boards' collection`);
        const db = firebase.firestore();
        const snapshot = await db.collection('boards')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        if (snapshot.empty) {
            console.log('No boards found for this user in top-level boards collection.');
            return [];
        }

        console.log(`Found ${snapshot.size} board document(s).`);
        const boards = [];
        snapshot.forEach(doc => {
            console.log(`Processing board doc ID: ${doc.id}, Data:`, JSON.stringify(doc.data()));
            boards.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('Loaded and processed boards from top-level boards collection:', JSON.stringify(boards));
        return boards;
        
    } catch (error) {
        console.error('Error in getUserVisionBoards:', error);
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

// Delete board by ID
window.deleteBoardById = async function(userId, boardId) {
  return firebase.firestore()
    .collection('users')
    .doc(userId)
    .collection('vision_boards')
    .doc(boardId)
    .delete();
};
