"""
Kolam Generator - Generate Kolam patterns using mathematical rules
Version 2.0 - Fixed bugs and improved templates
"""

import math
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    logger.warning("NumPy not available. Some features will be limited.")

try:
    import svgwrite
    SVGDWRITE_AVAILABLE = True
except ImportError:
    SVGDWRITE_AVAILABLE = False
    logger.warning("svgwrite not available. SVG export disabled.")

try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("Pillow not available. PNG export disabled.")


class KolamType(Enum):
    """Traditional Kolam types"""
    PULLI = "pulli"
    SIKKU = "sikku"
    KAMBI = "kambi"
    NELI = "neli"
    KODU = "kodu"
    PADI = "padi"
    IDUKKU = "idukku"
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
    
    def to_dict(self) -> Dict:
        return {"x": self.x, "y": self.y}


@dataclass
class Dot:
    """A dot in the Kolam grid"""
    x: float
    y: float
    id: int = 0
    
    def to_dict(self) -> Dict:
        return {"id": self.id, "x": self.x, "y": self.y}


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
    
    def to_dict(self) -> Dict:
        return {
            "from": self.start.to_dict(),
            "to": self.end.to_dict(),
            "length": self.length
        }


@dataclass
class KolamPattern:
    """Complete Kolam pattern"""
    dots: List[Dot] = field(default_factory=list)
    lines: List[LineSegment] = field(default_factory=list)
    width: int = 500
    height: int = 500
    
    def to_svg(self, filename: str, dot_radius: int = 5, line_width: int = 2):
        """Export pattern to SVG"""
        if not SVGDWRITE_AVAILABLE:
            raise ImportError("svgwrite not available")
        
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
        if not PIL_AVAILABLE:
            raise ImportError("Pillow not available")
        
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
        self.angle = math.radians(angle)
    
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
        stack: List[Tuple[float, float, float]] = []
        
        dots = []
        lines = []
        dot_id = 0
        
        for char in l_string:
            if char == 'F':
                new_x = x + length * math.cos(angle)
                new_y = y + length * math.sin(angle)
                
                lines.append(LineSegment(Point(x, y), Point(new_x, new_y)))
                dots.append(Dot(x, y, dot_id))
                dot_id += 1
                
                x, y = new_x, new_y
            elif char == 'f':
                new_x = x + length * math.cos(angle)
                new_y = y + length * math.sin(angle)
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


class KolamGeneratorConfig:
    """Configuration for Kolam Generator"""
    def __init__(
        self,
        grid_size: int = 5,
        spacing: float = 50,
        center_x: float = 250,
        center_y: float = 250,
        min_grid_size: int = 2,
        max_grid_size: int = 15
    ):
        if not min_grid_size <= grid_size <= max_grid_size:
            raise ValueError(f"Grid size must be between {min_grid_size} and {max_grid_size}")
        
        self.grid_size = grid_size
        self.spacing = spacing
        self.center_x = center_x
        self.center_y = center_y
        self.min_grid_size = min_grid_size
        self.max_grid_size = max_grid_size


