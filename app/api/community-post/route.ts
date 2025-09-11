import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { computePHashFromBuffer } from '@/lib/image-hash';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { image, description, userId } = await req.json();
    if (!image || !description || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Convert base64 image to buffer
    const base64 = image.split(',')[1];
    if (!base64) return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    const buf = Buffer.from(base64, 'base64');

    // Compute perceptual hash
    const hashBuf = await computePHashFromBuffer(buf);
    const imageHash = hashBuf.toString('hex');

    // Check for duplicate
    const { data: existing } = await supabase
      .from('community_posts')
      .select('id')
      .eq('image_hash', imageHash)
      .single();
    if (existing) return NextResponse.json({ error: 'This design already exists in the Community Hub.' }, { status: 409 });

    // Upload image to Supabase Storage
    const fileName = `kolam_${Date.now()}.png`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('kolam_images')
      .upload(fileName, buf, { contentType: 'image/png' });
    if (storageError) return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
    const publicUrl = supabase.storage.from('kolam_images').getPublicUrl(fileName).data.publicUrl;

    // Insert post
    const { error: postError } = await supabase
      .from('community_posts')
      .insert([{
        user_id: userId,
        image_url: publicUrl,
        image_hash: imageHash,
        description,
        karma_awarded: true
      }]);
    if (postError) return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 });

    // Award karma
    const { data: profile } = await supabase
      .from('profiles')
      .select('kolam_karma')
      .eq('id', userId)
      .single();
    const currentKarma = profile?.kolam_karma ?? 0;
    const { error: karmaError } = await supabase
      .from('profiles')
      .update({ kolam_karma: currentKarma + 10 })
      .eq('id', userId);
    if (karmaError) return NextResponse.json({ error: 'Failed to update karma.' }, { status: 500 });

    // Refetch updated karma
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('kolam_karma')
      .eq('id', userId)
      .single();

  return NextResponse.json({ success: true, imageUrl: publicUrl, karma: updatedProfile?.kolam_karma ?? null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
