import User from '@/lib/models/userModel';
import connect from '@/lib/mongodb/mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(req) {
  try {
    await connect();

    // Parse the incoming request body
    const body = await req.json();
    const { email, password } = body;

    console.log('Email:', email);
    console.log('Password:', password);

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      // Verify the password
      console.log('User found:', userExists);
      const isMatch = await bcrypt.compare(password, userExists.password);

      if (isMatch) {
        // Generate a JWT token
        const token = jwt.sign(
          { id: userExists._id, email: userExists.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_expiresIn || '7d' } // Default to 7 days if undefined
        );

        // Set the token in an HttpOnly cookie
        const cookie = serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          sameSite: 'strict',
        });

        // Remove the password from the user object before sending it
        const userData = userExists.toObject();
        delete userData.password;

        return new Response(
          JSON.stringify({
            message: 'User signed in successfully',
            user: userData,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': cookie, // Attach the cookie
            },
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // If the user doesn't exist, create a new one
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const newUser = await User.create({
        clerkId: new Date().getTime().toString(),
        firstName: null,
        lastName: null,
        username: email,
        profilePicture: null,
        isAdmin: false,
        email,
        password: hashedPassword,
      });

      // Generate a JWT token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_expiresIn || '7d' } // Default to 7 days if undefined
      );

      // Set the token in an HttpOnly cookie
      const cookie = serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'strict',
      });

      // Remove the password from the user object before sending it
      const userData = newUser.toObject();
      delete userData.password;

      return new Response(
        JSON.stringify({
          message: 'User created successfully',
          user: userData,
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie, // Attach the cookie
          },
        }
      );
    }
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
