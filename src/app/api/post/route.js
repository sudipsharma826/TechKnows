import User from '@/lib/models/userModel';
import Post from '../../../lib/models/postModel';
import connect from '../../../lib/mongodb/mongoose';
import mongoose from 'mongoose';
import Category from '../../../lib/models/categoryModel';


async function handleError(message, statusCode = 400) {
    return new Response(
        JSON.stringify({ error: message }),
        { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
}
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
            userRole,
        } = await req.json();

        // Validate required fields
        if (!title || !categories || !content || !createdBy) {
            return handleError('Title, categories, content, and createdBy are required');
        }

        // Check if categories exist and validate them in a single query
        const validCategories = await Category.find({ _id: { $in: categories } });
        if (validCategories.length !== categories.length) {
            return handleError('Some categories were not found', 404);
        }

        // Increment postCount in categories
        await Category.updateMany(
            { _id: { $in: categories } },
            { $inc: { postCount: 1 } }
        );

        // Slug generation simplified
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

        //Check if the title already exists (slug is unique)
        const postExists = await Post.findOne({ slug });
        if (postExists) {
            return handleError('Post with this title already exists', 409); // Conflict status code
        }

        // Create and save post
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

        await newPost.save();

        // Handle admin-specific logic for non-superadmin users
        if (userRole !== 'superadmin') {
            const adminCollectionName = `admin_${createdBy}`;
            const adminModel =
                mongoose.models[adminCollectionName] ||
                mongoose.model(
                    adminCollectionName,
                    new mongoose.Schema({
                        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
                        name: { type: String, required: true },
                        email: { type: String, required: true },
                        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
                        isActive: { type: Boolean, default: true },
                    }),
                    adminCollectionName
                );

            // Add the post ID to admin's posts array, using upsert for efficiency
            await adminModel.updateOne(
                { userId: new mongoose.Types.ObjectId(createdBy) },
                { $push: { posts: newPost._id } },
                { upsert: true }
            );
        }

        return new Response(
            JSON.stringify({ message: 'Post created successfully' }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error during post creation:', error);
        return handleError('An error occurred during post creation', 500);
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

    if (!userRole || !userId) {
        return handleError('User role and user ID are required');
    }

    const user = await User.findOne({ _id: userId, role: userRole });
    if (!user) {
        return handleError('User ID or role is incorrect', 404);
    }

    try {
        if (general) {
            if (!fetchType) return handleError('fetchType is required when general is true');
            let data = {};

            if (fetchType === 'categories') {
                data.categories = await Category.find({ isApproved: true }).sort({ createdAt: -1 });
            } else if (fetchType === 'posts') {
                data.posts = await Post.find().sort({ createdAt: -1 });
            } else if (fetchType === 'all') {
                data.posts = await Post.find().sort({ createdAt: -1 });
                data.categories = await Category.find({ isApproved: true }).sort({ createdAt: -1 });
            } else {
                return handleError('Invalid fetchType. Use "categories", "posts", or "all".');
            }

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (userRole === 'superadmin') {
            // Fetch posts with category IDs
            const posts = await Post.find()
                .sort({ updatedAt: -1 });
        
            // Fetch category details for all the categories in the posts
            const categoryIds = posts.flatMap(post => post.categories);
            const categories = await Category.find({ '_id': { $in: categoryIds } });
        
            // Map category ID to category name
            const categoryMap = categories.reduce((acc, category) => {
                acc[category._id.toString()] = category.name; // Map category ID to category name
                return acc;
            }, {});
        
            // Map the posts to include category names instead of IDs
            const postsWithCategories = posts.map(post => {
                const categoryNames = post.categories.map(categoryId => categoryMap[categoryId.toString()]);
                return { ...post.toObject(), categories: categoryNames };
            });
        
            return new Response(JSON.stringify(postsWithCategories), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        if (userRole === 'admin') {
            const adminCollectionName = `admin_${userId}`;
            const adminModel = mongoose.models[adminCollectionName];
        
            // Find the admin and populate the posts
            const admin = await adminModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate('posts');
            if (!admin) {
                return new Response(
                    JSON.stringify({ error: 'Admin data not found' }),
                    { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }
        
            // Fetch all the posts that belong to this admin
            const posts = await Post.find({ _id: { $in: admin.posts.map(post => post._id) } });
        
            // Fetch category details for all the categories in the posts
            const categoryIds = posts.flatMap(post => post.categories);
            const categories = await Category.find({ '_id': { $in: categoryIds } });
        
            // Map category ID to category name
            const categoryMap = categories.reduce((acc, category) => {
                acc[category._id.toString()] = category.name; // Map category ID to category name
                return acc;
            }, {});
        
            // Map the posts to include category names instead of IDs
            const postsWithCategories = posts.map(post => {
                const categoryNames = post.categories.map(categoryId => categoryMap[categoryId.toString()]);
                return { ...post.toObject(), categories: categoryNames };
            });
        
            // Return the posts with populated categories
            return new Response(JSON.stringify(postsWithCategories), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        

        return handleError('Invalid user role');
    } catch (error) {
        console.error('Error fetching data:', error);
        return handleError('Internal server error', 500);
    }
}

export async function DELETE(req) {
    const { userID, postID } = await req.json();

    if (!userID || !postID) {
        return handleError('User ID and Post ID are required');
    }

    await connect();

    try {
        const user = await User.findById(userID);
        if (!user) return handleError('User not found', 404);

        const post = await Post.findById(postID);
        if (!post) return handleError('Post not found', 404);

        // Role-based deletion logic
        if (user.role === 'superadmin' || user.role === 'admin' || (user.role === 'user' && post.createdBy.toString() === userID)) {
            await Post.findByIdAndDelete(postID);
            return new Response(
                JSON.stringify({ message: 'Post deleted successfully' }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return handleError('Unauthorized role for this operation', 403);
    } catch (error) {
        console.error('Error deleting post:', error);
        return handleError('Internal server error', 500);
    }
}

export async function PATCH(req) {
    const { postId, userRole, userId } = await req.json();

    if (!postId || !userRole || !userId) {
        return handleError('Post ID, userRole, and userId are required');
    }

    await connect();

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== userRole) {
            return handleError('User not found or role mismatch', 404);
        }

        const post = await Post.findById(postId);
        if (!post) return handleError('Post not found', 404);

        // Ensure user is the author or admin/superadmin
        if (userRole === 'user' && post.createdBy.toString() !== userId) {
            return handleError('You are not the author of this post', 403);
        }

        return new Response(JSON.stringify(post), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching post:', error);
        return handleError('Internal server error', 500);
    }
}

export async function PUT(req) {
    const { postId, userId, userRole, payload } = await req.json();

    if (!postId || !userId || !userRole || !payload) {
        return handleError('Post ID, userId, userRole, and payload are required');
    }

    await connect();

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== userRole) {
            return handleError('User not found or role mismatch', 404);
        }

        const post = await Post.findById(postId);
        if (!post) return handleError('Post not found', 404);

        // Ensure user is the author or admin/superadmin
        if (userRole === 'user' && post.createdBy.toString() !== userId) {
            return handleError('You are not the author of this post', 403);
        }

        const oldCategories = post.categories;

        // Update post categories (new categories from payload)
        const newCategories = payload.categories || [];
        
        // Find categories that are removed and increment the post count for newly added categories
        const categoriesToIncrement = newCategories.filter(cat => !oldCategories.includes(cat));
        const categoriesToDecrement = oldCategories.filter(cat => !newCategories.includes(cat));

        // Increment the post count for new categories
        await Category.updateMany(
            { _id: { $in: categoriesToIncrement } },
            { $inc: { postCount: 1 } }
        );

        // Decrement the post count for removed categories
        await Category.updateMany(
            { _id: { $in: categoriesToDecrement } },
            { $inc: { postCount: -1 } }
        );

        // Update the post with the new categories and other data from the payload
        const updatedPost = await Post.findByIdAndUpdate(postId, payload, { new: true });
        if (!updatedPost) return handleError('Failed to update post', 500);

        return new Response(
            JSON.stringify({ message: 'Post updated successfully', post: updatedPost }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error updating post:', error);
        return handleError('Internal server error', 500);
    }
}
