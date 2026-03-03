import { NextResponse } from 'next/server'
import { KolamEngine, mapFormToEngine } from '@/lib/kolam-engine'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { kolamType, gridSize, symmetryType, dotGridType, pathStyle, culturalContext } = body

        // Map form values to engine parameters
        const { template, gridSize: size, symmetry, gridType } = mapFormToEngine({
            kolamType, gridSize, symmetryType, dotGridType
        })

        // Generate the pattern algorithmically
        const engine = new KolamEngine(size)
        const pattern = engine.generateFromTemplate(template, gridType, symmetry)
        const svg = engine.toSVG(pattern)

        // Convert SVG to base64 data URL for display
        const svgBase64 = Buffer.from(svg).toString('base64')
        const imageUrl = `data:image/svg+xml;base64,${svgBase64}`

        // Build human-readable details
        const details = [
            `**Algorithmic Generation** — Generated using mathematical rules, NOT AI image generation.`,
            ``,
            `**Pattern Type:** ${pattern.metadata.template} (${pattern.metadata.kolamType})`,
            `**Grid Size:** ${pattern.metadata.gridSize}×${pattern.metadata.gridSize}`,
            `**Symmetry:** ${pattern.metadata.symmetry}`,
            `**Dots:** ${pattern.metadata.dotCount} | **Lines:** ${pattern.metadata.lineCount}`,
            ``,
            `**Graph Analysis:**`,
            `• Eulerian Path: ${pattern.metadata.isEulerian ? '✅ Yes — can be drawn in one continuous stroke' : '❌ No — requires lifting the pen'}`,
            `• Connected Components: ${pattern.metadata.connectedComponents}`,
            `• Closed Loops: ${pattern.metadata.holeCount}`,
            `• Complexity: ${pattern.metadata.complexityLabel} (${(pattern.metadata.complexityScore * 100).toFixed(0)}%)`,
            ``,
            `**Construction Steps:**`,
            ...pattern.metadata.constructionSteps.map((s, i) => `${i + 1}. ${s}`),
            ``,
            `**Mathematical Principles:**`,
            ...pattern.metadata.mathematicalPrinciples.map(p => `• ${p}`),
        ].join('\n')

        // Store in MongoDB
        try {
            const { getDb } = await import('@/lib/mongodb')
            const db = await getDb()

            let userId = null
            try {
                const { getServerSession } = await import('next-auth/next')
                const { authOptions } = await import('@/app/api/auth/[...nextauth]/route')
                const session = await getServerSession(authOptions)
                userId = (session?.user as any)?.id || null
            } catch { }

            await db.collection('user_generations').insertOne({
                user_id: userId,
                generation_method: 'algorithmic',
                kolam_type: kolamType,
                template: pattern.metadata.template,
                grid_size: pattern.metadata.gridSize,
                symmetry_type: symmetryType,
                dot_grid_type: dotGridType,
                path_style: pathStyle,
                cultural_context: culturalContext,
                dot_count: pattern.metadata.dotCount,
                line_count: pattern.metadata.lineCount,
                is_eulerian: pattern.metadata.isEulerian,
                connected_components: pattern.metadata.connectedComponents,
                hole_count: pattern.metadata.holeCount,
                complexity_score: pattern.metadata.complexityScore,
                complexity_label: pattern.metadata.complexityLabel,
                image_data: imageUrl,
                details,
                created_at: new Date(),
            })
        } catch { }

        return NextResponse.json({
            imageUrl,
            details,
            metadata: pattern.metadata,
            svg,
        })
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || 'Algorithmic generation failed' },
            { status: 500 }
        )
    }
}
