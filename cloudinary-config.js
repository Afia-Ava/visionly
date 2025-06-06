// Cloudinary configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'dsf1mbhkh', 
    uploadPreset: 'Visionly', // Your upload preset name
    apiKey: '877378913253124'
};

// Function to upload image to Cloudinary
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
    
    try {
        console.log('Uploading to Cloudinary with preset:', CLOUDINARY_CONFIG.uploadPreset);
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );
        
        const data = await response.json();
        console.log('Cloudinary response:', data);
        
        if (data.secure_url) {
            console.log('Image uploaded successfully:', data.secure_url);
            return {
                url: data.secure_url,
                publicId: data.public_id,
                width: data.width,
                height: data.height
            };
        } else {
            throw new Error('Upload failed: ' + (data.error?.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

// Function to generate Cloudinary transformation URLs
function getCloudinaryUrl(publicId, transformations = {}) {
    let url = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/`;
    
    // Add transformations
    const params = [];
    if (transformations.width) params.push(`w_${transformations.width}`);
    if (transformations.height) params.push(`h_${transformations.height}`);
    if (transformations.crop) params.push(`c_${transformations.crop}`);
    if (transformations.quality) params.push(`q_${transformations.quality}`);
    
    if (params.length > 0) {
        url += params.join(',') + '/';
    }
    
    url += publicId;
    return url;
}

// Function to delete image from Cloudinary (requires signed requests)
async function deleteFromCloudinary(publicId) {
    // This typically requires server-side implementation due to signature requirements
    console.log('Delete image with public ID:', publicId);
    // Implementation depends on your backend setup
}
