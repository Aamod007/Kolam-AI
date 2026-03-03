/**
 * Kolam Engine — Algorithmic Kolam Generation & Recreation
 * 
 * Ports the Python KolamGenerator (L-systems, symmetry transforms, 9 templates,
 * SVG rendering) into TypeScript so the web app can generate Kolams WITHOUT
 * delegating to Gemini. This directly addresses the AICTE IKS problem statement:
 * "develop computer programs to recreate kolams."
 *
 * Mathematical foundations:
 *  - Graph theory (dots = nodes, lines = edges)
 *  - Symmetry groups (D1, D2, C2, C4, dihedral, radial)
 *  - L-systems (Lindenmayer grammar for fractal/recursive patterns)
 *  - Eulerian paths (single continuous line traversal)
 */

// ═══════════════════════════════════════════════════════════════
// Data Structures
// ═══════════════════════════════════════════════════════════════

export interface Point {
    x: number
    y: number
}

export interface KolamDot {
    x: number
    y: number
    id: number
}

export interface KolamLine {
    start: Point
    end: Point
    controlPoints?: Point[]  // For Bézier curves (Sikku/Neli)
}

export interface KolamPattern {
    dots: KolamDot[]
    lines: KolamLine[]
    width: number
    height: number
    metadata: PatternMetadata
}

export interface PatternMetadata {
    template: string
    gridSize: number
    symmetry: SymmetryType
    kolamType: KolamTypeEnum
    dotCount: number
    lineCount: number
    isEulerian: boolean
    connectedComponents: number
    holeCount: number
    complexityScore: number
    complexityLabel: string
    constructionSteps: string[]
    mathematicalPrinciples: string[]
}

export enum SymmetryType {
    NONE = 'none',
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
    DIAGONAL = 'diagonal',
    ROTATIONAL_90 = 'rotational_90',
    ROTATIONAL_180 = 'rotational_180',
    RADIAL = 'radial',
    BILATERAL = 'bilateral',
    DIHEDRAL = 'dihedral',
}

export enum KolamTypeEnum {
    PULLI = 'pulli',
    SIKKU = 'sikku',
    KAMBI = 'kambi',
    NELI = 'neli',
    KODU = 'kodu',
    PADI = 'padi',
    STAR = 'star',
    MANDALA = 'mandala',
    SPIRAL = 'spiral',
    FREEHAND = 'freehand',
}

// ═══════════════════════════════════════════════════════════════
// Point Math Utilities
// ═══════════════════════════════════════════════════════════════

function rotatePoint(p: Point, angle: number, center: Point): Point {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const dx = p.x - center.x
    const dy = p.y - center.y
    return {
        x: center.x + dx * cos - dy * sin,
        y: center.y + dx * sin + dy * cos,
    }
}

function reflectPoint(p: Point, axis: 'horizontal' | 'vertical' | 'diagonal_main' | 'diagonal_anti', center: Point): Point {
    if (axis === 'horizontal') return { x: p.x, y: 2 * center.y - p.y }
    if (axis === 'vertical') return { x: 2 * center.x - p.x, y: p.y }
    if (axis === 'diagonal_main') {
        const dx = p.x - center.x, dy = p.y - center.y
        return { x: center.x + dy, y: center.y + dx }
    }
    // diagonal_anti
    const dx = p.x - center.x, dy = p.y - center.y
    return { x: center.x - dy, y: center.y - dx }
}

function dist(a: Point, b: Point): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

// ═══════════════════════════════════════════════════════════════
// L-System Engine (Lindenmayer Grammar)
// ═══════════════════════════════════════════════════════════════

interface LSystemRule {
    [key: string]: string
}

export class LSystem {
    axiom: string
    rules: LSystemRule
    angle: number

    constructor(axiom: string, rules: LSystemRule, angle: number = 90) {
        this.axiom = axiom
        this.rules = rules
        this.angle = angle
    }

    generate(iterations: number): string {
        let result = this.axiom
        for (let i = 0; i < iterations; i++) {
            let next = ''
            for (const ch of result) {
                next += this.rules[ch] ?? ch
            }
            result = next
        }
        return result
    }

    interpret(lString: string, start: Point, length: number): { dots: KolamDot[]; lines: KolamLine[] } {
        let x = start.x, y = start.y
        let angle = 0
        const stack: [number, number, number][] = []
        const dots: KolamDot[] = []
        const lines: KolamLine[] = []
        let dotId = 0

        for (const ch of lString) {
            if (ch === 'F') {
                const nx = x + length * Math.cos(angle * Math.PI / 180)
                const ny = y + length * Math.sin(angle * Math.PI / 180)
                lines.push({ start: { x, y }, end: { x: nx, y: ny } })
                dots.push({ x, y, id: dotId++ })
                x = nx; y = ny
            } else if (ch === 'f') {
                x += length * Math.cos(angle * Math.PI / 180)
                y += length * Math.sin(angle * Math.PI / 180)
            } else if (ch === '+') {
                angle += this.angle
            } else if (ch === '-') {
                angle -= this.angle
            } else if (ch === '[') {
                stack.push([x, y, angle])
            } else if (ch === ']') {
                if (stack.length > 0) {
                    const [sx, sy, sa] = stack.pop()!
                    x = sx; y = sy; angle = sa
                }
            }
        }
        return { dots, lines }
    }
}

