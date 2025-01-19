import axios from "axios";
import crypto from "crypto";

// Upload the Image
export const uploadImage = async (image) => {
    try {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', "next_blog");

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        // Return the secure URL of the uploaded image
        return response.data.secure_url;
    } catch (error) {
        console.error('Error in uploadImage:', error.message);
        throw new Error('Failed to upload image');
    }
};

// Delete the Image
export const deleteImage = async (imageUrl) => {
    try {
        const public_id = imageUrl.split('/').slice(-1)[0].split('.')[0];
        const api_key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
            {
                public_id: public_id,
                type: 'upload',
                api_key: api_key, // Use environment variable for API key
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.result === 'ok') {
            return true;
        } else {
            throw new Error('Failed to delete image');
        }
    } catch (error) {
        console.error('Error in deleteImage:', error.message);
        throw new Error('Failed to delete image');
    }
};
