import connect from '@/lib/mongodb/mongoose';
import Package from '@/lib/models/packageModel';

export async function POST(req) {
  await connect();

  try {
    const { name, price, expiryTime, description } = await req.json();

    if (!name || !price || !expiryTime || !description) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const newPackage = await Package.create({ name, price, expiryTime, description });

    return new Response(
      JSON.stringify({ success: true, message: 'Package created successfully', data: newPackage }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(req) {
  await connect();

  try {
    const packages = await Package.find({});

    return new Response(
      JSON.stringify({ success: true, data: packages }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PUT(req) {
  await connect();

  try {
    const { id, name, price, expiryTime, description } = await req.json();

    if (!id || !name || !price || !expiryTime || !description) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { name, price, expiryTime, description },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return new Response(
        JSON.stringify({ success: false, message: 'Package not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Package updated successfully', data: updatedPackage }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(req) {
  await connect();

  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing package ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return new Response(
        JSON.stringify({ success: false, message: 'Package not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Package deleted successfully', data: deletedPackage }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
