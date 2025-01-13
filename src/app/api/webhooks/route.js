import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';

// Ensure the WEBHOOK_SECRET is available
if (!process.env.WEBHOOK_SECRET) {
  throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
}

export async function POST(req) {
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify that all necessary headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.WEBHOOK_SECRET);  // Access the webhook secret from env

  let evt;

  // Verify webhook event signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred while verifying the webhook signature', { status: 400 });
  }

  const { id } = evt?.data;
  const eventType = evt?.type;
  console.log(`Webhook received with ID: ${id} and event type: ${eventType}`);
  console.log('Webhook body:', body);

  // Handle user creation or update
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, image_url, email_addresses, username, created_at, updated_at } = evt?.data;

    console.log('Event Data:', evt?.data);  // Log event data to ensure all values are present.

    // Ensure data integrity and handle missing values
    try {
      if (!id || !email_addresses || !created_at || !updated_at) {
        throw new Error('Missing essential user data');
      }

      // Call the function to create or update the user in your database
      const user = await createOrUpdateUser({
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username,
        created_at,
        updated_at,
      });

      console.log('User created or updated:', user);
    } catch (error) {
      console.log('Error creating or updating user:', error);
      return new Response('Error occurred while processing user data', { status: 400 });
    }
  }

  // Handle user deletion
  if (eventType === 'user.deleted') {
    const { id } = evt?.data;
    try {
      // Ensure the user ID is provided
      if (!id) {
        throw new Error('User ID missing for deletion');
      }

      await deleteUser(id);
      console.log('User deleted successfully');
    } catch (error) {
      console.log('Error deleting user:', error);
      return new Response('Error occurred while deleting user', { status: 400 });
    }
  }

  // Return a successful response
  return new Response('Webhook processed successfully', { status: 200 });
}
