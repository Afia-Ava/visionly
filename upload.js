import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase services
const auth = getAuth();
const storage = getStorage();

document.getElementById("upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to upload files.");
        return;
    }

    try {
        const storageRef = ref(storage, `users/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        console.log("File uploaded successfully:", downloadURL);
        alert("File uploaded successfully!");
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
    }
});
