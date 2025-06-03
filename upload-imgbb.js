document.getElementById("upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];
    const apiKey = "YOUR_IMGBB_API_KEY";

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        if (result.success) {
            console.log("Image uploaded successfully:", result.data.url);
            alert("Image uploaded successfully!");
        } else {
            console.error("Error uploading image:", result);
            alert("Failed to upload image.");
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image. Please try again.");
    }
});
