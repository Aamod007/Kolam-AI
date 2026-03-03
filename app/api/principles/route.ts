import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DESIGN_PRINCIPLES = {
  construction_rules: [
    "Start with a regular dot grid - typically square or rectangular arrangement",
    "Connect dots following a specific symmetry (horizontal, vertical, diagonal, rotational)",
    "Maintain continuous line flow when possible for Sikku patterns",
    "Create closed loops to form intricate designs",
    "Use reflection and rotation to achieve symmetrical patterns",
    "Work from center outward for radial designs",
    "Each line should connect either to another dot or to another line"
  ],
  symmetry_types: {
    horizontal: {
      description: "Mirror across horizontal axis (top reflects to bottom)",
      example: "A pattern reflected across a horizontal line"
    },
    vertical: {
      description: "Mirror across vertical axis (left reflects to right)",
      example: "Left side of design mirrors right side"
    },
    diagonal: {
      description: "Mirror across diagonal axes (45-degree reflections)",
      example: "Corner-to-corner symmetry"
    },
    rotational_90: {
      description: "4-fold rotational symmetry (rotates 90° to match)",
      example: "Star patterns with rotational symmetry"
    },
    rotational_180: {
      description: "2-fold rotational symmetry (rotates 180° to match)",
      example: "Simple bilateral designs"
    },
    radial: {
      description: "Multiple axes radiating from center",
      example: "Mandala and circular patterns"
    }
  },
  grid_types: {
    square_grid: {
      description: "Regular grid with equal horizontal and vertical spacing",
      common_sizes: ["3x3", "5x5", "7x7", "9x9"]
    },
    rectangular_grid: {
      description: "Grid with different horizontal and vertical spacing",
      common_sizes: ["4x6", "5x7"]
    },
    diamond_grid: {
      description: "Square grid rotated 45 degrees",
      common_sizes: ["5x5", "7x7"]
    },
    triangular_grid: {
      description: "Triangle-based lattice arrangement",
      common_sizes: ["6x6", "9x9"]
    },
    circular_grid: {
      description: "Concentric rings of dots",
      common_sizes: ["3 rings", "5 rings"]
    }
  },
  pattern_types: {
    pulli: {
      name: "Pulli Kolam",
      description: "Dot-based patterns where lines connect directly from dot to dot",
      difficulty: "beginner to intermediate",
      characteristics: ["Straight lines", "Grid-based", "Geometric shapes"]
    },
    sikku: {
      name: "Sikku Kolam", 
      description: "Knot-based patterns with continuous curved lines weaving around dots",
      difficulty: "intermediate to advanced",
      characteristics: ["Curved lines", "Interlacing", "No dot-to-dot connection"]
    },
    kambi: {
      name: "Kambi Kolam",
      description: "Wire-like patterns that form continuous loops",
      difficulty: "intermediate",
      characteristics: ["Single continuous line", "Loop formations", "Decorative"]
    },
    neli: {
      name: "Neli Kolam",
      description: "Curvy flowing patterns without specific grid constraints",
      difficulty: "advanced",
      characteristics: ["Freeform curves", "Organic shapes", "Artistic expression"]
    },
    mandala: {
      name: "Mandala Kolam",
      description: "Circular symmetrical patterns with multiple rings",
      difficulty: "advanced to expert",
      characteristics: ["Radial symmetry", "Multiple rings", "Complex geometry"]
    }
  },
  complexity_metrics: {
    simple: {
      description: "Basic patterns with few dots (9-25) and minimal line connections",
      dot_range: "3x3 to 5x5 grid",
      line_count: "8-20 lines"
    },
    moderate: {
      description: "Intermediate patterns with moderate complexity",
      dot_range: "5x5 to 7x7 grid", 
      line_count: "20-40 lines"
    },
    complex: {
      description: "Advanced patterns with multiple symmetries and intricate designs",
      dot_range: "7x7 to 9x9 grid",
      line_count: "40-80 lines"
    },
    very_complex: {
      description: "Expert-level intricate designs with hundreds of elements",
      dot_range: "9x9+ grid or custom arrangements",
      line_count: "80+ lines"
    }
  },
  mathematical_concepts: {
    graph_theory: "Kolams can be modeled as graphs where dots are nodes and lines are edges",
    symmetry_groups: "Patterns often exhibit D4 dihedral group symmetry (8 symmetries of a square)",
    eulerian_paths: "Many Sikku kolams are Eulerian paths - single continuous lines",
    topology: "The number of holes/loops in a kolam relates to its topological properties",
    fractals: "Some complex kolams exhibit self-similar fractal-like properties"
  }
}

export async function GET() {
  return NextResponse.json(DESIGN_PRINCIPLES)
}
