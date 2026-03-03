import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const db = await getDb();
    const keyData = await db.collection('removebg_keys').find({ usage_count: { $lt: 50 } }).sort({ usage_count: -1 }).toArray();

    if (!keyData || keyData.length === 0) {
      return NextResponse.json({ error: 'No available remove.bg API key.' }, { status: 500 });
    }

    let lastError = null;
    for (const apiKeyRow of keyData) {
      const apiKey = apiKeyRow.api_key;
      // Call remove.bg API
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: (() => {
          const form = new FormData();
          form.append('image_file', new Blob([buffer]), 'kolam.png');
          form.append('size', 'auto');
          return form;
        })(),
      });

      if (response.ok) {
        // Increment usage_count
        await db.collection('removebg_keys').updateOne(
          { _id: apiKeyRow._id },
          { $inc: { usage_count: 1 } }
        );

        // Delete key if usage_count reaches 50
        if (apiKeyRow.usage_count + 1 >= 50) {
          await db.collection('removebg_keys').deleteOne({ _id: apiKeyRow._id });
        }

        const resultBuffer = Buffer.from(await response.arrayBuffer());
        return new NextResponse(resultBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'inline; filename="removed.png"',
          },
        });
      } else {
        lastError = await response.text();
        // Try next key
      }
    }
    // If all keys failed
    return NextResponse.json({ error: lastError || 'All remove.bg API keys failed.' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

