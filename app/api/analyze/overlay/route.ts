import { NextRequest, NextResponse } from 'next/server'
import Jimp from 'jimp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Return a PNG with detected dot centroids drawn as red circles.
export async function POST(req: NextRequest) {
  try {
  const form = await req.formData()
  const file = form.get('image') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  // Check if client requests JSON only (for dot data)
  const wantJson = form.get('json') === '1'
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const image = await Jimp.read(buffer)
  image.grayscale()
  const { width, height } = image.bitmap

    // Histogram + Otsu-like threshold (matching main analyzer)
    const hist = new Array<number>(256).fill(0)
    for (let i = 0; i < image.bitmap.data.length; i += 4) {
      hist[image.bitmap.data[i]]++
    }
    const total = width * height
    let sum = 0
    for (let i = 0; i < 256; i++) sum += i * hist[i]
    let sumB = 0
    let wB = 0
    let varMax = 0
    let otsu = 127
    for (let t = 0; t < 256; t++) {
      wB += hist[t]
      if (wB === 0) continue
      const wF = total - wB
      if (wF === 0) break
      sumB += t * hist[t]
      const mB = sumB / wB
      const mF = (sum - sumB) / wF
      const between = wB * wF * (mB - mF) * (mB - mF)
      if (between > varMax) {
        varMax = between
        otsu = t
      }
    }
    const threshold = Math.min(255, Math.max(0, otsu + 10))

    const within = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height
    const getIdx = (x: number, y: number) => (y * width + x) * 4
    const isDotPixel = (x: number, y: number) => {
      const idx = getIdx(x, y)
      const v = image.bitmap.data[idx]
      return v > threshold
    }

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ] as const

    const visited = new Set<string>()
    const key = (x: number, y: number) => `${x},${y}`
    const centroids: { x: number; y: number; size: number }[] = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const k = key(x, y)
        if (visited.has(k)) continue
        if (!isDotPixel(x, y)) continue
        // flood fill
        let q: [number, number][] = [[x, y]]
        visited.add(k)
        let size = 0
        let sumX = 0
        let sumY = 0
        while (q.length) {
          const [cx, cy] = q.pop()!
          size++
          sumX += cx
          sumY += cy
          for (const [dx, dy] of dirs) {
            const nx = cx + dx
            const ny = cy + dy
            if (!within(nx, ny)) continue
            const nk = key(nx, ny)
            if (visited.has(nk)) continue
            if (isDotPixel(nx, ny)) {
              visited.add(nk)
              q.push([nx, ny])
            }
          }
        }
        const maxSize = Math.min(8000, Math.floor((width * height) / 6))
        if (size > 12 && size < maxSize) {
          centroids.push({ x: Math.round(sumX / size), y: Math.round(sumY / size), size })
        }
      }
    }

    if (wantJson) {
      // Return dot data as JSON
      return NextResponse.json({
        dot_count: centroids.length,
        centroids: centroids
      }, { status: 200 })
    }

    // Draw overlay: copy original (colored) and paint red circles at centroids
    const overlay = await Jimp.read(buffer) // original color
    const radius = Math.max(3, Math.round(Math.min(width, height) * 0.01))
    const red = Jimp.rgbaToInt(220, 50, 50, 255)
    const white = Jimp.rgbaToInt(255, 255, 255, 220)
    for (let i = 0; i < centroids.length; i++) {
      const c = centroids[i]
      // filled circle
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const px = c.x + dx
          const py = c.y + dy
          if (!within(px, py)) continue
          if (dx * dx + dy * dy <= radius * radius) {
            overlay.setPixelColor(red, px, py)
          }
        }
      }
      // small white center for contrast
      if (within(c.x, c.y)) overlay.setPixelColor(white, c.x, c.y)
    }

    const out = await overlay.getBufferAsync(Jimp.MIME_PNG)
    // Convert Buffer to ArrayBuffer slice for NextResponse typing
    const ab = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength)
    const u8 = new Uint8Array(ab)
    // Add dot count in custom header
    return new NextResponse(u8 as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'X-Dot-Count': centroids.length.toString()
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 })
  }
}
