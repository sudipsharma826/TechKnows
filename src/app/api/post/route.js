import User from '@/lib/models/userModel';
import Post from '../../../lib/models/postModel';
import connect from '../../../lib/mongodb/mongoose';
import mongoose from 'mongoose';
import Category from '../../../lib/models/categoryModel';

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
            userRole,
        } = await req.json();

        // Validate required fields
        if (!title || !categories || !content || !createdBy) {
            return new Response(
                JSON.stringify({
                    error: 'Title, categories, content, and createdBy are required',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check if the provided categories exist
        const validCategories = await Category.find({ _id: { $in: categories } });
        if (validCategories.length !== categories.length) {
            return new Response(
                JSON.stringify({
                    error: 'Some categories are not listed. Post cannot be saved.',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Increment the postCount for the valid categories (only for new posts)
        await Category.updateMany(
            { _id: { $in: categories } },
            { $inc: { postCount: 1 } }
        );

        // Generate the slug
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
            console.log('Admin Collection Name:', adminCollectionName);

            // Retrieve the dynamically created admin model
            const adminModel =
                mongoose.models[adminCollectionName] ||
                mongoose.model(
                    adminCollectionName,
                    new mongoose.Schema(
                        {
                            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
                            name: { type: String, required: true },
                            email: { type: String, required: true },
                            posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
                            isActive: { type: Boolean, default: true },
                        },
                        { timestamps: true }
                    ),
                    adminCollectionName
                );

            // Add the post ID to the admin's posts array
            await adminModel.updateOne(
                { userId: new mongoose.Types.ObjectId(createdBy) },
                { $push: { posts: newPost._id } },
                { upsert: true }
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
    const general = url.searchParams.get('general') === 'true'; // Optional, fetchType is only valid if this is true
    const fetchType = url.searchParams.get('fetchType'); // Can be 'posts', 'categories', or 'all'
    const postId = url.searchParams.get('postId'); // Optional for specific post fetching

    // Validate mandatory parameters
    if (!userRole || !userId) {
        return new Response(
            JSON.stringify({ error: 'User role and user ID are required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Validate user existence and role
    const getUserRole = await User.findOne({ 
        _id: userId, 
        role: userRole 
    });
    console.log("Received from URL", userRole, userId);
    console.log("Get user role:", getUserRole);

    if (!getUserRole) {
        return new Response(
            JSON.stringify({ error: 'User ID or role is incorrect' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        // If general is true, fetch categories or posts based on fetchType
        if (general) {
            if (!fetchType) {
                return new Response(
                    JSON.stringify({ error: 'fetchType is required when general is true' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            let data = {};

            if (fetchType === 'categories') {
                // Fetch categories where isApproved is true and sort by createdAt
                data.categories = await Category.find({ isApproved: true }).sort({ createdAt: -1 });
            } else if (fetchType === 'posts') {
                // Fetch posts and sort by createdAt
                data.posts = await Post.find().sort({ createdAt: -1 });
            } else if (fetchType === 'all') {
                // Fetch both posts and categories
                data.posts = await Post.find().sort({ createdAt: -1 });
                data.categories = await Category.find({ isApproved: true }).sort({ createdAt: -1 });
            } else {
                return new Response(
                    JSON.stringify({ error: 'Invalid fetchType. Use "categories", "posts", or "all".' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // If general is false, fetch posts based on user role
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

        // If no specific role, return an error
        return new Response(
            JSON.stringify({ error: 'Invalid user role' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching data:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}



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
        const post = await Post.findById(postID);
        if (!post) {
            return new Response(
                JSON.stringify({ error: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Role-based deletion logic
        if (role === 'superadmin') {
            // Superadmin can delete any post
            await Post.findByIdAndDelete(postID);
            return new Response(
                JSON.stringify({ message: 'Post deleted successfully (Superadmin)' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else if (role === 'admin') {
            // Admin can delete any post
            await Post.findByIdAndDelete(postID);
            return new Response(
                JSON.stringify({ message: 'Post deleted successfully (Admin)' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else if (role === 'user') {
            // Users can only delete their own posts
            if (post.createdBy.toString() !== userID) {
                return new Response(
                    JSON.stringify({ error: 'You are not the author of this post' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
            await Post.findByIdAndDelete(postID);
            return new Response(
                JSON.stringify({ message: 'Post deleted successfully (User)' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

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
        const user = await User.findById(userId);
        if (!user || user.role !== userRole) {
            return new Response(
                JSON.stringify({ error: 'User not found or role mismatch' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const post = await Post.findById(postId);
        if (!post) {
            return new Response(
                JSON.stringify({ error: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check role and access permissions
        if (userRole === 'user' && post.createdBy.toString() !== userId) {
            return new Response(
                JSON.stringify({ error: 'You are not the author of this post' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Return the post
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
        const user = await User.findById(userId);
        if (!user || user.role !== userRole) {
            return new Response(
                JSON.stringify({ error: 'User not found or role mismatch' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const post = await Post.findById(postId);
        if (!post) {
            return new Response(
                JSON.stringify({ error: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Ensure only the author can update their own posts (except superadmin/admin)
        if (userRole === 'user' && post.createdBy.toString() !== userId) {
            return new Response(
                JSON.stringify({ error: 'You are not the author of this post' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

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
