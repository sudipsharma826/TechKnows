// SERVER-SIDE (API Endpoint):
import User from '@/lib/models/userModel';
import connect from '@/lib/mongodb/mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import sendMail from '../../../config/nodeMailer';
import { AiOutlineConsoleSql } from 'react-icons/ai';

export async function POST(req) {
  try {
    await connect();

    const { email, password, profilePic } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: 'Email and password are required.', type: 'error' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    let user = await User.findOne({ email });

    if (user) {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return new Response(
          JSON.stringify({ message: 'Invalid email or password.', type: 'error' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (!user.isActive) {
        await sendVerificationEmail(user);
        return new Response(
          JSON.stringify({ message: 'Verification email sent. Please verify your account.', type: 'info' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (profilePic && user.profilePicture !== profilePic) {
        user.profilePicture = profilePic;
        await user.save();
      }

      return generateAndSetToken(user);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        email,
        password: hashedPassword,
        profilePicture: profilePic,
        displayName: email,
        providerId: 'viaPassword',
        phoneNumber: '',
        isActive: false,
      });

      await sendVerificationEmail(user);
      return new Response(
        JSON.stringify({ message: 'Account created. Verification email sent.', type: 'info' }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ message: error.message, type: 'error' }),
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
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
 const DOMAIN = process.env.DOMAIN;
 const verificationLink = `https://${DOMAIN}/page/verify/${encodeURIComponent(token)}`;

  console.log(verificationLink);

  await sendMail({
    email: user.email,
    subject: 'Verify Your Email – Sudip Sharma Blog',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto; background-color: #f4f4f9;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          Welcome to the <strong>Sudip Sharma Blog</strong>. Please verify your email by clicking the button below. This link will expire in 15 minutes.
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
    { id: user._id, email: user.email, role: user.role, isActive: user.isActive },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const cookie = serialize('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'strict',
  });

  const userData = { ...user.toObject(), password: undefined };

  return new Response(
    JSON.stringify({ 
      message: `Welcome ${userData.displayName}!`, 
      user: userData, 
      type: 'success' 
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

export async function PUT(req) {
  try {
    const { verificationToken } = await req.json();

    if (!verificationToken) {
      return new Response(
        JSON.stringify({ error: 'Verification token is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    // Verify the JWT
    const { userID, userEmail, otp, eotp } = jwt.verify(verificationToken, process.env.JWT_SECRET);
    console.log('userID:', userID , 'userEmail:', userEmail, 'otp:', otp, 'eotp:', eotp);

    if (!userID || !userEmail || !otp || !eotp) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification token.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the OTP has expired
    if (Date.now() > new Date(eotp).getTime()) {
      return new Response(
        JSON.stringify({ error: 'Verification token has expired.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to the database
    await connect();

    // Find the user by ID
    const userData = await User.findById(userID);

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  console.log("Incoming OTP:", otp);
  console.log("User OTP:", userData.otp);
    // Check if the OTP matches
    if (userData.otp != otp) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Activate the user account
    userData.isActive = true;
    userData.otp = null; 
    userData.otpExpiresAt = null;
    await userData.save();

    // Return a success response
    return new Response(
      JSON.stringify({ message: 'Account successfully verified.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error.message);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification token.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}