import mongoose from 'mongoose';

const connection = {};

// Function to connect to the MongoDB database
async function connect() {
  // Check if the connection object is already set to 'true' (i.e., connected)
  if (connection.isconnected) {
    console.log('Already connected');
    return mongoose.connections[0]; // Return the already connected mongoose connection
  }

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      
    });

    // Set the connection state to true when the connection is successful
    connection.isconnected = mongoose.connections[0].readyState === 1; // 1 means connected

    console.log('Connected to the database');
    return mongoose.connections[0]; // Return the actual connection
  } catch (error) {
    console.error('Error connecting to database: ', error);
    process.exit(1);
  }
}

export default connect;
