import User from '@/lib/models/userModel';
import connect from '@/lib/mongodb/mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import sendMail from '../../../config/nodeMailer';

export async function POST(req) {
  try {
    await connect();

    const { email, password, profilePic } = await req.json();

    // Check for missing fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    let user = await User.findOne({ email });

    if (user) {
      // User exists
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Handle profile picture update
      if (profilePic && user.profilePicture !== profilePic) {
        user.profilePicture = profilePic;
        await user.save();
      }

      // Check if user is active
      if (!user.isActive) {
        await sendVerificationEmail(user);
        return new Response(
          JSON.stringify({ message: 'Verification email sent. Please verify your account.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Generate and return token
      return generateAndSetToken(user);
    } else {
      // User doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with isActive set to false
      user = await User.create({
        email,
        password: hashedPassword,
        profilePicture: profilePic,
        displayName: email,
        providerId: "viaPassword",
        phoneNumber: "",
        isActive: true,
      });

      await sendVerificationEmail(user);
      return new Response(
        JSON.stringify({ message: 'Verification email sent. Please verify your account.' }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function sendVerificationEmail(user) {
  const otp = Math.floor(1000 + Math.random() * 9000);
  user.otp = otp;
  user.otpExpiresAt = Date.now() + 600000; // 10 minutes
  await user.save();

  const token = jwt.sign(
    { userID: user._id, userEmail: user.email, otp, eotp: user.otpExpiresAt },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const verificationLink = `https://yourdomain.com/verify?token=${encodeURIComponent(token)}`;

  await sendMail({
    email: user.email,
    subject: 'Verify Your Email – Sudip Sharma Blog',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto; background-color: #f4f4f9;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          Welcome to the <strong>Sudip Sharma Blog</strong>. To start using your account, please verify your email by clicking the button below. This link will expire in 15 minutes.
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px; font-size: 16px;">Verify Email</a>
        </div>
      </div>
    `,
  });
}

function generateAndSetToken(user) {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role,isActive: user.isActive },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookie = serialize('acesstoken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'strict',
  });

  const userData = { ...user.toObject(), password: undefined };

  return new Response(
    JSON.stringify({
      message: 'User signed in successfully',
      user: userData,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
    }
  );
}
