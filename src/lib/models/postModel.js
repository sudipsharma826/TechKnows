import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    categories: { type: [String], required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    slug: { type: String, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Check if the model is already defined, otherwise define it
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
