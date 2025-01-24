import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], 
    categoryName: [{ type: String }],
    content: { type: String, required: true },
    imageUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    slug: { type: String, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to User model
}, { timestamps: true });

// Ensure the model is only created once
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
