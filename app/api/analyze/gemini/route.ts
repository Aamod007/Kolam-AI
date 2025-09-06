import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

type Analysis = {
  kolamType?: string
  kolamTypeNormalized?: string
  reportedName?: string
  principle?: string
  explanation?: string
  symmetry?: string[]
  symmetryConfidence?: number
  spiritual?: string
  spiritualAssessment?: { home?: string; shop?: string }
  grid?: { rows: number | null; cols: number | null; dotCount: number | null }
  classification?: { label: string; confidence: number; source: 'cv' | 'dataset' | 'gemini'; details?: Record<string, any> }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This route proxies the uploaded image to an external Gemini-like API for a more
// comprehensive analysis. It's guarded by environment variables to avoid accidental
// external calls in development.

export async function POST(req: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  const GEMINI_URL = process.env.GEMINI_URL // optional full URL to proxy to
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

  if (!GEMINI_API_KEY && !GEMINI_URL) {
    return NextResponse.json({ error: 'Gemini not configured' }, { status: 501 })
  }

  const form = await req.formData()
  const file = form.get('image') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  try {
    // Import the Google Generative AI client dynamically. If it's not
    // installed, return 501 and instruct how to configure it.
    let GoogleGenerativeAI: any = null
    try {
      // Use eval to avoid bundler static analysis; this will import at the runtime.
      // @ts-ignore runtime import via eval
      const mod = await eval('import("@google/generative-ai")')
      GoogleGenerativeAI = (mod as any).GoogleGenerativeAI
    } catch (importErr) {
      return NextResponse.json({ error: 'Gemini client not installed. Run: npm install @google/generative-ai and set GEMINI_API_KEY.' }, { status: 501 })
    }

    if (!GoogleGenerativeAI) {
      return NextResponse.json({ error: 'Gemini client unavailable' }, { status: 501 })
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL })

    // Convert file to base64
    const arrayBuffer = await (file as any).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')

    // Load canonical list to include in the prompt so Gemini uses it for primary analysis
    const canonicalListPath = path.join(process.cwd(), 'archive', 'ListOfKolamtypes', 'AllKolamtypeslist.txt')
    let canonicalNames: string[] = []
    try {
      const txt = fs.readFileSync(canonicalListPath, 'utf8')
      const matches = Array.from(txt.matchAll(/^\s*\d+\.\s+\*\*(.+?)\*\*/gm))
      canonicalNames = matches.map(m => m[1].split('(')[0].trim()).filter(Boolean)
    } catch (e) {
      canonicalNames = []
    }

    const canonicalListText = canonicalNames.length ? canonicalNames.join(', ') : 'Pulli Kolam, Sikku Kolam, Freehand Kolam, Tiling Kolam, Rangoli, Muggu, Other'

    const prompt = `You are an authoritative expert on South Asian kolam/rangoli traditions. Use the canonical kolam type list below when deciding the kolamType for this image. If the design does not match any listed name exactly, you are permitted to consult public information (search the internet or external knowledge) to identify the proper name; when you do so, set kolamType to "Other" and include a free-text reportedName with the name you found.

Canonical kolam types: ${canonicalListText}

Instructions (read carefully):
- Analyze the attached image and RETURN ONLY a single JSON object (no markdown, no commentary, no extra fields) that exactly follows the schema described below.
- Prefer exact canonical names from the list above. If you are confident an exact canonical name applies, return it verbatim. If no canonical name matches, return "Other" and set reportedName to the free-text name you believe is correct (from your internet analysis).
- Use numeric values for confidences and counts. Keep explanation to ONE concise sentence.

Required JSON schema (fields and format):
{
  "kolamType": string,                      // One of the canonical names or "Other"
  "reportedName": string | null,            // Free-text name when kolamType is "Other" (otherwise null)
  "kolamTypeNormalized": string | null,    // The canonical name you selected (same as kolamType if canonical), otherwise null
  "principle": string,                      // Short phrase (3-6 words) describing main constructive principle
  "symmetry": string[],                      // Free-form array of symmetry descriptions. Describe any detected horizontal symmetry explicitly (e.g. "Horizontal mirror across midline", "Horizontal reflection at top third"); return [] if none
  "symmetryConfidence": number,             // 0.0 - 1.0
  "grid": { "rows": number | null, "cols": number | null, "dotCount": number | null },
  "classification": { "label": string, "confidence": number, "details": object },
  "spiritual": string,                      // Short spiritual note or single-word descriptor (e.g. "auspicious", "neutral", "protective")
  "spiritualAssessment": { "home": string, "shop": string }, // Short suitability note for home and shop (one sentence each)
  "explanation": string                      // ONE concise sentence explaining the choice
}

Example valid output (copy shape exactly):
{
  "kolamType": "Pulli Kolam",
  "reportedName": null,
  "kolamTypeNormalized": "Pulli Kolam",
  "principle": "dot-grid weaving",
  "symmetry": ["Horizontal Mirror", "Vertical Mirror", "Rotational 4-fold"],
  "symmetryConfidence": 0.92,
  "grid": { "rows": 5, "cols": 5, "dotCount": 25 },
  "classification": { "label": "Pulli - 5x5 grid", "confidence": 0.91, "details": {"nearestDataset":"kolam109"} },
  "spiritual": "auspicious",
  "spiritualAssessment": { "home": "Suitable for home entrance - invites positive energy.", "shop": "Neutral for shops; larger formats work better." },
  "explanation": "The design uses a regular 5x5 dot grid with mirrored motifs and fourfold rotation, typical of Pulli Kolam."
}

Strict rules recap: return JSON only; prefer canonical list names; if returning "Other" include reportedName; set kolamTypeNormalized when you can map to a canonical name. Use numbers for confidences/counts; do not include any text outside the JSON object.`

    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: (file as any).type || 'image/jpeg'
      }
    }

    async function extractJsonFromResponse(raw: string) {
      let jsonText = String(raw || '')
      // Extract fenced code blocks first
      if (jsonText.includes('```json')) {
        const m = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
        if (m) jsonText = m[1].trim()
      } else if (jsonText.includes('```')) {
        const m = jsonText.match(/```\s*([\s\S]*?)\s*```/)
        if (m) jsonText = m[1].trim()
      }
      // Trim leading/trailing non-JSON
      const first = jsonText.indexOf('{')
      const last = jsonText.lastIndexOf('}')
      if (first >= 0 && last > first) jsonText = jsonText.slice(first, last + 1)
      // Remove common markdown escapes
      jsonText = jsonText.replace(/^\s*```[\s\S]*?```\s*$/g, '').trim()
      try {
        return JSON.parse(jsonText)
      } catch (e) {
        return null
      }
    }

    const raw1 = String((await model.generateContent([prompt, imagePart]))?.response?.text?.() ?? '')
    let parsed = await extractJsonFromResponse(raw1)

    // If parsing failed or kolamType is missing, attempt one retry with a corrective instruction
    if (!parsed || !parsed.kolamType) {
      const retryPrompt = `The previous response was not valid JSON matching the requested schema. Return ONLY the JSON object matching the schema exactly. Here was the previous raw response:\n\n${raw1}`
      const raw2 = String((await model.generateContent([retryPrompt, imagePart]))?.response?.text?.() ?? '')
      parsed = parsed ?? (await extractJsonFromResponse(raw2))
    }

  // canonicalNames already loaded above and is reused for normalization

    function normalizeType(t: any) {
      if (!t) return 'Other'
      const s = String(t).toLowerCase().trim()

      // 1) Exact or case-insensitive match from canonical list
      for (const name of canonicalNames) {
        if (name.toLowerCase() === s) return name
      }

      // 2) Substring/token match against canonical list
      for (const name of canonicalNames) {
        const lname = name.toLowerCase()
        if (lname.includes(s) || s.includes(lname)) return name
        // token intersection
        const tokens = lname.split(/\W+/).filter(Boolean)
        const stokens = s.split(/\W+/).filter(Boolean)
        const common = tokens.filter(tok => stokens.includes(tok))
        if (common.length >= 1) return name
      }

      // 3) Heuristic fallback to common short names
      if (s.includes('pulli')) return 'Pulli Kolam'
      if (s.includes('sikku') || s.includes('chikku') || s.includes('chikku')) return 'Sikku Kolam'
      if (s.includes('freehand')) return 'Freehand Kolam'
      if (s.includes('til') || s.includes('tile') || s.includes('tiling')) return 'Tiling Kolam'
      if (s.includes('rangoli')) return 'Rangoli'
      if (s.includes('muggu') || s.includes('muggulu')) return 'Muggu'
      return 'Other'
    }

    if (parsed && parsed.kolamType) {
      const original = String(parsed.kolamType)
      const normalized = normalizeType(original)
      parsed.kolamTypeNormalized = normalized
      // If normalization led to Other, keep the model's reported name in reportedName
      if (normalized === 'Other') {
        parsed.reportedName = parsed.reportedName ?? original
        parsed.kolamType = 'Other'
      } else {
        parsed.kolamType = normalized
      }
    }

    // Build response using Gemini parsed output as the primary analysis source
    const analysis: Analysis = {
      kolamType: parsed?.kolamType ?? undefined,
      kolamTypeNormalized: parsed?.kolamTypeNormalized ?? undefined,
      reportedName: parsed?.reportedName ?? undefined,
      principle: parsed?.principle ?? undefined,
  spiritual: parsed?.spiritual ?? undefined,
  spiritualAssessment: parsed?.spiritualAssessment ?? undefined,
      explanation: parsed?.explanation ?? undefined,
      symmetry: parsed?.symmetry ?? undefined,
      symmetryConfidence: typeof parsed?.symmetryConfidence === 'number' ? parsed.symmetryConfidence : undefined,
      grid: parsed?.grid
        ? {
            rows: parsed.grid.rows ?? null,
            cols: parsed.grid.cols ?? null,
            dotCount: parsed.grid.dotCount ?? null,
          }
        : undefined,
      classification: parsed?.classification ? { ...parsed.classification, source: 'gemini' } : undefined,
    }

    // Return the full parsed object so UI can display kolamType/principle/explanation too
    return NextResponse.json({ analysis, raw: parsed })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
