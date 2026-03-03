import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Dot {
  id: number
  x: number
  y: number
}

interface Line {
  from: { x: number; y: number }
  to: { x: number; y: number }
}

interface PatternConfig {
  rows?: number
  cols?: number
  type?: string
  points?: number
  rings?: number
}

const TEMPLATES: Record<string, PatternConfig> = {
  'pulli_3x3': { rows: 3, cols: 3 },
  'pulli_5x5': { rows: 5, cols: 5 },
  'pulli_7x7': { rows: 7, cols: 7 },
  'pulli_9x9': { rows: 9, cols: 9 },
  'pulli_11x11': { rows: 11, cols: 11 },
  'sikku_basic': { rows: 5, cols: 5, type: 'sikku' },
  'sikku_diagonal': { rows: 5, cols: 5, type: 'sikku_diagonal' },
  'star': { type: 'star', points: 8 },
  'diamond': { type: 'diamond' },
  'spiral': { type: 'spiral' },
  'mandala': { type: 'mandala', rings: 4 },
  'kodi': { type: 'kodi' },
  'padi': { type: 'padi' },
}

const VALID_TEMPLATES = Object.keys(TEMPLATES)
const VALID_SYMMETRIES = ['none', 'horizontal', 'vertical', 'diagonal', 'rotational_90', 'rotational_180', 'radial']
const VALID_GRID_SIZES = [3, 5, 7, 9, 11]

function generatePulliPattern(config: PatternConfig, centerX: number, centerY: number, spacing: number): { dots: Dot[], lines: Line[] } {
  const { rows = 5, cols = 5, type } = config
  const dots: Dot[] = []
  const lines: Line[] = []
  
  const offsetX = (cols - 1) * spacing / 2
  const offsetY = (rows - 1) * spacing / 2
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = centerX + col * spacing - offsetX
      const y = centerY + row * spacing - offsetY
      dots.push({ id: row * cols + col, x, y })
      
      if (col < cols - 1) {
        lines.push({ from: { x, y }, to: { x: x + spacing, y } })
      }
      
      if (row < rows - 1) {
        lines.push({ from: { x, y }, to: { x, y: y + spacing } })
      }
    }
  }
  
  if (type === 'sikku') {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col
        const x = dots[idx].x
        const y = dots[idx].y
        
        if (col < cols - 1 && row < rows - 1) {
          lines.push({
            from: { x, y },
            to: { x: x + spacing, y: y + spacing }
          })
        }
        
        if (col > 0 && row < rows - 1) {
          lines.push({
            from: { x, y },
            to: { x: x - spacing, y: y + spacing }
          })
        }
      }
    }
  }
  
  return { dots, lines }
}

function generateStarPattern(centerX: number, centerY: number): { dots: Dot[], lines: Line[] } {
  const dots: Dot[] = []
  const lines: Line[] = []
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
  
  const innerRadius = 60
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * (i + 0.5)) / numPoints - Math.PI / 2
    const x = centerX + innerRadius * Math.cos(angle)
    const y = centerY + innerRadius * Math.sin(angle)
    
    dots.push({ id: numPoints + i, x, y })
  }
  
  for (let i = 0; i < numPoints; i++) {
    lines.push({
      from: dots[i],
      to: dots[numPoints + i]
    })
    lines.push({
      from: dots[numPoints + i],
      to: dots[(i + 1) % numPoints]
    })
  }
  
  return { dots, lines }
}

function generateSpiralPattern(centerX: number, centerY: number): { dots: Dot[], lines: Line[] } {
  const dots: Dot[] = []
  const lines: Line[] = []
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
  
  return { dots, lines }
}

function generateMandalaPattern(centerX: number, centerY: number, rings: number = 4): { dots: Dot[], lines: Line[] } {
  const dots: Dot[] = []
  const lines: Line[] = []
  const pointsPerRing = 12
  let dotId = 0
  
  dots.push({ id: dotId++, x: centerX, y: centerY })
  
  for (let ring = 1; ring <= rings; ring++) {
    const radius = ring * 35
    
    for (let i = 0; i < pointsPerRing; i++) {
      const angle = (2 * Math.PI * i) / pointsPerRing
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      dots.push({ id: dotId++, x, y })
      
      lines.push({
        from: dots[dots.length - 1],
        to: { 
          x: centerX + radius * Math.cos((2 * Math.PI * (i + 1)) / pointsPerRing), 
          y: centerY + radius * Math.sin((2 * Math.PI * (i + 1)) / pointsPerRing) 
        }
      })
      
      if (ring > 1) {
        lines.push({
          from: dots[dots.length - 1],
          to: dots[dots.length - 1 - pointsPerRing]
        })
      }
    }
  }
  
  return { dots, lines }
}

