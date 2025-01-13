import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(req) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const webhook = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = webhook.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Log the verified event
  console.log('Verified event:', evt);

  const { id: eventId, type: eventType, data } = evt || {};
  console.log(`Webhook received: ID = ${eventId}, Type = ${eventType}`);
  console.log('Webhook body:', body);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      if (!data || !data.id || !data.first_name || !data.last_name || !data.email_addresses) {
        console.error('Invalid event data:', data);
        return new Response('Invalid event data', { status: 400 });
      }

      const {
        id,
        first_name,
        last_name,
        image_url,
        email_addresses,
        created_at,
        updated_at,
        username,
      } = data;

      const email = email_addresses?.[0]?.email_address || null;

      // Save or update the user in your database
      const user = await createOrUpdateUser({
        id,
        first_name,
        last_name,
        image_url,
        email,
        username,
        created_at,
        updated_at,
      });

      if (user && eventType === 'user.created') {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: {
            userMongoId: user._id,
            isAdmin: user.isAdmin,
          },
        });
      }
    }

    if (eventType === 'user.deleted') {
      const { id: clerkId } = data;
      await deleteUser(clerkId);
    }
  } catch (error) {
    console.error(`Error handling webhook event: ${eventType}`, error);
    return new Response('Error handling webhook', { status: 500 });
  }

  return new Response('Webhook handled successfully', { status: 200 });
}
