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
    return new Response(null, {
      status: 302,
      headers: { Location: '/auth/login' },
    });
  }

  const eventType = evt?.type;
  console.log(`Webhook received: Type = ${eventType}`);
  console.log('Webhook body:', body);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, first_name, last_name, image_url, email_addresses, username, created_at, updated_at } = evt?.data;

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
    }

    if (eventType === 'user.deleted') {
      const { id } = evt?.data;

      if (!id) {
        throw new Error('Missing user ID for deletion');
      }

      await deleteUser(id);
      console.log('User successfully deleted');
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    return new Response(null, {
      status: 302,
      headers: { Location: '/auth/login' },
    });
  }
}
