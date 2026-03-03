import { NextRequest, NextResponse } from 'next/server'
import { KolamAnalyzer } from './kolam-analyzer'
import { KolamGenerator, generate_kolam } from './kolam-generator'


const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'


async function analyzeWithPython(imageData: Buffer): Promise<any> {
  try {
    const formData = new FormData()
    const blob = new Blob([imageData])
    formData.append('file', blob, 'kolam.png')
    
    const response = await fetch(`${PYTHON_API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Python API error: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Python API unavailable, using local fallback:', error)
    return null
  }
}


function analyzeLocally(imageData: Buffer): any {
  return {
    message: "Local analysis - install Python backend for full analysis",
    python_backend_required: true,
    setup_instructions: "Run: cd python && pip install -r requirements.txt && python main.py"
  }
}


function generateLocally(template: string, gridSize: number, symmetry: string): any {
  const patterns: Record<string, any> = {
    'pulli_3x3': { rows: 3, cols: 3 },
    'pulli_5x5': { rows: 5, cols: 5 },
    'pulli_7x7': { rows: 7, cols: 7 },
    'sikku_basic': { rows: 5, cols: 5, type: 'sikku' },
    'star': { type: 'star', points: 8 },
    'diamond': { type: 'diamond' },
    'spiral': { type: 'spiral' },
    'mandala': { type: 'mandala', rings: 4 }
  }
  
  const config = patterns[template] || patterns['pulli_5x5']
  
  const spacing = 60
  const offset = ((config.rows || 5) - 1) * spacing / 2
  const centerX = 250
  const centerY = 250
  
  const dots: Array<{id: number, x: number, y: number}> = []
  const lines: Array<{from: {x: number, y: number}, to: {x: number, y: number}}> = []
  
  if (config.rows && config.cols) {
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const x = centerX + col * spacing - offset
        const y = centerY + row * spacing - offset
        dots.push({ id: row * config.cols + col, x, y })
        
        if (col < config.cols - 1) {
          lines.push({
            from: { x, y },
            to: { x: x + spacing, y }
          })
        }
        
        if (row < config.rows - 1) {
          lines.push({
            from: { x, y },
            to: { x, y: y + spacing }
          })
        }
      }
    }
  }
  
  if (template === 'spiral') {
    dots.length = 0
    lines.length = 0
    
    const numTurns = 4
    const pointsPerTurn = 20
    
    for (let i = 0; i < numTurns * pointsPerTurn; i++) {
      const angle = (2 * Math.PI * i) / pointsPerTurn
      const radius = 10 + (i / (numTurns * pointsPerTurn)) * 140
      
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      dots.push({ id: i, x, y })
      
      if (i > 0) {
        lines.push({
          from: dots[i - 1],
          to: { x, y }
        })
      }
    }
  }
  
  if (template === 'mandala') {
    dots.length = 0
    lines.length = 0
    
    const numRings = 4
    const pointsPerRing = 12
    let dotId = 0
    
    for (let ring = 1; ring <= numRings; ring++) {
      const radius = ring * 35
      
      for (let i = 0; i < pointsPerRing; i++) {
        const angle = (2 * Math.PI * i) / pointsPerRing
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        
        dots.push({ id: dotId++, x, y })
        
        lines.push({
          from: dots[dots.length - 1],
          to: { x: centerX + radius * Math.cos((2 * Math.PI * (i + 1)) / pointsPerRing), 
                y: centerY + radius * Math.sin((2 * Math.PI * (i + 1)) / pointsPerRing) }
        })
        
        if (ring > 1) {
          lines.push({
            from: dots[dots.length - 1],
            to: dots[dots.length - 1 - pointsPerRing]
          })
        }
      }
    }
  }
  
  if (template === 'star') {
    dots.length = 0
    lines.length = 0
    
    const numPoints = 8
    const outerRadius = 150
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints - Math.PI / 2
      const x = centerX + outerRadius * Math.cos(angle)
      const y = centerY + outerRadius * Math.sin(angle)
      
      dots.push({ id: i, x, y })
      lines.push({
        from: dots[i],
        to: dots[(i + 1) % numPoints]
      })
    }
  }
  
  const symmetryMap: Record<string, string[]> = {
    'horizontal': ['horizontal'],
    'vertical': ['vertical'],
    'diagonal': ['diagonal'],
    'rotational_90': ['rotational_90'],
    'rotational_180': ['rotational_180'],
    'radial': ['radial']
  }
  
  let finalDots = [...dots]
  let finalLines = [...lines]
  
  if (symmetry !== 'none' && symmetryMap[symmetry]) {
    const reflectedDots = finalDots.map(d => ({
      ...d,
      x: 500 - d.x,
      id: d.id + finalDots.length
    }))
    const reflectedLines = finalLines.map(l => ({
      from: { x: 500 - l.from.x, y: l.from.y },
      to: { x: 500 - l.to.x, y: l.to.y }
    }))
    
    finalDots = [...finalDots, ...reflectedDots]
    finalLines = [...finalLines, ...reflectedLines]
  }
  
  return {
    template,
    grid_size: gridSize,
    symmetry,
    num_dots: finalDots.length,
    num_lines: finalLines.length,
    dots: finalDots,
    lines: finalLines,
    construction_steps: finalLines,
    principles: {
      construction_rule: `Create a ${template} pattern with ${gridSize}x${gridSize} grid`,
      grid_type: 'square_grid',
      grid_rows: config.rows || gridSize,
      grid_cols: config.cols || gridSize,
      pattern_type: config.type || template.split('_')[0],
      uses_symmetry: symmetry !== 'none',
      symmetry_type: symmetry
    }
  }
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    const pythonResult = await analyzeWithPython(buffer)
    
    if (pythonResult) {
      return NextResponse.json(pythonResult)
    }
    
    const localResult = analyzeLocally(buffer)
    return NextResponse.json(localResult)
    
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
