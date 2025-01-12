import mongoose from 'mongoose';

let initialized = false;

export const connect = async () => {
  if (initialized) {
    console.log('Already connected to MongoDB');
    return;
  }

  // Set mongoose options to avoid deprecated warnings
  mongoose.set('strictQuery', false); // depending on your use case, you might want to set it to false
  
  // Check if MONGODB_URI is defined
  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI is not set in environment variables');
    return;
  }

  console.log('Connecting to MongoDB', process.env.MONGODB_URI);

  try {
    // Check if the database connection is already established
    if (mongoose.connection.readyState === 1) {
      console.log('Already connected to MongoDB');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'next-blog',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');
    initialized = true;
  } catch (error) {
    console.log('Error connecting to MongoDB:', error);
  }
};
