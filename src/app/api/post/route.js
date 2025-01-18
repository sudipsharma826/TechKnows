import User from '@/lib/models/userModel';
import Post from '../../../lib/models/postModel';
import connect from '../../../lib/mongodb/mongoose';
import mongoose from 'mongoose';

export async function POST(req) {
    try {
        // Connect to the database
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

        // Save the new post to the database
        await newPost.save();

        // If the user is not a superadmin, handle admin-specific logic
        if (userRole !== 'superadmin') {
            const adminCollectionName = `admin_${createdBy}`;
            console.log("Admin Collection Name:", adminCollectionName);

            // Retrieve the dynamically created admin model
            const adminModel = mongoose.models[adminCollectionName] || mongoose.model(adminCollectionName, new mongoose.Schema({
                userId: { type: mongoose.Schema.Types.ObjectId, required: true },
                name: { type: String, required: true },
                email: { type: String, required: true },
                posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
                isActive: { type: Boolean, default: true },
            }), adminCollectionName);

            // Add the post ID to the admin's posts array
            await adminModel.updateOne(
                { userId: new mongoose.Types.ObjectId(createdBy) },
                { $push: { posts: newPost._id } } // Add the post ID to the posts array
            );

            console.log("Post added to admin's posts successfully.");
        }

        // Return success response
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