function generateDiamondPattern(centerX: number, centerY: number, size: number = 5): { dots: Dot[], lines: Line[] } {
  const dots: Dot[] = []
  const lines: Line[] = []
  const spacing = 50
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const x = centerX + (col - (size - 1) / 2) * spacing
      const y = centerY + (row - (size - 1) / 2) * spacing
      dots.push({ id: row * size + col, x, y })
      
      if (col < size - 1) {
        lines.push({
          from: { x, y },
          to: { x: x + spacing / 2, y: y - spacing / 2 }
        })
        lines.push({
          from: { x, y },
          to: { x: x + spacing / 2, y: y + spacing / 2 }
        })
      }
    }
  }
  
  return { dots, lines }
}

function applySymmetry(dots: Dot[], lines: Line[], symmetry: string, centerX: number, centerY: number): { dots: Dot[], lines: Line[] } {
  if (symmetry === 'none') {
    return { dots, lines }
  }
  
  let newDots = [...dots]
  let newLines = [...lines]
  
  if (symmetry === 'horizontal' || symmetry === 'vertical') {
    const axis = symmetry === 'horizontal' ? 'y' : 'x'
    const offset = symmetry === 'horizontal' ? centerY : centerX
    
    const reflectedDots = dots.map(d => ({
      ...d,
      id: d.id + dots.length,
      [axis]: 2 * offset - d[axis]
    }))
    
    const reflectedLines = lines.map(l => ({
      from: { ...l.from, [axis]: 2 * offset - l.from[axis] },
      to: { ...l.to, [axis]: 2 * offset - l.to[axis] }
    }))
    
    newDots = [...newDots, ...reflectedDots]
    newLines = [...newLines, ...reflectedLines]
  }
  
  if (symmetry === 'diagonal') {
    const reflectedDots = dots.map(d => ({
      ...d,
      id: d.id + dots.length,
      x: 2 * centerX - d.x,
      y: 2 * centerY - d.y
    }))
    
    const reflectedLines = lines.map(l => ({
      from: { x: 2 * centerX - l.from.x, y: 2 * centerY - l.from.y },
      to: { x: 2 * centerX - l.to.x, y: 2 * centerY - l.to.y }
    }))
    
    newDots = [...newDots, ...reflectedDots]
    newLines = [...newLines, ...reflectedLines]
  }
  
  if (symmetry === 'rotational_90') {
    for (let angle = 90; angle < 360; angle += 90) {
      const rad = (angle * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      
      const rotatedDots = dots.map(d => ({
        ...d,
        id: d.id + dots.length * (angle / 90),
        x: centerX + (d.x - centerX) * cos - (d.y - centerY) * sin,
        y: centerY + (d.x - centerX) * sin + (d.y - centerY) * cos
      }))
      
      const rotatedLines = lines.map(l => ({
        from: {
          x: centerX + (l.from.x - centerX) * cos - (l.from.y - centerY) * sin,
          y: centerY + (l.from.x - centerX) * sin + (l.from.y - centerY) * cos
        },
        to: {
          x: centerX + (l.to.x - centerX) * cos - (l.to.y - centerY) * sin,
          y: centerY + (l.to.x - centerX) * sin + (l.to.y - centerY) * cos
        }
      }))
      
      newDots = [...newDots, ...rotatedDots]
      newLines = [...newLines, ...rotatedLines]
    }
  }
  
  if (symmetry === 'rotational_180') {
    const rotatedDots = dots.map(d => ({
      ...d,
      id: d.id + dots.length,
      x: 2 * centerX - d.x,
      y: 2 * centerY - d.y
    }))
    
    const rotatedLines = lines.map(l => ({
      from: { x: 2 * centerX - l.from.x, y: 2 * centerY - l.from.y },
      to: { x: 2 * centerX - l.to.x, y: 2 * centerY - l.to.y }
    }))
    
    newDots = [...newDots, ...rotatedDots]
    newLines = [...newLines, ...rotatedLines]
  }
  
  if (symmetry === 'radial') {
    for (let angle = 60; angle < 360; angle += 60) {
      const rad = (angle * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      
      const rotatedDots = dots.map(d => ({
        ...d,
        id: d.id + dots.length * (angle / 60),
        x: centerX + (d.x - centerX) * cos - (d.y - centerY) * sin,
        y: centerY + (d.x - centerX) * sin + (d.y - centerY) * cos
      }))
      
      const rotatedLines = lines.map(l => ({
        from: {
          x: centerX + (l.from.x - centerX) * cos - (l.from.y - centerY) * sin,
          y: centerY + (l.from.x - centerX) * sin + (l.from.y - centerY) * cos
        },
        to: {
          x: centerX + (l.to.x - centerX) * cos - (l.to.y - centerY) * sin,
          y: centerY + (l.to.x - centerX) * sin + (l.to.y - centerY) * cos
        }
      }))
      
      newDots = [...newDots, ...rotatedDots]
      newLines = [...newLines, ...rotatedLines]
    }
  }
  
  return { dots: newDots, lines: newLines }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { template = 'pulli_5x5', gridSize = 5, symmetry = 'none', outputFormat = 'json' } = body
    
    if (!VALID_TEMPLATES.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Valid: ${VALID_TEMPLATES.join(', ')}` },
        { status: 400 }
      )
    }
    
    if (!VALID_SYMMETRIES.includes(symmetry)) {
      return NextResponse.json(
        { error: `Invalid symmetry. Valid: ${VALID_SYMMETRIES.join(', ')}` },
        { status: 400 }
      )
    }
    
    if (!VALID_GRID_SIZES.includes(gridSize)) {
      return NextResponse.json(
        { error: `Invalid grid size. Valid: ${VALID_GRID_SIZES.join(', ')}` },
        { status: 400 }
      )
    }
    
    const centerX = 250
    const centerY = 250
    const spacing = 60
    
    let result: { dots: Dot[], lines: Line[] }
    const config = TEMPLATES[template]
    
    if (template.startsWith('pulli') || template.startsWith('sikku')) {
      const pulliConfig = { rows: gridSize, cols: gridSize, type: config.type }
      result = generatePulliPattern(pulliConfig, centerX, centerY, spacing)
    } else if (template === 'star') {
      result = generateStarPattern(centerX, centerY)
    } else if (template === 'spiral') {
      result = generateSpiralPattern(centerX, centerY)
    } else if (template === 'mandala') {
      result = generateMandalaPattern(centerX, centerY, config.rings || 4)
    } else if (template === 'diamond') {
      result = generateDiamondPattern(centerX, centerY, gridSize)
    } else {
      result = generatePulliPattern({ rows: gridSize, cols: gridSize }, centerX, centerY, spacing)
    }
    
    const withSymmetry = applySymmetry(result.dots, result.lines, symmetry, centerX, centerY)
    
    const response = {
      template,
      grid_size: gridSize,
      symmetry,
      num_dots: withSymmetry.dots.length,
      num_lines: withSymmetry.lines.length,
      dots: withSymmetry.dots,
      lines: withSymmetry.lines,
      construction_steps: withSymmetry.lines,
      principles: {
        construction_rule: `Create a ${template} pattern with ${gridSize}x${gridSize} dot grid using ${symmetry} symmetry`,
        grid_type: 'square_grid',
        grid_rows: gridSize,
        grid_cols: gridSize,
        pattern_type: template.split('_')[0],
        path_type: 'continuous',
        is_continuous: true,
        uses_symmetry: symmetry !== 'none',
        symmetry_type: symmetry
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    templates: VALID_TEMPLATES,
    symmetries: VALID_SYMMETRIES,
    grid_sizes: VALID_GRID_SIZES,
    example: {
      template: 'pulli_5x5',
      gridSize: 5,
      symmetry: 'horizontal'
    }
  })
}