class KolamGenerator:
    """Main class for generating Kolam patterns"""
    
    def __init__(self, config: Optional[KolamGeneratorConfig] = None):
        if config is None:
            config = KolamGeneratorConfig()
        
        self.config = config
    
    @property
    def grid_size(self) -> int:
        return self.config.grid_size
    
    @grid_size.setter
    def grid_size(self, value: int) -> None:
        if not self.config.min_grid_size <= value <= self.config.max_grid_size:
            raise ValueError(f"Grid size must be between {self.config.min_grid_size} and {self.config.max_grid_size}")
        self.config.grid_size = value
    
    @property
    def center_x(self) -> float:
        return self.config.center_x
    
    @property
    def center_y(self) -> float:
        return self.config.center_y
    
    @property
    def spacing(self) -> float:
        return self.config.spacing
    
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
                    x = self.center_x + col * self.spacing - offset
                    y = self.center_y + row * self.spacing - offset
                    lines.append(LineSegment(
                        Point(x, y),
                        Point(x + self.spacing, y)
                    ))
        
        elif pattern == "diagonal":
            for row in range(self.grid_size - 1):
                for col in range(self.grid_size - 1):
                    x = self.center_x + col * self.spacing - offset
                    y = self.center_y + row * self.spacing - offset
                    lines.append(LineSegment(
                        Point(x, y),
                        Point(x + self.spacing, y + self.spacing)
                    ))
                    lines.append(LineSegment(
                        Point(x + self.spacing, y),
                        Point(x, y + self.spacing)
                    ))
        
        elif pattern == "diamond":
            for row in range(self.grid_size):
                for col in range(self.grid_size):
                    x = self.center_x + col * self.spacing - offset
                    y = self.center_y + row * self.spacing - offset
                    
                    if col < self.grid_size - 1:
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x + self.spacing / 2, y - self.spacing / 2)
                        ))
                        lines.append(LineSegment(
                            Point(x, y),
                            Point(x + self.spacing / 2, y + self.spacing / 2)
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
        
        if symmetry in (SymmetryType.HORIZONTAL, SymmetryType.BILATERAL, SymmetryType.DIHEDRAL):
            reflected = []
            for line in base_pattern:
                reflected.append(LineSegment(
                    line.start.reflect('horizontal', center),
                    line.end.reflect('horizontal', center)
                ))
            all_lines.extend(reflected)
        
        if symmetry in (SymmetryType.VERTICAL, SymmetryType.BILATERAL, SymmetryType.DIHEDRAL):
            reflected = []
            for line in base_pattern:
                reflected.append(LineSegment(
                    line.start.reflect('vertical', center),
                    line.end.reflect('vertical', center)
                ))
            all_lines.extend(reflected)
        
        if symmetry in (SymmetryType.DIAGONAL, SymmetryType.DIHEDRAL):
            for angle_deg in [45, 135]:
                angle_rad = math.radians(angle_deg)
                rotated = []
                for line in base_pattern:
                    rotated.append(LineSegment(
                        line.start.rotate(angle_rad, center),
                        line.end.rotate(angle_rad, center)
                    ))
                all_lines.extend(rotated)
        
        if symmetry == SymmetryType.ROTATIONAL_90:
            for angle_deg in [90, 180, 270]:
                angle_rad = math.radians(angle_deg)
                rotated = []
                for line in base_pattern:
                    rotated.append(LineSegment(
                        line.start.rotate(angle_rad, center),
                        line.end.rotate(angle_rad, center)
                    ))
                all_lines.extend(rotated)
        
        if symmetry == SymmetryType.ROTATIONAL_180:
            rotated = []
            for line in base_pattern:
                rotated.append(LineSegment(
                    line.start.rotate(math.pi, center),
                    line.end.rotate(math.pi, center)
                ))
            all_lines.extend(rotated)
        
        if symmetry == SymmetryType.RADIAL:
            for angle_deg in [60, 120, 180, 240, 300]:
                angle_rad = math.radians(angle_deg)
                rotated = []
                for line in base_pattern:
                    rotated.append(LineSegment(
                        line.start.rotate(angle_rad, center),
                        line.end.rotate(angle_rad, center)
                    ))
                all_lines.extend(rotated)
        
        pattern_obj.lines = all_lines
        pattern_obj.dots = self.generate_grid()
        
        return pattern_obj
    
    def generate_from_template(self, template_name: str, 
                              params: Optional[Dict] = None) -> KolamPattern:
        """Generate pattern from predefined templates"""
        params = params or {}
        
        templates = {
            "pulli_3x3": lambda: self._create_pulli_template(3),
            "pulli_5x5": lambda: self._create_pulli_template(5),
            "pulli_7x7": lambda: self._create_pulli_template(7),
            "pulli_9x9": lambda: self._create_pulli_template(9),
            "pulli_11x11": lambda: self._create_pulli_template(11),
            "sikku_3x3": lambda: self._create_sikku_template(3),
            "sikku_5x5": lambda: self._create_sikku_template(5),
            "sikku_7x7": lambda: self._create_sikku_template(7),
            "sikku_basic": lambda: self._create_sikku_template(5),
            "sikku_diagonal": lambda: self._create_sikku_diagonal_template(5),
            "star": lambda: self._create_star_template(),
            "diamond": lambda: self._create_diamond_template(),
            "spiral": lambda: self._create_spiral_template(),
            "mandala": lambda: self._create_mandala_template(),
            "kodi": lambda: self._create_kodi_template(),
            "padi": lambda: self._create_padi_template(),
        }
        
        if template_name not in templates:
            available = ", ".join(templates.keys())
            raise ValueError(f"Unknown template: {template_name}. Available: {available}")
        
        return templates[template_name]()
    
    def _create_pulli_template(self, size: int) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = size
        pattern = self.generate_pulli_kolam("basic")
        self.grid_size = old_size
        return pattern
    
    def _create_sikku_template(self, size: int) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = size
        pattern = self.generate_sikku_kolam("basic")
        self.grid_size = old_size
        return pattern
    
    def _create_sikku_diagonal_template(self, size: int) -> KolamPattern:
        old_size = self.grid_size
        self.grid_size = size
        pattern = self.generate_sikku_kolam("interlaced")
        self.grid_size = old_size
        return pattern
    
    def _create_star_template(self) -> KolamPattern:
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
            dots.append(Dot(x=x, y=y, id=i))
        
        for i in range(num_points):
            angle_inner = 2 * math.pi * (i + 0.5) / num_points - math.pi / 2
            x_inner = center.x + inner_radius * math.cos(angle_inner)
            y_inner = center.y + inner_radius * math.sin(angle_inner)
            dots.append(Dot(x=x_inner, y=y_inner, id=len(dots)))
        
        for i in range(num_points):
            pattern.lines.append(LineSegment(dots[i], dots[(i + 1) % num_points]))
            pattern.lines.append(LineSegment(dots[i], dots[num_points + i]))
            pattern.lines.append(LineSegment(dots[num_points + i], dots[(i + 1) % num_points]))
        
        pattern.dots = dots
        return pattern
    
    def _create_diamond_template(self) -> KolamPattern:
        pattern = KolamPattern()
        offset = (self.grid_size - 1) * self.spacing / 2
        
        dots = []
        lines = []
        dot_id = 0
        
        for row in range(self.grid_size):
            for col in range(self.grid_size):
                x = self.center_x + col * self.spacing - offset
                y = self.center_y + row * self.spacing - offset
                dots.append(Dot(x=x, y=y, id=dot_id))
                dot_id += 1
        
        for row in range(self.grid_size):
            for col in range(self.grid_size):
                if col < self.grid_size - 1:
                    x = dots[row * self.grid_size + col].x
                    y = dots[row * self.grid_size + col].y
                    lines.append(LineSegment(
                        Point(x, y),
                        Point(x + self.spacing / 2, y - self.spacing / 2)
                    ))
                    lines.append(LineSegment(
                        Point(x, y),
                        Point(x + self.spacing / 2, y + self.spacing / 2)
                    ))
        
        pattern.dots = dots
        pattern.lines = lines
        return pattern
    
    def _create_spiral_template(self) -> KolamPattern:
        pattern = KolamPattern()
        center = Point(self.center_x, self.center_y)
        
        num_turns = 4
        points_per_turn = 20
        
        dots = []
        lines = []
        
        for i in range(num_turns * points_per_turn):
            angle = 2 * math.pi * i / points_per_turn
            radius = 10 + (i / (num_turns * points_per_turn)) * 140
            
            x = center.x + radius * math.cos(angle)
            y = center.y + radius * math.sin(angle)
            
            dots.append(Dot(x=x, y=y, id=i))
            
            if i > 0:
                lines.append(LineSegment(dots[i - 1], dots[i]))
        
        pattern.dots = dots
        pattern.lines = lines
        return pattern
    
    def _create_mandala_template(self) -> KolamPattern:
        pattern = KolamPattern()
        center = Point(self.center_x, self.center_y)
        
        num_rings = 4
        points_per_ring = 12
        
        dots = []
        lines = []
        dot_id = 0
        
        dots.append(Dot(x=center.x, y=center.y, id=dot_id))
        dot_id += 1
        
        for ring in range(1, num_rings + 1):
            radius = ring * 35
            
            for i in range(points_per_ring):
                angle = 2 * math.pi * i / points_per_ring
                x = center.x + radius * math.cos(angle)
                y = center.y + radius * math.sin(angle)
                
                dots.append(Dot(x=x, y=y, id=dot_id))
                dot_id += 1
        
        for ring in range(1, num_rings + 1):
            start_idx = (ring - 1) * points_per_ring + 1
            for i in range(points_per_ring):
                lines.append(LineSegment(
                    dots[start_idx + i],
                    dots[start_idx + (i + 1) % points_per_ring]
                ))
        
        for ring in range(2, num_rings + 1):
            for i in range(points_per_ring):
                lines.append(LineSegment(
                    dots[(ring - 1) * points_per_ring + 1 + i],
                    dots[ring * points_per_ring + 1 + i]
                ))
        
        pattern.dots = dots
        pattern.lines = lines
        return pattern
    
    def _create_kodi_template(self) -> KolamPattern:
        return self._create_pulli_template(5)
    
    def _create_padi_template(self) -> KolamPattern:
        return self._create_pulli_template(5)


def generate_kolam(template: str = "pulli_5x5", 
                  grid_size: int = 5,
                  symmetry: str = "none",
                  output_path: Optional[str] = None,
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
    
    try:
        config = KolamGeneratorConfig(grid_size=grid_size)
        generator = KolamGenerator(config)
        pattern = generator.generate_from_template(template)
        
        symmetry_type = sym_map.get(symmetry, SymmetryType.NONE)
        if symmetry_type != SymmetryType.NONE:
            pattern = generator.generate_with_symmetry(pattern.lines, symmetry_type)
        
        result = {
            "template": template,
            "grid_size": grid_size,
            "symmetry": symmetry,
            "num_dots": len(pattern.dots),
            "num_lines": len(pattern.lines),
            "construction_steps": [
                {"from": ls.start.to_dict(), "to": ls.end.to_dict()}
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
        
    except Exception as e:
        return {"error": str(e)}


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
