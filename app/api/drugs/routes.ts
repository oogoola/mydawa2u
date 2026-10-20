import { NextResponse } from 'next/server';

// In-memory or database handler (you can later connect this to MongoDB, PostgreSQL, or Supabase)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate incoming drug data
    if (!body.name || !body.priceKsh) {
      return NextResponse.json({ error: 'Drug name and price are required' }, { status: 400 });
    }

    // Here you would normally save to your database, e.g.:
    // await db.drugs.create({ data: body });

    return NextResponse.json({ 
      success: true, 
      message: 'Drug added successfully!',
      data: body 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}