import axios from "axios";


// Upload the Image
export const uploadImage = async (image) => {
    try {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', "next_blog"); 


        const response = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Return the secure URL of the uploaded image
        return response.data.secure_url;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        throw error;
    }
};

// Delete the Image
export const deleteImage = async (image) => {
    try {
        const public_id = image.split('/').slice(-1)[0].split('.')[0];

        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
            {
                public_id: public_id,
                type: 'upload',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.result === 'ok';
    } catch (error) {
        console.error('Error in deleteImage:', error);
        throw error;
    }
};
