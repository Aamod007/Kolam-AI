import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { computePHashFromBuffer } from '@/lib/image-hash';

export async function POST(req: NextRequest) {
  try {
    const { image, description, userId } = await req.json();
    if (!image || !description || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Convert base64 image to buffer to compute hash
    // The image comes as a data URI: data:image/png;base64,...
    let base64 = image;
    if (image.includes(',')) {
      base64 = image.split(',')[1];
    }

    if (!base64) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    const buf = Buffer.from(base64, 'base64');

    // Compute perceptual hash
    const hashBuf = await computePHashFromBuffer(buf);
    const imageHash = hashBuf.toString('hex');

    const db = await getDb();

    // Check for duplicate
    const existing = await db.collection('posts').findOne({ image_hash: imageHash });
    if (existing) {
      return NextResponse.json({ error: 'This design already exists in the Community Hub.' }, { status: 409 });
    }

    // Insert post into MongoDB passing the complete base64 image string directly
    const userObjId = new ObjectId(userId);

    await db.collection('posts').insertOne({
      user_id: userObjId,
      image_data: image, // Store base64 payload instead of S3 url
      image_hash: imageHash,
      description,
      karma_awarded: true,
      created_at: new Date()
    });

    // Award karma to the user
    await db.collection('users').updateOne(
      { _id: userObjId },
      { $inc: { kolam_karma: 10 } }
    );

    // Refetch updated karma
    const updatedUser = await db.collection('users').findOne({ _id: userObjId });

    return NextResponse.json({
      success: true,
      imageUrl: image, // Return the base64 to display immediately in the UI if needed
      karma: updatedUser?.kolam_karma ?? null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
