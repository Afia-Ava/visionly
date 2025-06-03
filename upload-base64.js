import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

document.getElementById("upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to upload files.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
        const base64Image = reader.result;

        try {
            await addDoc(collection(db, "images"), {
                uid: user.uid,
                image: base64Image,
                createdAt: new Date().toISOString(),
            });
            alert("Image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        }
    };
    reader.readAsDataURL(file);
});
