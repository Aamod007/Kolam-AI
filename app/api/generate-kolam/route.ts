import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      kolamType,
      gridSize,
      symmetryType,
      pathStyle,
      dotGridType,
      culturalContext,
    } = body;

    // Load Kolam types from file
    const fs = require('fs');
    const path = require('path');
    const kolamTypesPath = path.join(process.cwd(), 'archive', 'ListOfKolamtypes', 'AllKolamtypeslist.txt');
    let kolamTypeNames: string[] = [];
    try {
      const txt = fs.readFileSync(kolamTypesPath, 'utf8');
      const matches = Array.from(txt.matchAll(/\*\*(.+?)\*\*/g)) as RegExpMatchArray[];
      kolamTypeNames = matches.map(m => typeof m[1] === 'string' ? m[1].split('(')[0].trim() : '').filter(Boolean);
    } catch {}
    const kolamTypeListText = kolamTypeNames.length ? kolamTypeNames.join(', ') : kolamType;

  // Compose prompt with all kolam types and plain background requirement
  const prompt = `Kolam types: ${kolamTypeListText}\nGenerate a ${kolamType} Kolam with ${symmetryType} symmetry and ${pathStyle} line paths. Use a ${dotGridType} with ${gridSize} grid size. Context: ${culturalContext}. IMPORTANT: The generated Kolam should be on a plain white or black background (no shadows, no textures, no gradients) so the background can be easily removed for AR functionality.`;

    // Gemini API call
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAQhLgkTPYP83KQ5v21P2uihzb2OBdLDBg';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    const result = await model.generateContent(prompt);
    let imageUrl = null;
    let details = '';
    if (result && result.response && result.response.candidates && result.response.candidates[0]?.content?.parts) {
      for (const part of result.response.candidates[0].content.parts) {
        if (part.text) details += part.text;
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          imageUrl = `data:image/png;base64,${imageData}`;
        }
      }
    }
    return NextResponse.json({ imageUrl, details });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Kolam generation failed' }, { status: 500 });
  }
}
