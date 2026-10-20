import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the uploaded file to your public/uploads folder
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const filepath = path.join(process.cwd(), 'public/uploads', filename);
    
    await writeFile(filepath, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      message: 'Prescription uploaded successfully!' 
    });

  } catch (error) {
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}