// ═══════════════════════════════════════════════════════════════
// Graph Analysis (for metadata)
// ═══════════════════════════════════════════════════════════════

function buildAdjacency(dots: KolamDot[], lines: KolamLine[], tolerance: number = 2): Map<number, Set<number>> {
    const adj = new Map<number, Set<number>>()
    for (const d of dots) adj.set(d.id, new Set())

    for (const line of lines) {
        // Find closest dots to line endpoints
        let startDot = -1, endDot = -1
        let minS = Infinity, minE = Infinity
        for (const d of dots) {
            const ds = dist(line.start, d)
            const de = dist(line.end, d)
            if (ds < minS) { minS = ds; startDot = d.id }
            if (de < minE) { minE = de; endDot = d.id }
        }
        if (startDot >= 0 && endDot >= 0 && startDot !== endDot) {
            adj.get(startDot)?.add(endDot)
            adj.get(endDot)?.add(startDot)
        }
    }
    return adj
}

function isEulerian(adj: Map<number, Set<number>>): boolean {
    if (adj.size === 0) return false
    let oddCount = 0
    for (const [, neighbors] of adj) {
        if (neighbors.size % 2 === 1) oddCount++
    }
    return oddCount === 0 || oddCount === 2
}

function countConnectedComponents(adj: Map<number, Set<number>>): number {
    const visited = new Set<number>()
    let components = 0
    for (const [node] of adj) {
        if (!visited.has(node)) {
            components++
            const queue = [node]
            while (queue.length > 0) {
                const curr = queue.pop()!
                if (visited.has(curr)) continue
                visited.add(curr)
                for (const neighbor of adj.get(curr) ?? []) {
                    if (!visited.has(neighbor)) queue.push(neighbor)
                }
            }
        }
    }
    return components
}

function countCycles(adj: Map<number, Set<number>>): number {
    // Euler's formula for planar graphs: V - E + F = 2
    // holes ≈ E - V + components
    let edgeCount = 0
    for (const [, neighbors] of adj) edgeCount += neighbors.size
    edgeCount /= 2  // undirected
    const V = adj.size
    const C = countConnectedComponents(adj)
    return Math.max(0, edgeCount - V + C)
}

// ═══════════════════════════════════════════════════════════════
// Main Generator Class
// ═══════════════════════════════════════════════════════════════

export class KolamEngine {
    gridSize: number
    spacing: number
    centerX: number
    centerY: number
    canvasSize: number

    constructor(gridSize: number = 5, spacing: number = 50) {
        this.gridSize = Math.max(2, Math.min(15, gridSize))
        this.spacing = spacing
        this.canvasSize = (this.gridSize + 2) * spacing
        this.centerX = this.canvasSize / 2
        this.centerY = this.canvasSize / 2
    }

    // ─────────────────────────────────────────────────────────────
    // Grid Generators
    // ─────────────────────────────────────────────────────────────

