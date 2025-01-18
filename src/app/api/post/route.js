import Post from '../../../lib/models/postModel';
import connect from '../../../lib/mongodb/mongoose';
import mongoose from 'mongoose';

export async function POST(req) {
    try {
        await connect();

        const { 
            title, 
            subtitle, 
            categories, 
            content, 
            imageUrl, 
            isFeatured, 
            isPremium, 
            createdBy, 
            userRole 
        } = await req.json();

        // Validate required fields
        if (!title || !categories || !content || !createdBy) {
            return new Response(
                JSON.stringify({ error: 'Title, categories, content, and createdBy are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create a new post
        const newPost = new Post({
            title,
            subtitle,
            categories,
            content,
            imageUrl,
            isFeatured,
            isPremium,
            createdBy,
        });

        // Save post to the database
        await newPost.save();

        // If the user is not a superadmin, handle admin-specific logic
        if (userRole !== 'superadmin') {
            const adminCollectionName = `admin_${createdBy}s`;
            console.log("Admin Collection Name:", adminCollectionName);

            // Define admin schema
            const adminSchema = new mongoose.Schema({
                userId: String,
                posts: [mongoose.Schema.Types.ObjectId],
            });

            // Check if the model is already registered
            const adminModel = mongoose.models[adminCollectionName] 
                ? mongoose.model(adminCollectionName) 
                : mongoose.model(adminCollectionName, adminSchema, adminCollectionName);

            // Check if the admin document exists
            const adminDoc = await adminModel.findOne({ userId: createdBy });

            if (!adminDoc) {
                // Create the admin document if it doesn't exist
                await adminModel.create({
                    userId: createdBy,
                    posts: [newPost._id],
                });
                console.log(`Admin document created in collection: ${adminCollectionName}`);
            } else {
                // Add the post ID to the admin's posts array
                await adminModel.updateOne(
                    { userId: createdBy }, // Find the document by userId
                    { $push: { posts: newPost._id } } // Push the new post ID into the posts array
                );
                console.log(`Post ID added to admin collection: ${adminCollectionName}`);
            }
        }

        return new Response(
            JSON.stringify({ message: 'Post created successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error during post creation:', error);
        return new Response(
            JSON.stringify({ error: 'Error during post creation' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
