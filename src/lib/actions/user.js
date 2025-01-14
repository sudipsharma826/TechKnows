import User from '../../lib/models/userModel.js';
import connect from '../../lib/mongodb/mongoose.js';

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_address,
  username,
  created_at,
  updated_at
) => {
  try {
    await connect();
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          profilePicture: image_url,
          email: email_address[0].email_address,
          username,
          createdAt: created_at,
          updatedAt: updated_at,
        },
      },
      { new: true, upsert: true }
    );
    return user;
  } catch (error) {
    console.error('Error in createOrUpdateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();
    const result = await User.findOneAndDelete({ clerkId: id });
    if (!result) {
      console.warn('User not found for deletion:', id);
    }
    return result;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};
