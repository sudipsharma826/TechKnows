import connect from '../../../../lib/mongodb/mongoose'; 

export async function POST(req, res) {
  const { userId } = await req.json();
  console.log('userId', userId);

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'UserId is Required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Connect to the database
    const connection = await connect();
    const db = connection.db;

    // Update the user's isActive field to false
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { isActive: false } }
    );

    // Clear the authentication token cookie directly using Set-Cookie header
    const headers = new Headers();
    headers.set(
      'Set-Cookie', 
      'acessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict; Secure'
    );

    return new Response(
      JSON.stringify({ message: 'User logged out successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...Object.fromEntries(headers.entries()) } }
    );
  } catch (error) {
    console.error('Error during logout:', error);
    return new Response(
      JSON.stringify({ error: 'Error during logout' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
