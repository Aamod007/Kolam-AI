export interface PatternDot {
  id: number
  x: number
  y: number
}

export interface PatternLine {
  from: { x: number; y: number }
  to: { x: number; y: number }
}

export interface KolamPattern {
  id: string
  name: string
  nameTamil: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  gridSize: number
  category: string
  dots: PatternDot[]
  lines: PatternLine[]
  steps: PatternStep[]
  tips: string[]
  culturalSignificance: string
}

export interface PatternStep {
  stepNumber: number
  instruction: string
  instructionTamil: string
  highlightDots?: number[]
  linesToDraw: PatternLine[]
}

export const KOLAM_PATTERNS: KolamPattern[] = [
  {
    id: 'pulli-3x3-basic',
    name: 'Basic 3x3 Pulli Kolam',
    nameTamil: '3x3 புலி கோலம்',
    description: 'A simple dot-based Kolam for beginners. Connect dots in horizontal and vertical lines.',
    difficulty: 'beginner',
    gridSize: 3,
    category: 'pulli',
    dots: [
      { id: 0, x: 100, y: 100 }, { id: 1, x: 150, y: 100 }, { id: 2, x: 200, y: 100 },
      { id: 3, x: 100, y: 150 }, { id: 4, x: 150, y: 150 }, { id: 5, x: 200, y: 150 },
      { id: 6, x: 100, y: 200 }, { id: 7, x: 150, y: 200 }, { id: 8, x: 200, y: 200 },
    ],
    lines: [
      { from: { x: 100, y: 100 }, to: { x: 200, y: 100 } },
      { from: { x: 100, y: 150 }, to: { x: 200, y: 150 } },
      { from: { x: 100, y: 200 }, to: { x: 200, y: 200 } },
      { from: { x: 100, y: 100 }, to: { x: 100, y: 200 } },
      { from: { x: 150, y: 100 }, to: { x: 150, y: 200 } },
      { from: { x: 200, y: 100 }, to: { x: 200, y: 200 } },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Start with a 3x3 dot grid', instructionTamil: '3x3 புலி கட்டத்தைத் தொடங்கவும்', highlightDots: [0, 1, 2, 3, 4, 5, 6, 7, 8], linesToDraw: [] },
      { stepNumber: 2, instruction: 'Connect top row dots (left to right)', instructionTamil: 'மேல் வரிசை புலிகளை (இடமிருந்து வலமாக) இணைக்கவும்', highlightDots: [0, 1, 2], linesToDraw: [{ from: { x: 100, y: 100 }, to: { x: 200, y: 100 } }] },
      { stepNumber: 3, instruction: 'Connect middle row dots', instructionTamil: 'நடு வரிசை புலிகளை இணைக்கவும்', highlightDots: [3, 4, 5], linesToDraw: [{ from: { x: 100, y: 150 }, to: { x: 200, y: 150 } }] },
      { stepNumber: 4, instruction: 'Connect bottom row dots', instructionTamil: 'கீழ் வரிசை புலிகளை இணைக்கவும்', highlightDots: [6, 7, 8], linesToDraw: [{ from: { x: 100, y: 200 }, to: { x: 200, y: 200 } }] },
      { stepNumber: 5, instruction: 'Connect left column dots (top to bottom)', instructionTamil: 'இடது நிரல் புலிகளை (மேலிருந்து கீழாக) இணைக்கவும்', highlightDots: [0, 3, 6], linesToDraw: [{ from: { x: 100, y: 100 }, to: { x: 100, y: 200 } }] },
      { stepNumber: 6, instruction: 'Connect middle column dots', instructionTamil: 'மத்திய நிரல் புலிகளை இணைக்கவும்', highlightDots: [1, 4, 7], linesToDraw: [{ from: { x: 150, y: 100 }, to: { x: 150, y: 200 } }] },
      { stepNumber: 7, instruction: 'Connect right column dots', instructionTamil: 'வலது நிரல் புலிகளை இணைக்கவும்', highlightDots: [2, 5, 8], linesToDraw: [{ from: { x: 200, y: 100 }, to: { x: 200, y: 200 } }] },
    ],
    tips: [
      'Maintain equal spacing between dots',
      'Keep your hand steady while drawing',
      'Practice with your finger before using chalk'
    ],
    culturalSignificance: 'This basic pattern is drawn daily at temple entrances and homes in Tamil Nadu, inviting prosperity.'
  },
  {
    id: 'pulli-5x5-diagonal',
    name: '5x5 Diagonal Pulli Kolam',
    nameTamil: '5x5 மூலைவிட்ட புலி கோலம்',
    description: 'Connect dots diagonally to create an intricate diamond-like pattern.',
    difficulty: 'intermediate',
    gridSize: 5,
    category: 'pulli',
    dots: [
      { id: 0, x: 80, y: 80 }, { id: 1, x: 110, y: 80 }, { id: 2, x: 140, y: 80 }, { id: 3, x: 170, y: 80 }, { id: 4, x: 200, y: 80 },
      { id: 5, x: 80, y: 110 }, { id: 6, x: 110, y: 110 }, { id: 7, x: 140, y: 110 }, { id: 8, x: 170, y: 110 }, { id: 9, x: 200, y: 110 },
      { id: 10, x: 80, y: 140 }, { id: 11, x: 110, y: 140 }, { id: 12, x: 140, y: 140 }, { id: 13, x: 170, y: 140 }, { id: 14, x: 200, y: 140 },
      { id: 15, x: 80, y: 170 }, { id: 16, x: 110, y: 170 }, { id: 17, x: 140, y: 170 }, { id: 18, x: 170, y: 170 }, { id: 19, x: 200, y: 170 },
      { id: 20, x: 80, y: 200 }, { id: 21, x: 110, y: 200 }, { id: 22, x: 140, y: 200 }, { id: 23, x: 170, y: 200 }, { id: 24, x: 200, y: 200 },
    ],
    lines: [
      { from: { x: 80, y: 80 }, to: { x: 200, y: 200 } },
      { from: { x: 200, y: 80 }, to: { x: 80, y: 200 } },
      { from: { x: 110, y: 80 }, to: { x: 200, y: 170 } },
      { from: { x: 170, y: 80 }, to: { x: 80, y: 170 } },
      { from: { x: 80, y: 110 }, to: { x: 170, y: 200 } },
      { from: { x: 200, y: 110 }, to: { x: 110, y: 200 } },
      { from: { x: 110, y: 110 }, to: { x: 140, y: 140 } },
      { from: { x: 170, y: 110 }, to: { x: 140, y: 140 } },
      { from: { x: 80, y: 140 }, to: { x: 200, y: 140 } },
      { from: { x: 110, y: 140 }, to: { x: 80, y: 110 } },
      { from: { x: 170, y: 140 }, to: { x: 200, y: 110 } },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Place a 5x5 dot grid', instructionTamil: '5x5 புலி கட்டத்தை வைக்கவும்', highlightDots: Array.from({ length: 25 }, (_, i) => i), linesToDraw: [] },
      { stepNumber: 2, instruction: 'Draw the main diagonal from top-left to bottom-right', instructionTamil: 'மேல் இடதிருந்து கீழ் வலமாக மூலைவிட்டத்தை வரைக்கவும்', highlightDots: [0, 12, 24], linesToDraw: [{ from: { x: 80, y: 80 }, to: { x: 200, y: 200 } }] },
      { stepNumber: 3, instruction: 'Draw the diagonal from top-right to bottom-left', instructionTamil: 'மேல் வலதிருந்து கீழ் இடமாக மூலைவிட்டத்தை வரைக்கவும்', highlightDots: [4, 12, 20], linesToDraw: [{ from: { x: 200, y: 80 }, to: { x: 80, y: 200 } }] },
      { stepNumber: 4, instruction: 'Connect remaining corner diagonals', instructionTamil: 'மீதமுள்ள மூலைகளை இணைக்கவும்', highlightDots: [1, 8, 15, 23], linesToDraw: [{ from: { x: 110, y: 80 }, to: { x: 200, y: 170 } }, { from: { x: 170, y: 80 }, to: { x: 80, y: 170 } }] },
      { stepNumber: 5, instruction: 'Complete inner diagonal connections', instructionTamil: 'உள் மூலைவிட்ட இணைகளை முடிக்கவும்', highlightDots: [5, 9, 14, 19, 15, 21], linesToDraw: [{ from: { x: 80, y: 110 }, to: { x: 170, y: 200 } }, { from: { x: 200, y: 110 }, to: { x: 110, y: 200 } }] },
      { stepNumber: 6, instruction: 'Draw cross patterns in center', instructionTamil: 'மத்தியில் குறுக்கு வடிவங்களை வரைக்கவும்', highlightDots: [6, 7, 10, 11, 13, 14, 17, 18], linesToDraw: [{ from: { x: 110, y: 110 }, to: { x: 140, y: 140 } }, { from: { x: 170, y: 110 }, to: { x: 140, y: 140 } }, { from: { x: 80, y: 140 }, to: { x: 200, y: 140 } }] },
    ],
    tips: [
      'Start from the center and work outward',
      'Keep diagonal lines at equal angles',
      'Practice with light strokes before darkening'
    ],
    culturalSignificance: 'Diagonal patterns symbolize the cosmic energy flow and are popular during festivals.'
  },
  {
    id: 'sikku-basic',
    name: 'Basic Sikku Kolam',
    nameTamil: 'சிக்கு கோலம்',
    description: 'Create interlocking knot patterns that weave over and under each other.',
    difficulty: 'intermediate',
    gridSize: 5,
    category: 'sikku',
    dots: [
      { id: 0, x: 80, y: 80 }, { id: 1, x: 110, y: 80 }, { id: 2, x: 140, y: 80 }, { id: 3, x: 170, y: 80 }, { id: 4, x: 200, y: 80 },
      { id: 5, x: 80, y: 110 }, { id: 6, x: 110, y: 110 }, { id: 7, x: 140, y: 110 }, { id: 8, x: 170, y: 110 }, { id: 9, x: 200, y: 110 },
      { id: 10, x: 80, y: 140 }, { id: 11, x: 110, y: 140 }, { id: 12, x: 140, y: 140 }, { id: 13, x: 170, y: 140 }, { id: 14, x: 200, y: 140 },
      { id: 15, x: 80, y: 170 }, { id: 16, x: 110, y: 170 }, { id: 17, x: 140, y: 170 }, { id: 18, x: 170, y: 170 }, { id: 19, x: 200, y: 170 },
      { id: 20, x: 80, y: 200 }, { id: 21, x: 110, y: 200 }, { id: 22, x: 140, y: 200 }, { id: 23, x: 170, y: 200 }, { id: 24, x: 200, y: 200 },
    ],
    lines: [
      { from: { x: 80, y: 80 }, to: { x: 95, y: 95 } },
      { from: { x: 95, y: 95 }, to: { x: 110, y: 80 } },
      { from: { x: 110, y: 80 }, to: { x: 125, y: 95 } },
      { from: { x: 125, y: 95 }, to: { x: 140, y: 80 } },
      { from: { x: 80, y: 110 }, to: { x: 110, y: 140 } },
      { from: { x: 140, y: 110 }, to: { x: 110, y: 140 } },
      { from: { x: 200, y: 110 }, to: { x: 170, y: 140 } },
      { from: { x: 170, y: 110 }, to: { x: 200, y: 140 } },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Set up a 5x5 dot grid', instructionTamil: '5x5 புலி கட்டத்தை அமைக்கவும்', highlightDots: Array.from({ length: 25 }, (_, i) => i), linesToDraw: [] },
      { stepNumber: 2, instruction: 'Start from top-left corner, curve to the next dot', instructionTamil: 'மேல் இடது மூலையில் தொடங்கி அடுத்த புலிக்கு வளைக்கவும்', highlightDots: [0, 1], linesToDraw: [{ from: { x: 80, y: 80 }, to: { x: 95, y: 95 } }] },
      { stepNumber: 3, instruction: 'Continue the curve pattern across the top row', instructionTamil: 'மேல் வரிசையில் வளைவு முறையைத் தொடர்க்கவும்', highlightDots: [1, 2], linesToDraw: [{ from: { x: 95, y: 95 }, to: { x: 110, y: 80 } }, { from: { x: 110, y: 80 }, to: { x: 125, y: 95 } }, { from: { x: 125, y: 95 }, to: { x: 140, y: 80 } }] },
      { stepNumber: 4, instruction: 'Create diagonal connections through the center', instructionTamil: 'மத்திய வழியாக மூலைவிட்ட இணைகளை உருவாக்கவும்', highlightDots: [5, 10, 15, 20], linesToDraw: [{ from: { x: 80, y: 110 }, to: { x: 110, y: 140 } }, { from: { x: 140, y: 110 }, to: { x: 110, y: 140 } }] },
      { stepNumber: 5, instruction: 'Mirror the diagonal pattern on the right side', instructionTamil: 'வலது பக்கத்தில் மூலைவிட்ட முறையைப் பிரதிபலிக்கவும்', highlightDots: [9, 14, 19, 24], linesToDraw: [{ from: { x: 200, y: 110 }, to: { x: 170, y: 140 } }, { from: { x: 170, y: 110 }, to: { x: 200, y: 140 } }] },
    ],
    tips: [
      'Sikku patterns create an illusion of weaving',
      'Maintain consistent curve heights',
      'The pattern should look like interlocking threads'
    ],
    culturalSignificance: 'Sikku Kolam represents the eternal cycle of life and is particularly popular during Diwali.'
  },
  {
    id: 'star-pattern',
    name: 'Eight-Pointed Star Kolam',
    nameTamil: 'எட்டு முனை விண்மீன் கோலம்',
    description: 'Create an elegant eight-pointed star pattern radiating from the center.',
    difficulty: 'beginner',
    gridSize: 0,
    category: 'geometric',
    dots: [
      { id: 0, x: 140, y: 140 }, { id: 1, x: 140, y: 50 },
      { id: 2, x: 230, y: 50 }, { id: 3, x: 230, y: 140 },
      { id: 4, x: 230, y: 230 }, { id: 5, x: 140, y: 230 },
      { id: 6, x: 50, y: 230 }, { id: 7, x: 50, y: 140 },
      { id: 8, x: 140, y: 95 }, { id: 9, x: 185, y: 140 },
      { id: 10, x: 140, y: 185 }, { id: 11, x: 95, y: 140 },
    ],
    lines: [
      { from: { x: 140, y: 50 }, to: { x: 230, y: 140 } },
      { from: { x: 230, y: 140 }, to: { x: 140, y: 230 } },
      { from: { x: 140, y: 230 }, to: { x: 50, y: 140 } },
      { from: { x: 50, y: 140 }, to: { x: 140, y: 50 } },
      { from: { x: 140, y: 50 }, to: { x: 140, y: 230 } },
      { from: { x: 50, y: 140 }, to: { x: 230, y: 140 } },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Place 4 corner dots and 4 side midpoint dots forming a square', instructionTamil: 'சதுரத்தை உருவாக்கும் 4 மூலை புலிகள் மற்றும் 4 பக்க நடு புலிகளை வைக்கவும்', highlightDots: [1, 3, 5, 7], linesToDraw: [] },
      { stepNumber: 2, instruction: 'Draw the vertical line through the center', instructionTamil: 'மத்திய வழியாக செங்குத்து கோட்டை வரைக்கவும்', highlightDots: [1, 5], linesToDraw: [{ from: { x: 140, y: 50 }, to: { x: 140, y: 230 } }] },
      { stepNumber: 3, instruction: 'Draw the horizontal line through the center', instructionTamil: 'மத்திய வழியாக க-orizontal கோட்டை வரைக்கவும்', highlightDots: [3, 7], linesToDraw: [{ from: { x: 50, y: 140 }, to: { x: 230, y: 140 } }] },
      { stepNumber: 4, instruction: 'Connect corners to form diagonal lines', instructionTamil: 'மூலைகளை இணைத்து மூலைவிட்ட கோடுகளை உருவாக்கவும்', highlightDots: [1, 3, 5, 7], linesToDraw: [{ from: { x: 140, y: 50 }, to: { x: 230, y: 140 } }, { from: { x: 230, y: 140 }, to: { x: 140, y: 230 } }, { from: { x: 140, y: 230 }, to: { x: 50, y: 140 } }, { from: { x: 50, y: 140 }, to: { x: 140, y: 50 } }] },
    ],
    tips: [
      'This pattern represents the eight directions',
      'Perfect for doorway entrances',
      'Can be scaled to any size'
    ],
    culturalSignificance: 'The eight-pointed star represents the eight directions and is considered highly auspicious.'
  },
  {
    id: 'spiral-pattern',
    name: 'Spiral Kolam',
    nameTamil: 'சுருள் கோலம்',
    description: 'A mesmerizing spiral pattern that starts from the center and winds outward.',
    difficulty: 'beginner',
    gridSize: 0,
    category: 'spiral',
    dots: (() => {
      const dots: PatternDot[] = []
      const centerX = 140
      const centerY = 140
      const numTurns = 3
      const pointsPerTurn = 12
      for (let i = 0; i < numTurns * pointsPerTurn; i++) {
        const angle = (2 * Math.PI * i) / pointsPerTurn
        const radius = 10 + (i / (numTurns * pointsPerTurn)) * 120
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        dots.push({ id: i, x, y })
      }
      return dots
    })(),
    lines: (() => {
      const lines = []
      const centerX = 140
      const centerY = 140
      const numTurns = 3
      const pointsPerTurn = 12
      
      for (let i = 0; i < numTurns * pointsPerTurn; i++) {
        const angle = (2 * Math.PI * i) / pointsPerTurn
        const radius = 10 + (i / (numTurns * pointsPerTurn)) * 120
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        
        if (i > 0) {
          const prevAngle = (2 * Math.PI * (i - 1)) / pointsPerTurn
          const prevRadius = 10 + ((i - 1) / (numTurns * pointsPerTurn)) * 120
          const prevX = centerX + prevRadius * Math.cos(prevAngle)
          const prevY = centerY + prevRadius * Math.sin(prevAngle)
          lines.push({ from: { x: prevX, y: prevY }, to: { x, y } })
        }
      }
      return lines
    })(),
    steps: [
      { stepNumber: 1, instruction: 'Start from the center point', instructionTamil: 'மத்திய புள்ளியில் தொடங்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 2, instruction: 'Draw a small curve turning clockwise', instructionTamil: 'சிறிய வளைவை clockwiseஆக வரைக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 3, instruction: 'Continue widening the spiral', instructionTamil: 'சுருளை தொடர்ந்து விரிவாக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 4, instruction: 'Complete the spiral going outward', instructionTamil: 'வெளியே செல்லும் சுருளை முடிக்கவும்', highlightDots: [], linesToDraw: [] },
    ],
    tips: [
      'Keep your hand moving smoothly',
      'Maintain even spacing between turns',
      'Practice on paper first'
    ],
    culturalSignificance: 'Spirals represent the cosmic energy and the eternal nature of time.'
  },
  {
    id: 'mandala-kolam',
    name: 'Mandala Kolam',
    nameTamil: 'மண்டல கோலம்',
    description: 'A circular symmetrical pattern with multiple rings, perfect for special occasions.',
    difficulty: 'advanced',
    gridSize: 0,
    category: 'mandala',
    dots: (() => {
      const dots: PatternDot[] = []
      const centerX = 140
      const centerY = 140
      const rings = 3
      const pointsPerRing = 8
      
      dots.push({ id: 0, x: centerX, y: centerY })
      let dotId = 1
      
      for (let ring = 1; ring <= rings; ring++) {
        const radius = ring * 40
        for (let i = 0; i < pointsPerRing; i++) {
          const angle = (2 * Math.PI * i) / pointsPerRing
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          dots.push({ id: dotId++, x, y })
        }
      }
      return dots
    })(),
    lines: (() => {
      const lines = []
      const centerX = 140
      const centerY = 140
      const rings = 3
      const pointsPerRing = 8
      
      for (let ring = 1; ring <= rings; ring++) {
        const radius = ring * 40
        
        for (let i = 0; i < pointsPerRing; i++) {
          const angle = (2 * Math.PI * i) / pointsPerRing
          const x = centerX + radius * Math.cos(angle)
          const y = centerY + radius * Math.sin(angle)
          
          const nextAngle = (2 * Math.PI * (i + 1)) / pointsPerRing
          const nextX = centerX + radius * Math.cos(nextAngle)
          const nextY = centerY + radius * Math.sin(nextAngle)
          
          lines.push({ from: { x, y }, to: { x: nextX, y: nextY } })
          
          if (ring > 1) {
            const prevRadius = (ring - 1) * 40
            const prevX = centerX + prevRadius * Math.cos(angle)
            const prevY = centerY + prevRadius * Math.sin(angle)
            lines.push({ from: { x: prevX, y: prevY }, to: { x, y } })
          }
        }
      }
      
      lines.push({ from: { x: centerX, y: centerY }, to: { x: centerX + 40, y: centerY } })
      
      return lines
    })(),
    steps: [
      { stepNumber: 1, instruction: 'Draw a center dot', instructionTamil: 'மத்திய புள்ளியை வரைக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 2, instruction: 'Create the first ring with 8 dots', instructionTamil: '8 புலிகளுடன் முதல் வளையத்தை உருவாக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 3, instruction: 'Connect dots in the first ring to form an octagon', instructionTamil: 'எண்கோணத்தை உருவாக்க முதல் வளைய புலிகளை இணைக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 4, instruction: 'Create the second ring', instructionTamil: 'இரண்டாவது வளையத்தை உருவாக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 5, instruction: 'Connect rings with radial lines', instructionTamil: 'வளையங்களை ஆரக் கோடுகளுடன் இணைக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 6, instruction: 'Add the third ring and complete', instructionTamil: 'மூன்றாவது வளையத்தை சேர்த்து முடிக்கவும்', highlightDots: [], linesToDraw: [] },
    ],
    tips: [
      'Use a compass or circular template for accuracy',
      'Maintain equal spacing between rings',
      'Perfect for festival decorations'
    ],
    culturalSignificance: 'Mandala Kolams are drawn during Navaratri and other special festivals, representing the cosmic universe.'
  },
  {
    id: 'fish-kolam',
    name: 'Fish Kolam (Meenakolam)',
    nameTamil: 'மீன் கோலம்',
    description: 'A fish-shaped pattern representing prosperity and abundance.',
    difficulty: 'intermediate',
    gridSize: 0,
    category: 'figurative',
    dots: [
      { id: 0, x: 80, y: 100 }, { id: 1, x: 110, y: 80 }, { id: 2, x: 140, y: 100 },
      { id: 3, x: 170, y: 80 }, { id: 4, x: 200, y: 100 }, { id: 5, x: 200, y: 140 },
      { id: 6, x: 170, y: 160 }, { id: 7, x: 140, y: 140 }, { id: 8, x: 110, y: 160 },
      { id: 9, x: 80, y: 140 },
    ],
    lines: [
      { from: { x: 80, y: 100 }, to: { x: 110, y: 80 } },
      { from: { x: 110, y: 80 }, to: { x: 140, y: 100 } },
      { from: { x: 140, y: 100 }, to: { x: 170, y: 80 } },
      { from: { x: 170, y: 80 }, to: { x: 200, y: 100 } },
      { from: { x: 200, y: 100 }, to: { x: 200, y: 140 } },
      { from: { x: 200, y: 140 }, to: { x: 170, y: 160 } },
      { from: { x: 170, y: 160 }, to: { x: 140, y: 140 } },
      { from: { x: 140, y: 140 }, to: { x: 110, y: 160 } },
      { from: { x: 110, y: 160 }, to: { x: 80, y: 140 } },
      { from: { x: 80, y: 140 }, to: { x: 80, y: 100 } },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Place dots in a fish shape outline', instructionTamil: 'மீன் வடிவத்தில் புலிகளை வைக்கவும்', highlightDots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], linesToDraw: [] },
      { stepNumber: 2, instruction: 'Connect the top curve of the fish', instructionTamil: 'மீனின் மேல் வளைவை இணைக்கவும்', highlightDots: [0, 1, 2, 3, 4], linesToDraw: [{ from: { x: 80, y: 100 }, to: { x: 110, y: 80 } }, { from: { x: 110, y: 80 }, to: { x: 140, y: 100 } }, { from: { x: 140, y: 100 }, to: { x: 170, y: 80 } }, { from: { x: 170, y: 80 }, to: { x: 200, y: 100 } }] },
      { stepNumber: 3, instruction: 'Connect the right side of the fish', instructionTamil: 'மீனின் வலது பக்கத்தை இணைக்கவும்', highlightDots: [4, 5], linesToDraw: [{ from: { x: 200, y: 100 }, to: { x: 200, y: 140 } }] },
      { stepNumber: 4, instruction: 'Connect the bottom curve of the fish', instructionTamil: 'மீனின் கீழ் வளைவை இணைக்கவும்', highlightDots: [5, 6, 7, 8, 9], linesToDraw: [{ from: { x: 200, y: 140 }, to: { x: 170, y: 160 } }, { from: { x: 170, y: 160 }, to: { x: 140, y: 140 } }, { from: { x: 140, y: 140 }, to: { x: 110, y: 160 } }, { from: { x: 110, y: 160 }, to: { x: 80, y: 140 } }] },
      { stepNumber: 5, instruction: 'Close the fish shape', instructionTamil: 'மீன் வடிவத்தை மூடவும்', highlightDots: [9, 0], linesToDraw: [{ from: { x: 80, y: 140 }, to: { x: 80, y: 100 } }] },
    ],
    tips: [
      'Fish represents abundance and prosperity',
      'Common during Pongal festival',
      'Can be decorated with colors'
    ],
    culturalSignificance: 'Meenakolam is drawn during Pongal to honor the fish and invoke blessings for abundance.'
  },
  {
    id: 'pulli-7x7-basic',
    name: '7x7 Pulli Kolam',
    nameTamil: '7x7 புலி கோலம்',
    description: 'A larger 7x7 dot grid pattern for intermediate practitioners.',
    difficulty: 'intermediate',
    gridSize: 7,
    category: 'pulli',
    dots: Array.from({ length: 49 }, (_, i) => ({
      id: i,
      x: 60 + (i % 7) * 30,
      y: 60 + Math.floor(i / 7) * 30
    })),
    lines: (() => {
      const lines: PatternLine[] = []
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 6; col++) {
          lines.push({
            from: { x: 60 + col * 30, y: 60 + row * 30 },
            to: { x: 60 + (col + 1) * 30, y: 60 + row * 30 }
          })
        }
      }
      for (let col = 0; col < 7; col++) {
        for (let row = 0; row < 6; row++) {
          lines.push({
            from: { x: 60 + col * 30, y: 60 + row * 30 },
            to: { x: 60 + col * 30, y: 60 + (row + 1) * 30 }
          })
        }
      }
      return lines
    })(),
    steps: [
      { stepNumber: 1, instruction: 'Place a 7x7 dot grid', instructionTamil: '7x7 புலி கட்டத்தை வைக்கவும்', highlightDots: Array.from({ length: 49 }, (_, i) => i), linesToDraw: [] },
      { stepNumber: 2, instruction: 'Connect all horizontal lines', instructionTamil: 'அனைத்து கிடைமட்ட கோடுகளை இணைக்கவும்', highlightDots: [], linesToDraw: [] },
      { stepNumber: 3, instruction: 'Connect all vertical lines', instructionTamil: 'அனைத்து செங்குத்து கோடுகளை இணைக்கவும்', highlightDots: [], linesToDraw: [] },
    ],
    tips: [
      'This pattern requires patience and precision',
      'Use a ruler for accurate dot placement',
      'Practice with smaller grids first'
    ],
    culturalSignificance: 'Larger Kolams are drawn during festivals and special occasions.'
  },
  {
    id: 'sikku-3x3',
    name: '3x3 Sikku Kolam',
    nameTamil: '3x3 சிக்கு கோலம்',
    description: 'A simple Sikku pattern with interlocking curves on a 3x3 grid.',
    difficulty: 'beginner',
    gridSize: 3,
    category: 'sikku',
    dots: [
      { id: 0, x: 100, y: 100 }, { id: 1, x: 140, y: 100 }, { id: 2, x: 180, y: 100 },
      { id: 3, x: 100, y: 140 }, { id: 4, x: 140, y: 140 }, { id: 5, x: 180, y:  140},
      { id: 6, x: 100, y: 180 }, { id: 7, x: 140, y: 180 }, { id: 8, x: 180, y: 180 },
    ],
    lines: [
      { from: { x: 100, y: 100 }, to: { x: 120, y: 110 } },
      { from: { x: 120, y: 110 }, to: { x: 140, y: 100 } },
      { from: { x: 140, y: 100 }, to: { x: 160, y: 110 } },
      { from: { x: 160, y: 110 }, to: { x: 180, y: 100 } },
      { from: { x: 100, y: 140 }, to: { x: 120, y: 160 } },
      { from: { x: 120, y: 160 }, to: { x: 140, y: 180 } },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Place a 3x3 dot grid', instructionTamil: '3x3 புலி கட்டத்தை வைக்கவும்', highlightDots: [0,1,2,3,4,5,6,7,8], linesToDraw: [] },
      { stepNumber: 2, instruction: 'Create curves between top row dots', instructionTamil: 'மேல் வரிசையில் வளைவுகள் உருவாக்கவும்', highlightDots: [0,1,2], linesToDraw: [] },
      { stepNumber: 3, instruction: 'Create diagonal curves', instructionTamil: 'மூலைவிட்ட வளைவுகள் உருவாக்கவும்', highlightDots: [3,6], linesToDraw: [] },
    ],
    tips: [
      'Sikku patterns weave over and under',
      'Keep curves smooth and consistent',
      'Practice with your finger first'
    ],
    culturalSignificance: 'Sikku Kolams are especially popular during Diwali.'
  },
]

export function getPatternById(id: string): KolamPattern | undefined {
  return KOLAM_PATTERNS.find(p => p.id === id)
}

export function getPatternsByDifficulty(difficulty: string): KolamPattern[] {
  return KOLAM_PATTERNS.filter(p => p.difficulty === difficulty)
}

export function getPatternsByCategory(category: string): KolamPattern[] {
  return KOLAM_PATTERNS.filter(p => p.category === category)
}

export function getAllCategories(): string[] {
  return [...new Set(KOLAM_PATTERNS.map(p => p.category))]
}
