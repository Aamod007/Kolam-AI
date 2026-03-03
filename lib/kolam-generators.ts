export interface Dot {
    x: number;
    y: number;
    id: string;
}

export interface KolamData {
    dots: Dot[];
    paths: string[];
    width: number;
    height: number;
}

/**
 * Generates a standard square/rectangular diamond dot grid.
 * size: number of dots in the middle (widest) row.
 */
export function generateDiamondGrid(size: number, spacing: number = 50): { dots: Dot[], width: number, height: number } {
    const dots: Dot[] = [];
    const offset = spacing / 2;
    const gridWidth = size * spacing;
    const gridHeight = size * spacing;

    const mid = Math.floor(size / 2);

    for (let r = 0; r < size; r++) {
        // Number of dots in this row (diamond shape)
        const dotsInRow = size - Math.abs(mid - r);
        const startX = (gridWidth - (dotsInRow - 1) * spacing) / 2;
        const y = offset + r * spacing;

        for (let c = 0; c < dotsInRow; c++) {
            const x = startX + c * spacing;
            dots.push({ x, y, id: `r${r}-c${c}` });
        }
    }

    return { dots, width: gridWidth, height: gridHeight };
}

/**
 * Generates a simple Pulli (dot-connecting) Kolam.
 * For a basic example, we generate a star or geometric outline connecting the outer dots.
 */
export function generatePulliKolam(size: number, spacing: number = 50): KolamData {
    const { dots, width, height } = generateDiamondGrid(size, spacing);
    const paths: string[] = [];

    if (size === 3) {
        // Basic 3x3 diamond: 1 dot top, 3 middle, 1 bottom.
        // Connect outer edges to form a diamond
        paths.push(`M ${dots[0].x} ${dots[0].y} L ${dots[3].x} ${dots[3].y} L ${dots[4].x} ${dots[4].y} L ${dots[1].x} ${dots[1].y} Z`);
    } else if (size === 5) {
        // A more complex star for 5x5
        paths.push(`M ${dots[0].x} ${dots[0].y} L ${dots[8].x} ${dots[8].y} L ${dots[12].x} ${dots[12].y} L ${dots[4].x} ${dots[4].y} Z`);
        paths.push(`M ${dots[2].x} ${dots[2].y} L ${dots[10].x} ${dots[10].y} L ${dots[6].x} ${dots[6].y} L ${dots[2].x} ${dots[2].y} Z`);
    } else {
        // Fallback: draw a bounding diamond for any size
        const top = dots[0];
        const bottom = dots[dots.length - 1];
        const midRowStart = Math.floor(size / 2);
        let leftCount = 0;
        for (let r = 0; r < midRowStart; r++) leftCount += (size - Math.abs(Math.floor(size / 2) - r));
        const left = dots[leftCount];
        const right = dots[leftCount + size - 1];

        paths.push(`M ${top.x} ${top.y} L ${right.x} ${right.y} L ${bottom.x} ${bottom.y} L ${left.x} ${left.y} Z`);
    }

    return { dots, paths, width, height };
}

/**
 * Generates a simple Sikku (interlaced) Kolam.
 * Sikku kolams weave around the dots. We use bezier curves to loop around dots.
 */
export function generateSikkuKolam(size: number, spacing: number = 50): KolamData {
    const { dots, width, height } = generateDiamondGrid(size, spacing);
    const paths: string[] = [];

    // Generating true programmatic Sikku logic is mathematically very complex (knot theory).
    // For the MVP Learning Mode, we hardcode elegant SVG paths parameterized by spacing for small sizes.

    if (size === 3) {
        // A classic 3-dot knot (Infinity loop style)
        const t = dots[0]; // top
        const ml = dots[1], mc = dots[2], mr = dots[3]; // mid left, center, right
        const b = dots[4]; // bottom

        const r = spacing * 0.45; // curve radius

        // Loop around top -> mid right -> bottom -> mid left -> back to top
        // We construct a single continuous SVG path weaving around these dots.
        const path = `M ${t.x} ${t.y - r} 
      C ${t.x + r * 2} ${t.y - r}, ${mr.x + r} ${mr.y - r * 2}, ${mr.x + r} ${mr.y}
      C ${mr.x + r} ${mr.y + r * 2}, ${b.x + r * 2} ${b.y + r}, ${b.x} ${b.y + r}
      C ${b.x - r * 2} ${b.y + r}, ${ml.x - r} ${ml.y + r * 2}, ${ml.x - r} ${ml.y}
      C ${ml.x - r} ${ml.y - r * 2}, ${t.x - r * 2} ${t.y - r}, ${t.x} ${t.y - r} Z`;

        paths.push(path);
    } else {
        // Generative fallback: circles around all dots and a wavy border
        for (let d of dots) {
            const r = spacing * 0.3;
            paths.push(`M ${d.x - r} ${d.y} A ${r} ${r} 0 1 1 ${d.x + r} ${d.y} A ${r} ${r} 0 1 1 ${d.x - r} ${d.y}`);
        }
    }

    return { dots, paths, width, height };
}