    generateSquareGrid(): KolamDot[] {
        const dots: KolamDot[] = []
        const offset = (this.gridSize - 1) * this.spacing / 2
        let id = 0
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                dots.push({
                    x: this.centerX + c * this.spacing - offset,
                    y: this.centerY + r * this.spacing - offset,
                    id: id++
                })
            }
        }
        return dots
    }

    generateDiamondGrid(): KolamDot[] {
        const dots: KolamDot[] = []
        let id = 0
        const mid = Math.floor(this.gridSize / 2)
        for (let r = 0; r < this.gridSize; r++) {
            const dotsInRow = this.gridSize - Math.abs(mid - r)
            const startX = this.centerX - (dotsInRow - 1) * this.spacing / 2
            const y = this.centerY + (r - mid) * this.spacing
            for (let c = 0; c < dotsInRow; c++) {
                dots.push({ x: startX + c * this.spacing, y, id: id++ })
            }
        }
        return dots
    }

    generateTriangularGrid(): KolamDot[] {
        const dots: KolamDot[] = []
        let id = 0
        const rows = this.gridSize
        for (let r = 0; r < rows; r++) {
            const dotsInRow = r + 1
            const startX = this.centerX - (dotsInRow - 1) * this.spacing / 2
            const y = this.centerY - (rows - 1) * this.spacing / 2 + r * this.spacing
            for (let c = 0; c < dotsInRow; c++) {
                dots.push({ x: startX + c * this.spacing, y, id: id++ })
            }
        }
        return dots
    }

    generateHexagonalGrid(): KolamDot[] {
        const dots: KolamDot[] = []
        let id = 0
        const rings = Math.ceil(this.gridSize / 2)
        dots.push({ x: this.centerX, y: this.centerY, id: id++ })
        for (let ring = 1; ring <= rings; ring++) {
            const pointsInRing = ring * 6
            for (let i = 0; i < pointsInRing; i++) {
                const angle = (2 * Math.PI * i) / pointsInRing
                dots.push({
                    x: this.centerX + ring * this.spacing * Math.cos(angle),
                    y: this.centerY + ring * this.spacing * Math.sin(angle),
                    id: id++
                })
            }
        }
        return dots
    }

    generateCircularGrid(): KolamDot[] {
        const dots: KolamDot[] = []
        let id = 0
        const rings = Math.ceil(this.gridSize / 2)
        const pointsPerRing = 12
        for (let ring = 1; ring <= rings; ring++) {
            const radius = ring * this.spacing * 0.8
            for (let i = 0; i < pointsPerRing; i++) {
                const angle = (2 * Math.PI * i) / pointsPerRing
                dots.push({
                    x: this.centerX + radius * Math.cos(angle),
                    y: this.centerY + radius * Math.sin(angle),
                    id: id++
                })
            }
        }
        return dots
    }

    getGrid(gridType: string): KolamDot[] {
        switch (gridType) {
            case 'diamond': return this.generateDiamondGrid()
            case 'triangular': return this.generateTriangularGrid()
            case 'hexagonal': return this.generateHexagonalGrid()
            case 'circular': return this.generateCircularGrid()
            default: return this.generateSquareGrid()
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Pattern Templates
    // ─────────────────────────────────────────────────────────────

    generatePulli(gridType: string = 'square'): KolamPattern {
        const dots = this.getGrid(gridType)
        const lines: KolamLine[] = []
        const offset = (this.gridSize - 1) * this.spacing / 2

        // Connect horizontal neighbors
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 1; c++) {
                const i = r * this.gridSize + c
                if (dots[i] && dots[i + 1]) {
                    lines.push({ start: { x: dots[i].x, y: dots[i].y }, end: { x: dots[i + 1].x, y: dots[i + 1].y } })
                }
            }
        }
        // Connect vertical neighbors
        for (let r = 0; r < this.gridSize - 1; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const i = r * this.gridSize + c
                const j = (r + 1) * this.gridSize + c
                if (dots[i] && dots[j]) {
                    lines.push({ start: { x: dots[i].x, y: dots[i].y }, end: { x: dots[j].x, y: dots[j].y } })
                }
            }
        }

        return this.buildPattern(dots, lines, 'pulli', KolamTypeEnum.PULLI)
    }

    generateSikku(gridType: string = 'square'): KolamPattern {
        const dots = this.getGrid(gridType)
        const lines: KolamLine[] = []
        const offset = (this.gridSize - 1) * this.spacing / 2
        const controlOffset = this.spacing / 4

        // Weaving curves around each dot pair (horizontal)
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize - 1; c++) {
                const i = r * this.gridSize + c
                if (!dots[i] || !dots[i + 1]) continue
                const d1 = dots[i], d2 = dots[i + 1]
                const midX = (d1.x + d2.x) / 2
                // Upper arc
                lines.push({
                    start: { x: d1.x, y: d1.y },
                    end: { x: d2.x, y: d2.y },
                    controlPoints: [{ x: midX, y: d1.y - controlOffset }]
                })
            }
        }
        // Vertical weaving
        for (let r = 0; r < this.gridSize - 1; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                const i = r * this.gridSize + c
                const j = (r + 1) * this.gridSize + c
                if (!dots[i] || !dots[j]) continue
                const d1 = dots[i], d2 = dots[j]
                const midY = (d1.y + d2.y) / 2
                lines.push({
                    start: { x: d1.x, y: d1.y },
                    end: { x: d2.x, y: d2.y },
                    controlPoints: [{ x: d1.x + controlOffset, y: midY }]
                })
            }
        }

        return this.buildPattern(dots, lines, 'sikku', KolamTypeEnum.SIKKU)
    }

    generateKambi(): KolamPattern {
        // Kambi = single continuous wire-like loop
        const dots = this.generateSquareGrid()
        const lines: KolamLine[] = []

        // Create a Hamiltonian-inspired path visiting all border dots
        const n = this.gridSize
        const path: number[] = []
        // Top row
        for (let c = 0; c < n; c++) path.push(c)
        // Right column (skip first)
        for (let r = 1; r < n; r++) path.push(r * n + (n - 1))
        // Bottom row reverse (skip last)
        for (let c = n - 2; c >= 0; c--) path.push((n - 1) * n + c)
        // Left column reverse (skip both ends)
        for (let r = n - 2; r >= 1; r--) path.push(r * n)
        // Inner spiral
        if (n >= 4) {
            for (let c = 1; c < n - 1; c++) path.push(1 * n + c)
            for (let r = 2; r < n - 1; r++) path.push(r * n + (n - 2))
            for (let c = n - 3; c >= 1; c--) path.push((n - 2) * n + c)
            for (let r = n - 3; r >= 2; r--) path.push(r * n + 1)
        }
        // Close the loop
        path.push(path[0])

        for (let i = 0; i < path.length - 1; i++) {
            const d1 = dots[path[i]], d2 = dots[path[i + 1]]
            if (d1 && d2) lines.push({ start: { x: d1.x, y: d1.y }, end: { x: d2.x, y: d2.y } })
        }

        return this.buildPattern(dots, lines, 'kambi', KolamTypeEnum.KAMBI)
    }

    generateStar(): KolamPattern {
        const dots: KolamDot[] = []
        const lines: KolamLine[] = []
        const numPoints = 8
        const outerR = this.spacing * (this.gridSize / 2)
        const innerR = outerR * 0.4

        // Outer star points
        for (let i = 0; i < numPoints; i++) {
            const angle = (2 * Math.PI * i) / numPoints - Math.PI / 2
            dots.push({
                x: this.centerX + outerR * Math.cos(angle),
                y: this.centerY + outerR * Math.sin(angle),
                id: i
            })
        }
        // Inner star points
        for (let i = 0; i < numPoints; i++) {
            const angle = (2 * Math.PI * (i + 0.5)) / numPoints - Math.PI / 2
            dots.push({
                x: this.centerX + innerR * Math.cos(angle),
                y: this.centerY + innerR * Math.sin(angle),
                id: numPoints + i
            })
        }
        // Center dot
        dots.push({ x: this.centerX, y: this.centerY, id: numPoints * 2 })

        // Connect outer polygon
        for (let i = 0; i < numPoints; i++) {
            lines.push({
                start: { x: dots[i].x, y: dots[i].y },
                end: { x: dots[(i + 1) % numPoints].x, y: dots[(i + 1) % numPoints].y }
            })
        }
        // Connect outer to inner (star spikes)
        for (let i = 0; i < numPoints; i++) {
            lines.push({
                start: { x: dots[i].x, y: dots[i].y },
                end: { x: dots[numPoints + i].x, y: dots[numPoints + i].y }
            })
            lines.push({
                start: { x: dots[i].x, y: dots[i].y },
                end: { x: dots[numPoints + ((i - 1 + numPoints) % numPoints)].x, y: dots[numPoints + ((i - 1 + numPoints) % numPoints)].y }
            })
        }
        // Connect inner to center
        for (let i = 0; i < numPoints; i++) {
            lines.push({
                start: { x: dots[numPoints + i].x, y: dots[numPoints + i].y },
                end: { x: this.centerX, y: this.centerY }
            })
        }

        return this.buildPattern(dots, lines, 'star', KolamTypeEnum.STAR)
    }

    generateDiamond(): KolamPattern {
        const dots = this.generateDiamondGrid()
        const lines: KolamLine[] = []

        // Connect each dot to its nearest neighbors
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const d = dist(dots[i], dots[j])
                if (d <= this.spacing * 1.15) {
                    lines.push({
                        start: { x: dots[i].x, y: dots[i].y },
                        end: { x: dots[j].x, y: dots[j].y }
                    })
                }
            }
        }

        return this.buildPattern(dots, lines, 'diamond', KolamTypeEnum.PULLI)
    }

    generateSpiral(): KolamPattern {
        const dots: KolamDot[] = []
        const lines: KolamLine[] = []
        const numTurns = 4
        const pointsPerTurn = 20

        for (let i = 0; i < numTurns * pointsPerTurn; i++) {
            const angle = (2 * Math.PI * i) / pointsPerTurn
            const radius = 10 + (i / (numTurns * pointsPerTurn)) * (this.spacing * this.gridSize / 2)
            const x = this.centerX + radius * Math.cos(angle)
            const y = this.centerY + radius * Math.sin(angle)
            dots.push({ x, y, id: i })
            if (i > 0) {
                lines.push({ start: { x: dots[i - 1].x, y: dots[i - 1].y }, end: { x, y } })
            }
        }

        return this.buildPattern(dots, lines, 'spiral', KolamTypeEnum.SPIRAL)
    }

    generateMandala(): KolamPattern {
        const dots: KolamDot[] = []
        const lines: KolamLine[] = []
        const numRings = Math.max(3, Math.ceil(this.gridSize / 2))
        const pointsPerRing = 12
        let id = 0

        // Generate concentric rings
        for (let ring = 1; ring <= numRings; ring++) {
            const radius = ring * this.spacing * 0.8
            for (let i = 0; i < pointsPerRing; i++) {
                const angle = (2 * Math.PI * i) / pointsPerRing
                dots.push({
                    x: this.centerX + radius * Math.cos(angle),
                    y: this.centerY + radius * Math.sin(angle),
                    id: id++
                })
            }
        }

        // Connect within each ring
        for (let ring = 0; ring < numRings; ring++) {
            const start = ring * pointsPerRing
            for (let i = 0; i < pointsPerRing; i++) {
                const a = dots[start + i], b = dots[start + (i + 1) % pointsPerRing]
                lines.push({ start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y } })
            }
        }

        // Connect between rings (radial spokes)
        for (let ring = 0; ring < numRings - 1; ring++) {
            for (let i = 0; i < pointsPerRing; i++) {
                const a = dots[ring * pointsPerRing + i]
                const b = dots[(ring + 1) * pointsPerRing + i]
                lines.push({ start: { x: a.x, y: a.y }, end: { x: b.x, y: b.y } })
            }
        }

        return this.buildPattern(dots, lines, 'mandala', KolamTypeEnum.MANDALA)
    }

    generatePadi(): KolamPattern {
        // Padi (Step) Kolam — staircase-like pattern
        const dots = this.generateSquareGrid()
        const lines: KolamLine[] = []
        const n = this.gridSize

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const i = r * n + c
                // Horizontal step connections
                if (c < n - 1) {
                    lines.push({ start: { x: dots[i].x, y: dots[i].y }, end: { x: dots[i + 1].x, y: dots[i + 1].y } })
                }
                // Vertical step connections (staircase: only connect if c <= r)
                if (r < n - 1 && c <= r) {
                    const j = (r + 1) * n + c
                    lines.push({ start: { x: dots[i].x, y: dots[i].y }, end: { x: dots[j].x, y: dots[j].y } })
                }
            }
        }

        return this.buildPattern(dots, lines, 'padi', KolamTypeEnum.PADI)
    }

    generateNeli(): KolamPattern {
        // Neli (curvy flowing) — uses Bézier curves between all neighboring dots
        const dots = this.generateSquareGrid()
        const lines: KolamLine[] = []
        const n = this.gridSize
        const curvature = this.spacing * 0.35

        // Sinusoidal horizontal curves
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n - 1; c++) {
                const i = r * n + c
                const d1 = dots[i], d2 = dots[i + 1]
                const midX = (d1.x + d2.x) / 2
                const dir = (r + c) % 2 === 0 ? -1 : 1
                lines.push({
                    start: { x: d1.x, y: d1.y },
                    end: { x: d2.x, y: d2.y },
                    controlPoints: [{ x: midX, y: d1.y + dir * curvature }]
                })
            }
        }
        // Sinusoidal vertical curves
        for (let r = 0; r < n - 1; r++) {
            for (let c = 0; c < n; c++) {
                const i = r * n + c, j = (r + 1) * n + c
                const d1 = dots[i], d2 = dots[j]
                const midY = (d1.y + d2.y) / 2
                const dir = (r + c) % 2 === 0 ? 1 : -1
                lines.push({
                    start: { x: d1.x, y: d1.y },
                    end: { x: d2.x, y: d2.y },
                    controlPoints: [{ x: d1.x + dir * curvature, y: midY }]
                })
            }
        }

        return this.buildPattern(dots, lines, 'neli', KolamTypeEnum.NELI)
    }

    generateLSystemKolam(): KolamPattern {
        // Kolam-inspired L-system (Hilbert curve variant)
        const lsys = new LSystem(
            'A',
            { 'A': '-BF+AFA+FB-', 'B': '+AF-BFB-FA+' },
            90
        )
        const iterations = Math.min(3, Math.floor(this.gridSize / 2))
        const str = lsys.generate(iterations)
        const length = this.spacing * 0.8 / Math.pow(2, iterations)
        const startX = this.centerX - this.spacing * this.gridSize / 4
        const startY = this.centerY - this.spacing * this.gridSize / 4
        const { dots, lines } = lsys.interpret(str, { x: startX, y: startY }, length)

        return this.buildPattern(dots, lines, 'lsystem_hilbert', KolamTypeEnum.KAMBI)
    }

    generateKochSnowflake(): KolamPattern {
        // Koch Snowflake — fractal curve with 60° angles
        const lsys = new LSystem('F--F--F', { 'F': 'F+F--F+F' }, 60)
        const iterations = Math.min(4, Math.max(1, this.gridSize - 2))
        const str = lsys.generate(iterations)
        const length = this.spacing * 2 / Math.pow(3, iterations)
        const startX = this.centerX - this.canvasSize * 0.3
        const startY = this.centerY + this.canvasSize * 0.2
        const { dots, lines } = lsys.interpret(str, { x: startX, y: startY }, length)
        return this.buildPattern(dots, lines, 'koch_snowflake', KolamTypeEnum.KAMBI)
    }

    generateSierpinskiTriangle(): KolamPattern {
        // Sierpinski Triangle — fractal arrowhead curve
        const lsys = new LSystem('AF', { 'A': 'BF+AF+BF', 'B': 'AF-BF-AF' }, 60)
        const iterations = Math.min(5, Math.max(2, this.gridSize - 1))
        const str = lsys.generate(iterations)
        const length = this.spacing * 3 / Math.pow(2, iterations)
        const startX = this.centerX - this.canvasSize * 0.35
        const startY = this.centerY + this.canvasSize * 0.3
        const { dots, lines } = lsys.interpret(str, { x: startX, y: startY }, length)
        return this.buildPattern(dots, lines, 'sierpinski', KolamTypeEnum.KAMBI)
    }

    generateDragonCurve(): KolamPattern {
        // Dragon Curve — space-filling fractal with 90° turns
        const lsys = new LSystem('FX', { 'X': 'X+YF+', 'Y': '-FX-Y' }, 90)
        const iterations = Math.min(10, Math.max(4, this.gridSize + 3))
        const str = lsys.generate(iterations)
        const length = this.spacing * 0.6 / Math.pow(1.4, iterations - 4)
        const { dots, lines } = lsys.interpret(str, { x: this.centerX, y: this.centerY }, length)
        return this.buildPattern(dots, lines, 'dragon_curve', KolamTypeEnum.KAMBI)
    }

    // ─────────────────────────────────────────────────────────────
    // Symmetry Transforms
    // ─────────────────────────────────────────────────────────────

    applySymmetry(lines: KolamLine[], symmetry: SymmetryType): KolamLine[] {
        const center: Point = { x: this.centerX, y: this.centerY }
        const allLines = [...lines]

        if ([SymmetryType.HORIZONTAL, SymmetryType.BILATERAL, SymmetryType.DIHEDRAL].includes(symmetry)) {
            for (const line of lines) {
                allLines.push({
                    start: reflectPoint(line.start, 'horizontal', center),
                    end: reflectPoint(line.end, 'horizontal', center),
                    controlPoints: line.controlPoints?.map(p => reflectPoint(p, 'horizontal', center)),
                })
            }
        }

        if ([SymmetryType.VERTICAL, SymmetryType.BILATERAL, SymmetryType.DIHEDRAL].includes(symmetry)) {
            for (const line of lines) {
                allLines.push({
                    start: reflectPoint(line.start, 'vertical', center),
                    end: reflectPoint(line.end, 'vertical', center),
                    controlPoints: line.controlPoints?.map(p => reflectPoint(p, 'vertical', center)),
                })
            }
        }

        if ([SymmetryType.DIAGONAL, SymmetryType.DIHEDRAL].includes(symmetry)) {
            for (const line of lines) {
                allLines.push({
                    start: reflectPoint(line.start, 'diagonal_main', center),
                    end: reflectPoint(line.end, 'diagonal_main', center),
                    controlPoints: line.controlPoints?.map(p => reflectPoint(p, 'diagonal_main', center)),
                })
                allLines.push({
                    start: reflectPoint(line.start, 'diagonal_anti', center),
                    end: reflectPoint(line.end, 'diagonal_anti', center),
                    controlPoints: line.controlPoints?.map(p => reflectPoint(p, 'diagonal_anti', center)),
                })
            }
        }

        if (symmetry === SymmetryType.ROTATIONAL_90) {
            for (const angle of [Math.PI / 2, Math.PI, 3 * Math.PI / 2]) {
                for (const line of lines) {
                    allLines.push({
                        start: rotatePoint(line.start, angle, center),
                        end: rotatePoint(line.end, angle, center),
                        controlPoints: line.controlPoints?.map(p => rotatePoint(p, angle, center)),
                    })
                }
            }
        }

        if (symmetry === SymmetryType.ROTATIONAL_180) {
            for (const line of lines) {
                allLines.push({
                    start: rotatePoint(line.start, Math.PI, center),
                    end: rotatePoint(line.end, Math.PI, center),
                    controlPoints: line.controlPoints?.map(p => rotatePoint(p, Math.PI, center)),
                })
            }
        }

        if (symmetry === SymmetryType.RADIAL) {
            for (const angle of [Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3]) {
                for (const line of lines) {
                    allLines.push({
                        start: rotatePoint(line.start, angle, center),
                        end: rotatePoint(line.end, angle, center),
                        controlPoints: line.controlPoints?.map(p => rotatePoint(p, angle, center)),
                    })
                }
            }
        }

        return allLines
    }

    // ─────────────────────────────────────────────────────────────
    // Template Router
    // ─────────────────────────────────────────────────────────────

    generateFromTemplate(template: string, gridType: string = 'square', symmetry: SymmetryType = SymmetryType.NONE): KolamPattern {
        let pattern: KolamPattern

        switch (template) {
            case 'pulli': pattern = this.generatePulli(gridType); break
            case 'sikku': pattern = this.generateSikku(gridType); break
            case 'kambi': pattern = this.generateKambi(); break
            case 'neli': pattern = this.generateNeli(); break
            case 'padi': pattern = this.generatePadi(); break
            case 'star': pattern = this.generateStar(); break
            case 'diamond': pattern = this.generateDiamond(); break
            case 'spiral': pattern = this.generateSpiral(); break
            case 'mandala': pattern = this.generateMandala(); break
            case 'lsystem': pattern = this.generateLSystemKolam(); break
            case 'koch': pattern = this.generateKochSnowflake(); break
            case 'sierpinski': pattern = this.generateSierpinskiTriangle(); break
            case 'dragon': pattern = this.generateDragonCurve(); break
            default: pattern = this.generatePulli(gridType); break
        }

        // Apply symmetry if requested
        if (symmetry !== SymmetryType.NONE) {
            pattern.lines = this.applySymmetry(pattern.lines, symmetry)
            pattern.metadata.symmetry = symmetry
        }

        // Recalculate metadata after symmetry
        const adj = buildAdjacency(pattern.dots, pattern.lines, this.spacing * 0.5)
        pattern.metadata.lineCount = pattern.lines.length
        pattern.metadata.isEulerian = isEulerian(adj)
        pattern.metadata.connectedComponents = countConnectedComponents(adj)
        pattern.metadata.holeCount = countCycles(adj)

        return pattern
    }

    // ─────────────────────────────────────────────────────────────
    // SVG Renderer (Advanced with color themes, gradients, animation)
    // ─────────────────────────────────────────────────────────────

    static COLOR_THEMES: Record<string, { bg: string[]; line: string; lineAlt: string; dot: string; dotStroke: string; glow: string }> = {
        traditional: { bg: ['#FFF8E1', '#FFF3C4'], line: '#8B4513', lineAlt: '#A0522D', dot: '#5D3A1A', dotStroke: '#8B6914', glow: '#D4A017' },
        royal: { bg: ['#1a0033', '#0d001a'], line: '#FFD700', lineAlt: '#FFA500', dot: '#FFD700', dotStroke: '#FF8C00', glow: '#FFD700' },
        festival: { bg: ['#fff0f5', '#ffe0eb'], line: '#DC143C', lineAlt: '#FF4500', dot: '#C71585', dotStroke: '#DC143C', glow: '#FF69B4' },
        sacred: { bg: ['#FFF8DC', '#FAEBD7'], line: '#CD853F', lineAlt: '#B8860B', dot: '#8B7355', dotStroke: '#CD853F', glow: '#DAA520' },
        earth: { bg: ['#f5f5dc', '#e8e4d4'], line: '#556B2F', lineAlt: '#6B8E23', dot: '#3B4A2B', dotStroke: '#556B2F', glow: '#7CFC00' },
        monochrome: { bg: ['#ffffff', '#f8f8f8'], line: '#1a1a1a', lineAlt: '#333333', dot: '#000000', dotStroke: '#444444', glow: '#666666' },
    }

    toSVG(pattern: KolamPattern, options?: { theme?: string; animate?: boolean; lineWidth?: number; dotSize?: number }): string {
        const w = pattern.width, h = pattern.height
        const theme = KolamEngine.COLOR_THEMES[options?.theme ?? 'traditional'] ?? KolamEngine.COLOR_THEMES.traditional
        const animate = options?.animate ?? false
        const lineWidth = options?.lineWidth ?? 2.5
        const dotSize = options?.dotSize ?? 4

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n`

        // Definitions: gradients, filters
        svg += `  <defs>\n`
        svg += `    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">\n`
        svg += `      <stop offset="0%" stop-color="${theme.bg[0]}"/>\n`
        svg += `      <stop offset="100%" stop-color="${theme.bg[1]}"/>\n`
        svg += `    </radialGradient>\n`
        svg += `    <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>\n`
        svg += `    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">\n`
        svg += `      <stop offset="0%" stop-color="${theme.line}"/>\n`
        svg += `      <stop offset="100%" stop-color="${theme.lineAlt}"/>\n`
        svg += `    </linearGradient>\n`
        svg += `  </defs>\n`

        // Background
        svg += `  <rect width="${w}" height="${h}" fill="url(#bgGrad)" rx="8"/>\n`

        // Decorative border
        svg += `  <rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="${theme.line}" stroke-width="1" stroke-dasharray="4 4" opacity="0.3" rx="4"/>\n`

        // Draw lines with gradient
        const totalLines = pattern.lines.length
        svg += `  <g stroke="url(#lineGrad)" stroke-width="${lineWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">\n`
        pattern.lines.forEach((line, idx) => {
            const delay = animate ? (idx / totalLines * 3).toFixed(2) : 0
            const animAttr = animate ? ` stroke-dasharray="1000" stroke-dashoffset="1000"><animate attributeName="stroke-dashoffset" from="1000" to="0" dur="2s" begin="${delay}s" fill="freeze"/` : ''
            if (line.controlPoints && line.controlPoints.length > 0) {
                const cp = line.controlPoints[0]
                svg += `    <path d="M ${line.start.x.toFixed(1)} ${line.start.y.toFixed(1)} Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)} ${line.end.x.toFixed(1)} ${line.end.y.toFixed(1)}"${animAttr}>\n`
            } else {
                svg += `    <line x1="${line.start.x.toFixed(1)}" y1="${line.start.y.toFixed(1)}" x2="${line.end.x.toFixed(1)}" y2="${line.end.y.toFixed(1)}"${animAttr}>\n`
            }
        })
        svg += `  </g>\n`

        // Draw dots with glow
        svg += `  <g fill="${theme.dot}" stroke="${theme.dotStroke}" stroke-width="1.5">\n`
        pattern.dots.forEach((dot, idx) => {
            const animDelay = animate ? (idx / pattern.dots.length * 2).toFixed(2) : null
            if (animate) {
                svg += `    <circle cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="0"><animate attributeName="r" from="0" to="${dotSize}" dur="0.3s" begin="${animDelay}s" fill="freeze"/></circle>\n`
            } else {
                svg += `    <circle cx="${dot.x.toFixed(1)}" cy="${dot.y.toFixed(1)}" r="${dotSize}"/>\n`
            }
        })
        svg += `  </g>\n`

        // Center marker
        svg += `  <circle cx="${this.centerX}" cy="${this.centerY}" r="2" fill="${theme.glow}" opacity="0.5"/>\n`

        svg += `</svg>`
        return svg
    }

    // ─────────────────────────────────────────────────────────────
    // Build Pattern with Metadata
    // ─────────────────────────────────────────────────────────────

    private buildPattern(dots: KolamDot[], lines: KolamLine[], template: string, kolamType: KolamTypeEnum): KolamPattern {
        const adj = buildAdjacency(dots, lines, this.spacing * 0.5)
        const lineCount = lines.length
        const dotCount = dots.length
        const eulerian = isEulerian(adj)
        const components = countConnectedComponents(adj)
        const holes = countCycles(adj)

        // Complexity scoring
        const complexityScore = Math.min(1.0,
            0.3 * (dotCount / 100) +
            0.3 * (lineCount / 200) +
            0.2 * holes +
            0.2 * (dotCount > 0 ? lineCount / dotCount : 0)
        )
        let complexityLabel = 'simple'
        if (complexityScore >= 0.6) complexityLabel = 'very_complex'
        else if (complexityScore >= 0.4) complexityLabel = 'complex'
        else if (complexityScore >= 0.2) complexityLabel = 'moderate'

        // Construction steps
        const steps: string[] = [
            `Place ${dotCount} dots in a ${template === 'mandala' ? 'circular' : template === 'diamond' ? 'diamond' : 'square'} grid pattern`,
            `Draw ${lineCount} ${kolamType === KolamTypeEnum.SIKKU ? 'curved interlacing' : kolamType === KolamTypeEnum.NELI ? 'flowing Bézier' : 'straight'} lines connecting adjacent dots`,
        ]
        if (eulerian) steps.push('The pattern forms a continuous Eulerian path — it can be drawn in one stroke without lifting the pen')
        if (holes > 0) steps.push(`The pattern contains ${holes} closed loop(s), creating ${holes} enclosed region(s)`)
        if (components === 1) steps.push('All dots are connected in a single connected component')
        else if (components > 1) steps.push(`The pattern has ${components} disconnected components`)

        // Mathematical principles
        const principles: string[] = [
            `Graph representation: ${dotCount} nodes, ${lineCount} edges`,
            `Edge density: ${dotCount > 1 ? (lineCount / (dotCount * (dotCount - 1) / 2) * 100).toFixed(1) : 0}%`,
        ]
        if (eulerian) principles.push('Eulerian path exists — classic property of Sikku/Kambi Kolams')
        principles.push(`Topology: ${holes} holes, ${components} connected component(s)`)
        principles.push(`Complexity class: ${complexityLabel} (score: ${complexityScore.toFixed(2)})`)

        return {
            dots,
            lines,
            width: this.canvasSize,
            height: this.canvasSize,
            metadata: {
                template,
                gridSize: this.gridSize,
                symmetry: SymmetryType.NONE,
                kolamType,
                dotCount,
                lineCount,
                isEulerian: eulerian,
                connectedComponents: components,
                holeCount: holes,
                complexityScore,
                complexityLabel,
                constructionSteps: steps,
                mathematicalPrinciples: principles,
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Convenience: Map form values to engine params
// ═══════════════════════════════════════════════════════════════

export function mapFormToEngine(formValues: {
    kolamType?: string
    gridSize?: string
    symmetryType?: string
    dotGridType?: string
}): { template: string; gridSize: number; symmetry: SymmetryType; gridType: string } {

    // Map kolamType string → template name
    const typeMap: Record<string, string> = {
        'Pulli Kolam (Dot-Based Kolam)': 'pulli',
        'Sikku Kolam (Chikku or Knot Kolam)': 'sikku',
        'Kambi Kolam (Line or Wire-Like Kolam)': 'kambi',
        'Neli Kolam (Curvy or Slithering Kolam)': 'neli',
        'Kodu Kolam (Tessellated Kolam)': 'pulli',
        'Padi Kolam (Manai Kolam or Step Kolam)': 'padi',
        'Star Kolam (Nakshatra Kolam)': 'star',
        'Mandala Kolam': 'mandala',
        'Freehand Kolam': 'neli',
        'Swastika Kolam': 'lsystem',
        'Celtic Knot Kolam': 'dragon',
        '3D Kolam': 'koch',
        'Digital Kolam': 'sierpinski',
    }
    const template = typeMap[formValues.kolamType ?? ''] ?? 'pulli'

    // Map gridSize string → number
    const sizeMap: Record<string, number> = {
        'Small (3x3)': 3, 'Medium (5x5)': 5, 'Large (7x7)': 7, 'Extra Large (9x9 or bigger)': 9
    }
    const gridSize = sizeMap[formValues.gridSize ?? ''] ?? 5

    // Map symmetry string → enum
    const symMap: Record<string, SymmetryType> = {
        'None': SymmetryType.NONE,
        'Vertical': SymmetryType.VERTICAL,
        'Horizontal': SymmetryType.HORIZONTAL,
        'Diagonal': SymmetryType.DIAGONAL,
        'Reflective': SymmetryType.BILATERAL,
        '90° Rotational Symmetry': SymmetryType.ROTATIONAL_90,
        '180° Rotational Symmetry': SymmetryType.ROTATIONAL_180,
        '360° Rotational Symmetry': SymmetryType.ROTATIONAL_90,
        'Radial': SymmetryType.RADIAL,
        'Point': SymmetryType.ROTATIONAL_180,
        'Cyclic': SymmetryType.RADIAL,
        'Bilateral': SymmetryType.BILATERAL,
        'Fractal': SymmetryType.NONE,
        'Tessellation': SymmetryType.NONE,
        'Translational': SymmetryType.NONE,
        'Glide Reflection': SymmetryType.HORIZONTAL,
    }
    const symmetry = symMap[formValues.symmetryType ?? ''] ?? SymmetryType.NONE

    // Map dotGridType → grid type
    const gridMap: Record<string, string> = {
        'Square Grid': 'square',
        'Diamond Grid': 'diamond',
        'Triangular Grid': 'triangular',
        'Hexagonal Grid': 'hexagonal',
        'Circular Grid': 'circular',
        'Random Dots': 'square',
        'No Dots (Freehand)': 'square',
    }
    const gridType = gridMap[formValues.dotGridType ?? ''] ?? 'square'

    return { template, gridSize, symmetry, gridType }
}
