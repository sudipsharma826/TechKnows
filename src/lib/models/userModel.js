import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,  
  },
  providerId: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationTokenExpiresAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpiresAt: {
    type: Date,
  },
  password: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiresAt: {
    type: Date,
  },
  subscribedPackages: [ { type: mongoose.Schema.Types.ObjectId, ref: "Package" }]
  

}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
