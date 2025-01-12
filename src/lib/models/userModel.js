import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      unique: false, // Remove unique constraint
      default: null,
    },
    email: {
      type: String,
      required: true, 
      unique: true, // Ensure emails are unique
    },
    firstName: {
      type: String,
      default: null, 
    },
    lastName: {
      type: String,
      default: null, 
    },
    username: {
      type: String,
      unique: false, // Remove unique constraint for username
      default: null, 
    },
    profilePicture: {
      type: String,
      default: null, 
    },
    isAdmin: {
      type: Boolean,
      default: false, 
    },
    isSuperAdmin: {
      type: Boolean,
      default: false, 
    },

    password: {
      type: String,
      required: false,
      default: null, 
    },
  },
  { timestamps: true }
);

// Check if the model already exists, otherwise create it
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
