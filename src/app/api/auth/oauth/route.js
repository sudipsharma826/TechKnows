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

      // Create a JWT token with expiration from the environment variable
      const token = jwt.sign(
        { userId: existingUser._id, name: existingUser.displayName, role: existingUser.role ,isActive: existingUser.isActive},
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN } 
      );

      // Set the token in a cookie
      const serialized = serialize('acesstoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict',
        maxAge: 60 * 60 * 24 * 7, 
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

      // Create a JWT token for the new user with expiration from the environment variable
      const token = jwt.sign(
        { userId: newUser._id, name: newUser.displayName, role: newUser.role , isActive: newUser.isActive},
        process.env.JWT_SECRET, // Set your secret key in the environment variables
        { expiresIn: process.env.JWT_EXPIRES_IN} 
      );

      // Set the token in a cookie
      const serialized = serialize('acesstoken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict',
        maxAge: 60 * 60 * 24 * 7, 
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
