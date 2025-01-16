import User from '@/lib/models/userModel'; // Your User model
import connect from '@/lib/mongodb/mongoose'; // MongoDB connection
import { serialize } from 'cookie'; // For setting cookies
import jwt from 'jsonwebtoken'; // For generating JWT

export async function POST(req) {
  try {
    await connect();

    // Get OAuth data from the request body
    const { displayName, email, photoURL, phoneNumber, providerId } = await req.json();

    // Check for essential data
    if (!email || !providerId) {
      return new Response(
        JSON.stringify({ error: 'Email and providerId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user already exists based on the email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists, update profile picture if it's different
      if (photoURL && existingUser.profilePicture !== photoURL) {
        existingUser.profilePicture = photoURL;
        await existingUser.save();
      }

      // Create a JWT token
      const token = jwt.sign(
        { userId: existingUser._id, name: existingUser.displayName, role: existingUser.role },
        process.env.JWT_SECRET, // Set your secret key in the environment variables
        { expiresIn: '1h' } // Token expiration time (optional)
      );

      // Set the token in a cookie
      const serialized = serialize('acesstoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      // Return the existing user data with the token
      const userData = { ...existingUser.toObject(), password: undefined };

      return new Response(
        JSON.stringify({
          message: 'User logged in successfully',
          user: userData,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': serialized,
          },
        }
      );
    } else {
      // If user doesn't exist, create a new one
      const newUser = await User.create({
        email,
        displayName,
        profilePicture: photoURL,
        providerId,
        phoneNumber: phoneNumber || '',
        isActive: true,
      });

      // Create a JWT token for the new user
      const token = jwt.sign(
        { userId: newUser._id, name: newUser.displayName, role: newUser.role },
        process.env.JWT_SECRET, // Set your secret key in the environment variables
        { expiresIn: '1h' } // Token expiration time (optional)
      );

      // Set the token in a cookie
      const serialized = serialize('acesstoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });

      // Return the newly created user data with the token
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
            'Set-Cookie': serialized,
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
