import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';


export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const { id } = evt?.data;
  const eventType = evt?.type;
  console.log(`Webhook received: ID = ${id}, Type = ${eventType}`);
  console.log('Webhook body:', body);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, first_name, last_name, image_url, email_addresses, username, created_at, updated_at } = evt?.data;

    console.log('Event Data:', evt?.data);

    try {
      if (!id || !email_addresses || !created_at || !updated_at) {
        throw new Error('Missing required user data');
      }

      const user = await createOrUpdateUser(
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        username,
        created_at,
        updated_at
      );

      console.log('User successfully created or updated:', user);
    } catch (error) {
      console.error('Error creating or updating user:', error);
      return new Response('Error processing user data', { status: 400 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt?.data;

    try {
      if (!id) {
        throw new Error('Missing user ID for deletion');
      }

      await deleteUser(id);
      console.log('User successfully deleted');
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error deleting user', { status: 400 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
