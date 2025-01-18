import User from '@/lib/models/userModel';
import connect from '@/lib/mongodb/mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    await connect();

    const { email, password, profilePic } = await req.json();

    // Check for missing fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and providerId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure JWT_SECRET is present in environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    const user = await User.findOne({ email });

    if (user) {
      // Check password validity
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Handle profile picture change
      if (profilePic && user.profilePicture !== profilePic) {
        user.profilePicture = profilePic;
        await user.save();
      }

     
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Mark user as active
      user.isActive = true;
      await user.save();

      // Set the token in a cookie
      const cookie = serialize('acesstoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
        sameSite: 'strict',
      });

      // Hide the password field from the response
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
    } else {
      // If user does not exist, create a new user
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user with all the required fields
      const newUser = await User.create({
        email,
        password: hashedPassword,
        profilePicture: profilePic,
        displayName: email,
        providerId: "viaPassword",
        phoneNumber: "",
        isActive: true,
      });

      
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Set the token in a cookie
      const cookie = serialize('acesstoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
        sameSite: 'strict',
      });

      // Hide the password field from the response
      const userData = { ...newUser.toObject(), password: undefined };

      return new Response(
        JSON.stringify({
          message: 'User created successfully',
          user: userData,
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie,
          },
        }
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
