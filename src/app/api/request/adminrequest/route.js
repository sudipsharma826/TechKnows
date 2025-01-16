import Request from "../../../../lib/models/requestModel";  
import connect from '../../../../lib/mongodb/mongoose';  

export async function POST(req, res) {
  try {
   
    const { userId, requestType, description } = await req.json();

    
    if (!userId || !requestType || !description) {
      return new Response(
        JSON.stringify({ error: 'userId, requestType, and description are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

   
    const validRequestTypes = requestType;
    if (!validRequestTypes.includes(requestType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid requestType. Allowed types: Admin' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to the database
    await connect();

    // Create the new request entry using the Request model
    const newRequest = new Request({
      requestedDate: new Date(),
      requestedBy: userId, 
      requestType,
      description,
      status: 'pending',
      checkedBy: null,
      checkedDate: null,

    });

    // Save the new request to the database
    await newRequest.save();

    // Respond with success message
    return new Response(
      JSON.stringify({ message: 'Request submitted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error during request submission:', error);
    return new Response(
      JSON.stringify({ error: 'Error during request submission' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
