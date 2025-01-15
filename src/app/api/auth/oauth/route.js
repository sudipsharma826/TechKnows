import User from '@/lib/models/userModel'; // Your User model
import connect from '@/lib/mongodb/mongoose'; // MongoDB connection
import { serialize } from 'cookie'; // For setting JWT cookies

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

      // Return the existing user data, excluding the password
      const userData = { ...existingUser.toObject(), password: undefined };

      return new Response(
        JSON.stringify({
          message: 'User logged in successfully',
          user: userData,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
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
      });

      // Return the newly created user data, excluding the password
      const userData = { ...newUser.toObject(), password: undefined };

      return new Response(
        JSON.stringify({
          message: 'User created successfully',
          user: userData,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
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
