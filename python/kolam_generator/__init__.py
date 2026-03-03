"""
Kolam Generator - Generate Kolam patterns using mathematical rules
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Optional, Callable
from enum import Enum
import svgwrite
from PIL import Image, ImageDraw
import math


class KolamType(Enum):
    """Traditional Kolam types"""
    PULLI = "pulli"          # Dot-based Kolam
    SIKKU = "sikku"         # Knot-based Kolam  
    KAMBI = "kambi"         # Line/Kambi Kolam
    NELI = "neli"           # Curvy Kolam
    KODU = "kodu"           # Tessellated
    PADI = "padi"           # Step Kolam
    IDUKKU = "idukku"       # Interlocking
    FREEHAND = "freehand"


class SymmetryType(Enum):
    """Symmetry types for pattern generation"""
    NONE = "none"
    HORIZONTAL = "horizontal"
    VERTICAL = "vertical"
    DIAGONAL = "diagonal"
    ROTATIONAL_90 = "rotational_90"
    ROTATIONAL_180 = "rotational_180"
    RADIAL = "radial"
    BILATERAL = "bilateral"
    DIHEDRAL = "dihedral"


@dataclass
class Point:
    """2D point"""
    x: float
    y: float
    
    def __add__(self, other: 'Point') -> 'Point':
        return Point(self.x + other.x, self.y + other.y)
    
    def __sub__(self, other: 'Point') -> 'Point':
        return Point(self.x - other.x, self.y - other.y)
    
    def __mul__(self, scalar: float) -> 'Point':
        return Point(self.x * scalar, self.y * scalar)
    
    def rotate(self, angle: float, center: 'Point' = None) -> 'Point':
        """Rotate point around center"""
        if center is None:
            center = Point(0, 0)
        
        dx = self.x - center.x
        dy = self.y - center.y
        
        cos_a = math.cos(angle)
        sin_a = math.sin(angle)
        
        return Point(
            center.x + dx * cos_a - dy * sin_a,
            center.y + dx * sin_a + dy * cos_a
        )
    
    def reflect(self, axis: str, center: 'Point' = None) -> 'Point':
        """Reflect point across axis"""
        if center is None:
            center = Point(0, 0)
        
        if axis == 'horizontal':
            return Point(self.x, 2 * center.y - self.y)
        elif axis == 'vertical':
            return Point(2 * center.x - self.x, self.y)
        else:
            return Point(self.x, self.y)


@dataclass
class Dot:
    """A dot in the Kolam grid"""
    x: float
    y: float
    id: int = 0


@dataclass
class LineSegment:
    """A line segment connecting two points"""
    start: Point
    end: Point
    
    @property
    def length(self) -> float:
        return math.sqrt((self.end.x - self.start.x)**2 + (self.end.y - self.start.y)**2)
    
    @property
    def midpoint(self) -> Point:
        return Point(
            (self.start.x + self.end.x) / 2,
            (self.start.y + self.end.y) / 2
        )


@dataclass
class KolamPattern:
    """Complete Kolam pattern"""
    dots: List[Dot] = field(default_factory=list)
    lines: List[LineSegment] = field(default_factory=list)
    width: int = 500
    height: int = 500
    
    def to_svg(self, filename: str, dot_radius: int = 5, line_width: int = 2):
        """Export pattern to SVG"""
        dwg = svgwrite.Drawing(filename, size=(self.width, self.height))
        
        for line in self.lines:
            dwg.add(dwg.line(
                start=(line.start.x, line.start.y),
                end=(line.end.x, line.end.y),
                stroke='black',
                stroke_width=line_width
            ))
        
        for dot in self.dots:
            dwg.add(dwg.circle(
                center=(dot.x, dot.y),
                r=dot_radius,
                fill='black'
            ))
        
        dwg.save()
    
    def to_image(self, filename: str, dot_radius: int = 5, line_width: int = 2, 
                 bg_color: Tuple[int, int, int] = (255, 255, 255),
                 dot_color: Tuple[int, int, int] = (0, 0, 0),
                 line_color: Tuple[int, int, int] = (0, 0, 0)):
        """Export pattern to PNG image"""
        img = Image.new('RGB', (self.width, self.height), bg_color)
        draw = ImageDraw.Draw(img)
        
        for line in self.lines:
            draw.line(
                [(line.start.x, line.start.y), (line.end.x, line.end.y)],
                fill=line_color,
                width=line_width
            )
        
        for dot in self.dots:
            draw.ellipse(
                [dot.x - dot_radius, dot.y - dot_radius,
                 dot.x + dot_radius, dot.y + dot_radius],
                fill=dot_color
            )
        
        img.save(filename)
    
    def get_construction_steps(self) -> List[Tuple[Point, Point]]:
        """Get ordered list of line segments for step-by-step drawing"""
        return [(line.start, line.end) for line in self.lines]


class LSystem:
    """L-system for generating Kolam patterns"""
    
    def __init__(self, axiom: str, rules: Dict[str, str], angle: float = 90):
        self.axiom = axiom
        self.rules = rules
        self.angle = angle
    
    def generate(self, iterations: int) -> str:
        """Generate the L-system string after n iterations"""
        result = self.axiom
        for _ in range(iterations):
            new_result = ""
            for char in result:
                new_result += self.rules.get(char, char)
            result = new_result
        return result
    
    def interpret(self, l_string: str, start: Point, length: float) -> KolamPattern:
        """Interpret L-system string to create Kolam pattern"""
        pattern = KolamPattern()
        
        x, y = start.x, start.y
        angle = 0
        stack = []
        
        dots = []
        lines = []
        dot_id = 0
        
        for char in l_string:
            if char == 'F':
                new_x = x + length * math.cos(math.radians(angle))
                new_y = y + length * math.sin(math.radians(angle))
                
                lines.append(LineSegment(Point(x, y), Point(new_x, new_y)))
                
                dots.append(Dot(x, y, dot_id))
                dot_id += 1
                
                x, y = new_x, new_y
            elif char == 'f':
                new_x = x + length * math.cos(math.radians(angle))
                new_y = y + length * math.sin(math.radians(angle))
                x, y = new_x, new_y
            elif char == '+':
                angle += self.angle
            elif char == '-':
                angle -= self.angle
            elif char == '[':
                stack.append((x, y, angle))
            elif char == ']':
                if stack:
                    x, y, angle = stack.pop()
        
        pattern.dots = dots
        pattern.lines = lines
        return pattern


class KolamGenerator:
    """Main class for generating Kolam patterns"""
    
    def __init__(self, grid_size: int = 5, spacing: float = 50, 
                 center_x: float = 250, center_y: float = 250):
        self.grid_size = grid_size
        self.spacing = spacing
        self.center_x = center_x
        self.center_y = center_y
    
    def generate_grid(self) -> List[Dot]:
        """Generate dot grid"""
        dots = []
        offset = (self.grid_size - 1) * self.spacing / 2
        
        dot_id = 0
        for row in range(self.grid_size):
            for col in range(self.grid_size):
                x = self.center_x + col * self.spacing - offset
                y = self.center_y + row * self.spacing - offset
                dots.append(Dot(x=x, y=y, id=dot_id))
                dot_id += 1
        
        return dots
    
    def generate_pulli_kolam(self, pattern: str = "basic") -> KolamPattern:
        """Generate Pulli (dot-based) Kolam patterns"""
        pattern_obj = KolamPattern()
        pattern_obj.dots = self.generate_grid()
        
        offset = (self.grid_size - 1) * self.spacing / 2
        
        lines = []
        
        if pattern == "basic":
            for row in range(self.grid_size):
                for col in range(self.grid_size - 1):
                    i = row * self.grid_size + col
                    x1 = self.center_x + col * self.spacing - offset
                    y1 = self.center_y + row * self.spacing - offset
                    x2 = self.center_x + (col + 1) * self.spacing - offset
                    y2 = y1
                    lines.append(LineSegment(Point(x1, y1), Point(x2, y2)))
        
        elif pattern == "diagonal":
            for row in range(self.grid_size - 1):
                for col in range(self.grid_size - 1):
                    i = row * self.grid_size + col
                    x1 = self.center_x + col * self.spacing - offset
                    y1 = self.center_y + row * self.spacing - offset
                    
                    lines.append(LineSegment(
                        Point(x1, y1),
                        Point(x1 + self.spacing, y1 + self.spacing)
                    ))
                    lines.append(LineSegment(
                        Point(x1 + self.spacing, y1),
                        Point(x1, y1 + self.spacing)
                    ))
        
        elif pattern == "diamond":
            for row in range(self.grid_size):
                for col in range(self.grid_size):
                    x = self.center_x + col * self.spacing - offset
                    y = self.center_y + row * self.spacing - offset
                    
                    if col < self.grid_size - 1:
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x + self.spacing/2, y - self.spacing/2)
                        ))
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x + self.spacing/2, y + self.spacing/2)
                        ))
        
        pattern_obj.lines = lines
        return pattern_obj
    
    def generate_sikku_kolam(self, pattern: str = "basic") -> KolamPattern:
        """Generate Sikku (knot) Kolam patterns"""
        pattern_obj = KolamPattern()
        pattern_obj.dots = self.generate_grid()
        
        offset = (self.grid_size - 1) * self.spacing / 2
        lines = []
        
        if pattern == "basic":
            for row in range(self.grid_size):
                for col in range(self.grid_size):
                    x = self.center_x + col * self.spacing - offset
                    y = self.center_y + row * self.spacing - offset
                    
                    if col < self.grid_size - 1:
                        mid_x = (x + x + self.spacing) / 2
                        control_offset = self.spacing / 4
                        
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(mid_x, y - control_offset)
                        ))
                        lines.append(LineSegment(
                            Point(mid_x, y - control_offset),
                            Point(x + self.spacing, y)
                        ))
                    
                    if row < self.grid_size - 1:
                        mid_y = (y + y + self.spacing) / 2
                        control_offset = self.spacing / 4
                        
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x + control_offset, mid_y)
                        ))
                        lines.append(LineSegment(
                            Point(x + control_offset, mid_y),
                            Point(x, y + self.spacing)
                        ))
        
        elif pattern == "interlaced":
            for row in range(self.grid_size):
                for col in range(self.grid_size):
                    x = self.center_x + col * self.spacing - offset
                    y = self.center_y + row * self.spacing - offset
                    
                    if col < self.grid_size - 1 and row < self.grid_size - 1:
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x + self.spacing, y + self.spacing)
                        ))
                    
                    if col > 0 and row < self.grid_size - 1:
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x - self.spacing, y + self.spacing)
                        ))
        
        pattern_obj.lines = lines
        return pattern_obj
    
    def generate_with_symmetry(self, base_pattern: List[LineSegment],
                              symmetry: SymmetryType) -> KolamPattern:
        """Generate pattern with specified symmetry"""
        pattern_obj = KolamPattern()
        
        center = Point(self.center_x, self.center_y)
        
        all_lines = list(base_pattern)
        
        if symmetry in [SymmetryType.HORIZONTAL, SymmetryType.BILATERAL, SymmetryType.DIHEDRAL]:
            reflected = []
            for line in base_pattern:
                reflected.append(LineSegment(
                    line.start.reflect('horizontal', center),
                    line.end.reflect('horizontal', center)
                ))
            all_lines.extend(reflected)
        
        if symmetry in [SymmetryType.VERTICAL, SymmetryType.BILATERAL, SymmetryType.DIHEDRAL]:
            reflected = []
            for line in base_pattern:
                reflected.append(LineSegment(
                    line.start.reflect('vertical', center),
                    line.end.reflect('vertical', center)
                ))
            all_lines.extend(reflected)
        
        if symmetry in [SymmetryType.DIAGONAL, SymmetryType.DIHEDRAL]:
            for angle in [45, 135]:
                rotated = []
                for line in base_pattern:
                    rotated.append(LineSegment(
                        line.start.rotate(math.radians(angle), center),
                        line.end.rotate(math.radians(angle), center)
                    ))
                all_lines.extend(rotated)
        
        if symmetry == SymmetryType.ROTATIONAL_90:
            for angle in [90, 180, 270]:
                rotated = []
                for line in base_pattern:
                    rotated.append(LineSegment(
                        line.start.rotate(math.radians(angle), center),
                        line.end.rotate(math.radians(angle), center)
                    ))
                all_lines.extend(rotated)
        
        if symmetry == SymmetryType.ROTATIONAL_180:
            rotated = []
            for line in base_pattern:
                rotated.append(LineSegment(
                    line.start.rotate(math.radians(180), center),
                    line.end.rotate(math.radians(180), center)
                ))
            all_lines.extend(rotated)
        
        if symmetry == SymmetryType.RADIAL:
            for angle in [60, 120, 180, 240, 300]:
                rotated = []
                for line in base_pattern:
                    rotated.append(LineSegment(
                        line.start.rotate(math.radians(angle), center),
                        line.end.rotate(math.radians(angle), center)
                    ))
                all_lines.extend(rotated)
        
        pattern_obj.lines = all_lines
        pattern_obj.dots = self.generate_grid()
        
        return pattern_obj
    
    def generate_from_template(self, template_name: str, 
                              params: Dict = None) -> KolamPattern:
        """Generate pattern from predefined templates"""
        templates = {
            "pulli_3x3": lambda: self._template_pulli_3x3(),
            "pulli_5x5": lambda: self._template_pulli_5x5(),
            "pulli_7x7": lambda: self._template_pulli_7x7(),
            "sikku_basic": lambda: self._template_sikku_basic(),
            "sikku_diagonal": lambda: self._template_sikku_diagonal(),
            "star": lambda: self._template_star(),
            "diamond": lambda: self._template_diamond(),
            "spiral": lambda: self._template_spiral(),
            "mandala": lambda: self._template_mandala(),
        }
        
        if template_name not in templates:
            raise ValueError(f"Unknown template: {template_name}")
        
        return templates[template_name]()
    
    def _template_pulli_3x3(self) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = 3
        pattern = self.generate_pulli_kolam("basic")
        self.grid_size = old_size
        return pattern
    
    def _template_pulli_5x5(self) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = 5
        pattern = self.generate_pulli_kolam("basic")
        self.grid_size = old_size
        return pattern
    
    def _template_pulli_7x7(self) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = 7
        pattern = self.generate_pulli_kolam("basic")
        self.grid_size = old_size
        return pattern
    
    def _template_sikku_basic(self) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = 5
        pattern = self.generate_sikku_kolam("basic")
        self.grid_size = old_size
        return pattern
    
    def _template_sikku_diagonal(self) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = 5
        pattern = self.generate_sikku_kolam("interlaced")
        self.grid_size = old_size
        return pattern
    
    def _template_star(self) -> KolamPattern:
        pattern = KolamPattern()
        center = Point(self.center_x, self.center_y)
        
        num_points = 8
        outer_radius = 150
        inner_radius = 60
        
        dots = []
        for i in range(num_points):
            angle = 2 * math.pi * i / num_points - math.pi / 2
            x = center.x + outer_radius * math.cos(angle)
            y = center.y + outer_radius * math.sin(angle)
            dots.append(Dot(x, y, i))
        
        for i in range(num_points):
            x1 = center.x + inner_radius * math.cos(angle)
            y1 = center.y + inner_radius * math.sin(angle)
            angle = 2 * math.pi * (i + 0.5) / num_points - math.pi / 2
            x2 = center.x + inner_radius * math.cos(angle)
            y2 = center.y + inner_radius * math.sin(angle)
            dots.append(Dot((x1+x2)/2, (y1+y2)/2, len(dots)))
        
        for i in range(num_points):
            pattern.lines.append(LineSegment(dots[i], dots[(i+1) % num_points]))
        
        pattern.dots = dots
        return pattern
    
    def _template_diamond(self) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = 5
        pattern = self.generate_pulli_kolam("diamond")
        self.grid_size = old_size
        return pattern
    
    def _template_spiral(self) -> KolamPattern:
        pattern = KolamPattern()
        
        center = Point(self.center_x, self.center_y)
        num_turns = 4
        points_per_turn = 20
        
        dots = []
        lines = []
        
        t = 0
        for i in range(num_turns * points_per_turn):
            angle = 2 * math.pi * i / points_per_turn
            radius = 10 + (i / (num_turns * points_per_turn)) * 140
            
            x = center.x + radius * math.cos(angle)
            y = center.y + radius * math.sin(angle)
            
            dots.append(Dot(x, y, i))
            
            if i > 0:
                lines.append(LineSegment(dots[i-1], dots[i]))
        
        pattern.dots = dots
        pattern.lines = lines
        return pattern
    
    def _template_mandala(self) -> KolamPattern:
        pattern = KolamPattern()
        
        center = Point(self.center_x, self.center_y)
        num_rings = 4
        points_per_ring = 12
        
        dots = []
        lines = []
        dot_id = 0
        
        for ring in range(1, num_rings + 1):
            radius = ring * 35
            
            for i in range(points_per_ring):
                angle = 2 * math.pi * i / points_per_ring
                x = center.x + radius * math.cos(angle)
                y = center.y + radius * math.sin(angle)
                dots.append(Dot(x, y, dot_id))
                dot_id += 1
        
        for ring in range(1, num_rings + 1):
            start_idx = (ring - 1) * points_per_ring
            for i in range(points_per_ring):
                lines.append(LineSegment(
                    dots[start_idx + i],
                    dots[start_idx + (i + 1) % points_per_ring]
                ))
        
        for ring in range(num_rings - 1):
            for i in range(points_per_ring):
                lines.append(LineSegment(
                    dots[ring * points_per_ring + i],
                    dots[(ring + 1) * points_per_ring + i]
                ))
        
        pattern.dots = dots
        pattern.lines = lines
        return pattern


def generate_kolam(template: str = "pulli_5x5", 
                  grid_size: int = 5,
                  symmetry: str = "none",
                  output_path: str = None,
                  output_format: str = "svg") -> Dict:
    """Convenience function to generate a Kolam pattern"""
    
    sym_map = {
        "none": SymmetryType.NONE,
        "horizontal": SymmetryType.HORIZONTAL,
        "vertical": SymmetryType.VERTICAL,
        "diagonal": SymmetryType.DIAGONAL,
        "rotational_90": SymmetryType.ROTATIONAL_90,
        "rotational_180": SymmetryType.ROTATIONAL_180,
        "radial": SymmetryType.RADIAL,
        "bilateral": SymmetryType.BILATERAL,
    }
    
    generator = KolamGenerator(grid_size=grid_size)
    pattern = generator.generate_from_template(template)
    
    if symmetry != "none" and symmetry in sym_map:
        base_lines = pattern.lines
        pattern = generator.generate_with_symmetry(base_lines, sym_map[symmetry])
    
    result = {
        "template": template,
        "grid_size": grid_size,
        "symmetry": symmetry,
        "num_dots": len(pattern.dots),
        "num_lines": len(pattern.lines),
        "construction_steps": [
            {"from": {"x": ls.start.x, "y": ls.start.y}, 
             "to": {"x": ls.end.x, "y": ls.end.y}}
            for ls in pattern.lines
        ]
    }
    
    if output_path:
        if output_format == "svg":
            pattern.to_svg(output_path)
        elif output_format == "png":
            pattern.to_image(output_path)
        result["output_file"] = output_path
    
    return result


if __name__ == "__main__":
    import json
    import sys
    
    if len(sys.argv) > 1:
        template = sys.argv[1] if len(sys.argv) > 1 else "pulli_5x5"
        grid_size = int(sys.argv[2]) if len(sys.argv) > 2 else 5
        
        result = generate_kolam(template=template, grid_size=grid_size)
        print(json.dumps(result, indent=2))
    else:
        result = generate_kolam()
        print(json.dumps(result, indent=2))
