import mongoose from 'mongoose';

// This will store the connection state
const connection = {};

// Function to connect to the MongoDB database
async function connect() {
  // Check if the connection object is already set to 'true' (i.e., connected)
  if (connection.isconnected) {
    console.log('Already connected');
    return;
  }

  try {
    // Connect to MongoDB
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    // Set the connection state to true when the connection is successful
    connection.isconnected = db.connections[0].readyState === 1; // 1 means connected

    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to database: ', error);
    process.exit(1); // Exit the process on failure
  }
}

export { connect };
