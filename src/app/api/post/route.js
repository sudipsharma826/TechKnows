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

        //Generate the slug
        const slug = title
        .toLowerCase()
        .split(' ')
        .join('-')
        .replace(/[^a-zA-Z0-9-]/g, '');

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
            slug,
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

export async function GET(req) {
    await connect();

    const url = new URL(req.url);
    const userRole = url.searchParams.get('userRole');
    const userId = url.searchParams.get('userId');

    if (!userRole || !userId) {
        return new Response(
            JSON.stringify({ error: 'User role and user ID are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
    const getUserRole = await User.findOne({ 
        _id: userId,
        role: userRole 
    });
    
    if (!getUserRole) {
        return new Response(
            JSON.stringify({ error: 'User ID or role is incorrect' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }
    

    try {
        if (userRole === 'superadmin') {
            const posts = await Post.find().sort({ updatedAt: -1 });
            return new Response(JSON.stringify(posts), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (userRole === 'admin') {
            const adminCollectionName = `admin_${userId}`;
            const adminModel = mongoose.models[adminCollectionName] || mongoose.model(adminCollectionName, new mongoose.Schema({
                userId: mongoose.Schema.Types.ObjectId,
                posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
            }));
            const admin = await adminModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate('posts');
            if (!admin) {
                return new Response(
                    JSON.stringify({ error: 'Admin data not found' }),
                    { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }
            return new Response(JSON.stringify(admin.posts), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(
            JSON.stringify({ error: 'Invalid user role' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching posts:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// DELETE a post with userID and postID, handling superadmin/admin roles
export async function DELETE(req) {
    const { userID, postID } = await req.json();

    if (!userID || !postID) {
        return new Response(
            JSON.stringify({ error: 'User ID and Post ID are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    await connect();

    try {
        const user = await User.findById(userID);
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const { role } = user;

        // Fetch the post to check if the user is the creator
        const post = await Post.findById(postID);
        if (!post) {
            return new Response(
                JSON.stringify({ error: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if the user is the creator for non-admin roles
        if (role !== 'admin' && post.createdBy !== userID) {
            return new Response(
                JSON.stringify({ error: 'You are not the author of this post' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Handle superadmin role deletion
        if (role === 'superadmin') {
            await Post.findByIdAndDelete(postID);
            return new Response(
                JSON.stringify({ message: 'Post deleted successfully (Superadmin)' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Handle admin role deletion
        if (role === 'admin') {
            await Post.findByIdAndDelete(postID);
            const adminCollectionName = `admin_${userID}`;
            let adminModel = mongoose.models[adminCollectionName];
            if (!adminModel) {
                const adminSchema = new mongoose.Schema({
                    userId: mongoose.Types.ObjectId,
                    posts: [mongoose.Types.ObjectId],
                });
                adminModel = mongoose.model(adminCollectionName, adminSchema);
            }

            // Update admin model by removing the post reference
            await adminModel.updateOne(
                { userId: new mongoose.Types.ObjectId(userID) },
                { $pull: { posts: new mongoose.Types.ObjectId(postID) } }
            );

            return new Response(
                JSON.stringify({ message: 'Post deleted successfully (Admin)' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Unauthorized role
        return new Response(
            JSON.stringify({ error: 'Unauthorized role for this operation' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error deleting post:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Get a post by ID
export async function PATCH(req) {
    const { postId, userRole, userId } = await req.json();

    if (!postId || !userRole || !userId) {
        return new Response(
            JSON.stringify({ error: 'Post ID, userRole, and userId are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    await connect();

    try {
        // Check if the user role is correct with the user ID
        const getUser = await User.findOne({ _id: userId, role: userRole });
        if (!getUser) {
            return new Response(
                JSON.stringify({ error: 'User ID or role is incorrect' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Fetch the post and check if the user is the creator
        const post = await Post.findById(postId);
        if (!post) {
            return new Response(
                JSON.stringify({ error: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if the user is the creator of the post
        if (post.createdBy.toString() !== userId) {
            return new Response(
                JSON.stringify({ error: 'You are not the author of this post' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Return the post for editing
        return new Response(JSON.stringify(post), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// Update a post by ID
export async function PUT(req) {
    const { postId, userId, userRole, payload } = await req.json();

    if (!postId || !userId || !userRole || !payload) {
        return new Response(
            JSON.stringify({ error: 'Post ID, userId, userRole, and payload are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    await connect();

    try {
        // Check if the user role is correct with the user ID
        const getUser = await User.findOne({ _id: userId, role: userRole });
        if (!getUser) {
            return new Response(
                JSON.stringify({ error: 'User ID or role is incorrect' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Fetch the post to check if the user is the creator
        const post = await Post.findById(postId);
        if (!post) {
            return new Response(
                JSON.stringify({ error: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Ensure the user is the creator of the post
        if (post.createdBy.toString() !== userId) {
            return new Response(
                JSON.stringify({ error: 'You are not the author of this post' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Proceed with updating the post
        const updatedPost = await Post.findByIdAndUpdate(postId, payload, { new: true });
        if (!updatedPost) {
            return new Response(
                JSON.stringify({ error: 'Failed to update post' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({ message: 'Post updated successfully', post: updatedPost }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating post:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
