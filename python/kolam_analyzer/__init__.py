"""
Kolam Analyzer - Analyzes Kolam designs to extract mathematical principles
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Optional, Set
from collections import defaultdict
import cv2
from scipy import ndimage
from scipy.spatial.distance import cdist
import networkx as nx


@dataclass
class Dot:
    """Represents a dot (pulli) in a Kolam"""
    x: float
    y: float
    id: int = 0
    
    def distance_to(self, other: 'Dot') -> float:
        return np.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)


@dataclass
class Line:
    """Represents a line segment connecting two dots"""
    start: Dot
    end: Dot
    control_points: List[Tuple[float, float]] = field(default_factory=list)
    
    @property
    def length(self) -> float:
        return self.start.distance_to(self.end)
    
    @property
    def midpoint(self) -> Tuple[float, float]:
        return ((self.start.x + self.end.x) / 2, (self.start.y + self.end.y) / 2)


@dataclass
class KolamGraph:
    """Graph representation of a Kolam pattern"""
    dots: List[Dot] = field(default_factory=list)
    lines: List[Line] = field(default_factory=list)
    adjacency: Dict[int, Set[int]] = field(default_factory=dict)
    
    def build_graph(self):
        """Build adjacency list from lines"""
        self.adjacency = defaultdict(set)
        for line in self.lines:
            self.adjacency[line.start.id].add(line.end.id)
            self.adjacency[line.end.id].add(line.start.id)
    
    def get_degree(self, dot_id: int) -> int:
        """Get the degree (number of connections) of a dot"""
        return len(self.adjacency.get(dot_id, set()))
    
    def is_eulerian(self) -> bool:
        """Check if the graph has an Eulerian path"""
        if not self.adjacency:
            return False
        odd_degree_count = sum(1 for d in self.dots if self.get_degree(d.id) % 2 == 1)
        return odd_degree_count in [0, 2]
    
    def get_connected_components(self) -> int:
        """Get number of connected components"""
        if not self.dots:
            return 0
        G = nx.Graph()
        for dot in self.dots:
            G.add_node(dot.id)
        for line in self.lines:
            G.add_edge(line.start.id, line.end.id)
        return nx.number_connected_components(G)
    
    def get_holes(self) -> int:
        """Estimate number of holes/loops in the Kolam"""
        if not self.lines:
            return 0
        G = nx.Graph()
        for line in self.lines:
            G.add_edge(line.start.id, line.end.id)
        cycles = nx.cycle_basis(G)
        return len(cycles)


@dataclass
class SymmetryAnalysis:
    """Results of symmetry analysis"""
    horizontal_score: float = 0.0
    vertical_score: float = 0.0
    diagonal_score: float = 0.0
    rotational_90_score: float = 0.0
    rotational_180_score: float = 0.0
    primary_symmetry: str = "none"
    symmetry_group: str = "C1"
    
    def determine_primary(self):
        scores = {
            "horizontal": self.horizontal_score,
            "vertical": self.vertical_score,
            "diagonal": self.diagonal_score,
            "rotational_90": self.rotational_90_score,
            "rotational_180": self.rotational_180_score
        }
        max_score = float(max(scores.values()))
        if max_score < 0.5:
            self.primary_symmetry = "none"
            self.symmetry_group = "C1"
        else:
            self.primary_symmetry = max(scores.keys(), key=lambda k: scores[k])
            if self.primary_symmetry == "horizontal" or self.primary_symmetry == "vertical":
                self.symmetry_group = "D1"
            elif self.primary_symmetry == "diagonal":
                self.symmetry_group = "D2"
            elif self.primary_symmetry == "rotational_90":
                self.symmetry_group = "C4"
            elif self.primary_symmetry == "rotational_180":
                self.symmetry_group = "C2"


@dataclass
class ComplexityMetrics:
    """Complexity measurements for a Kolam"""
    num_dots: int = 0
    num_lines: int = 0
    edge_density: float = 0.0
    avg_degree: float = 0.0
    max_degree: int = 0
    hole_count: int = 0
    complexity_score: float = 0.0
    complexity_label: str = "simple"
    
    def calculate(self, graph: KolamGraph):
        self.num_dots = len(graph.dots)
        self.num_lines = len(graph.lines)
        
        if self.num_dots > 0:
            degrees = [graph.get_degree(d.id) for d in graph.dots]
            self.avg_degree = np.mean(degrees)
            self.max_degree = max(degrees)
        
        max_possible_lines = self.num_dots * (self.num_dots - 1) // 2
        if max_possible_lines > 0:
            self.edge_density = self.num_lines / max_possible_lines
        
        self.hole_count = graph.get_holes()
        
        self.complexity_score = (
            0.3 * (self.num_dots / 100) +
            0.3 * (self.num_lines / 200) +
            0.2 * self.hole_count +
            0.2 * self.avg_degree
        )
        self.complexity_score = min(self.complexity_score, 1.0)
        
        if self.complexity_score < 0.2:
            self.complexity_label = "simple"
        elif self.complexity_score < 0.4:
            self.complexity_label = "moderate"
        elif self.complexity_score < 0.6:
            self.complexity_label = "complex"
        else:
            self.complexity_label = "very_complex"


@dataclass
class DesignPrinciples:
    """Extracted design principles from a Kolam"""
    construction_rule: str = ""
    grid_type: str = "unknown"
    grid_rows: Optional[int] = None
    grid_cols: Optional[int] = None
    path_type: str = "unknown"
    is_continuous: bool = False
    uses_symmetry: bool = False
    symmetry_type: str = "none"
    pattern_type: str = "unknown"
    
    def to_dict(self) -> Dict:
        return {
            "construction_rule": self.construction_rule,
            "grid_type": self.grid_type,
            "grid_rows": self.grid_rows,
            "grid_cols": self.grid_cols,
            "path_type": self.path_type,
            "is_continuous": self.is_continuous,
            "uses_symmetry": self.uses_symmetry,
            "symmetry_type": self.symmetry_type,
            "pattern_type": self.pattern_type
        }


@dataclass 
class KolamAnalysis:
    """Complete analysis results"""
    graph: KolamGraph
    symmetry: SymmetryAnalysis
    complexity: ComplexityMetrics
    principles: DesignPrinciples
    image_size: Tuple[int, int] = (0, 0)
    processing_time: float = 0.0
    
    def to_dict(self) -> Dict:
        return {
            "symmetry": {
                "horizontal": self.symmetry.horizontal_score,
                "vertical": self.symmetry.vertical_score,
                "diagonal": self.symmetry.diagonal_score,
                "rotational_90": self.symmetry.rotational_90_score,
                "rotational_180": self.symmetry.rotational_180_score,
                "primary_symmetry": self.symmetry.primary_symmetry,
                "symmetry_group": self.symmetry.symmetry_group,
                "is_symmetric": self.symmetry.primary_symmetry != "none"
            },
            "dot_grid": {
                "rows": self.principles.grid_rows,
                "cols": self.principles.grid_cols,
                "grid_type": self.principles.grid_type,
                "num_dots": self.complexity.num_dots,
                "regularity_score": self._calculate_regularity()
            },
            "characteristics": {
                "num_lines": self.complexity.num_lines,
                "edge_density": self.complexity.edge_density,
                "avg_degree": self.complexity.avg_degree,
                "max_degree": self.complexity.max_degree,
                "hole_count": self.complexity.hole_count,
                "complexity": self.complexity.complexity_label
            },
            "principles": self.principles.to_dict(),
            "is_eulerian": self.graph.is_eulerian(),
            "connected_components": self.graph.get_connected_components()
        }
    
    def _calculate_regularity(self) -> float:
        """Calculate how regular the dot grid is"""
        if len(self.graph.dots) < 4:
            return 0.0
        
        positions = np.array([[d.x, d.y] for d in self.graph.dots])
        
        x_diffs = np.diff(np.sort(positions[:, 0]))
        y_diffs = np.diff(np.sort(positions[:, 1]))
        
        x_reg = 1.0 - min(np.std(x_diffs) / (np.mean(x_diffs) + 1e-6), 1.0)
        y_reg = 1.0 - min(np.std(y_diffs) / (np.mean(y_diffs) + 1e-6), 1.0)
        
        return (x_reg + y_reg) / 2


class KolamAnalyzer:
    """Main class for analyzing Kolam patterns"""
    
    def __init__(self, min_dot_radius: int = 3, max_dot_radius: int = 15):
        self.min_dot_radius = min_dot_radius
        self.max_dot_radius = max_dot_radius
    
    def analyze(self, image_path: str) -> KolamAnalysis:
        """Complete analysis of a Kolam image"""
        import time
        start_time = time.time()
        
        img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError(f"Could not load image: {image_path}")
        
        dots = self._detect_dots(img)
        lines = self._detect_lines(img, dots)
        
        graph = KolamGraph(dots=dots, lines=lines)
        graph.build_graph()
        
        symmetry = self._analyze_symmetry(img, dots)
        complexity = ComplexityMetrics()
        complexity.calculate(graph)
        principles = self._extract_principles(graph, symmetry, dots, img)
        
        processing_time = time.time() - start_time
        
        return KolamAnalysis(
            graph=graph,
            symmetry=symmetry,
            complexity=complexity,
            principles=principles,
            image_size=img.shape[:2],
            processing_time=processing_time
        )
    
    def _detect_dots(self, img: np.ndarray) -> List[Dot]:
        """Detect dots (pulli) in the Kolam image"""
        blurred = cv2.GaussianBlur(img, (5, 5), 0)
        _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        kernel = np.ones((3, 3), np.uint8)
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        dots = []
        height, width = img.shape
        
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area < 10:
                continue
            
            M = cv2.moments(contour)
            if M["m00"] == 0:
                continue
            
            cx = int(M["m10"] / M["m00"])
            cy = int(M["m01"] / M["m00"])
            
            radius = np.sqrt(area / np.pi)
            
            if self.min_dot_radius <= radius <= self.max_dot_radius:
                dots.append(Dot(x=cx, y=cy, id=i))
        
        dots = self._filter_outliers(dots)
        dots = self._cluster_nearby_dots(dots)
        
        return dots
    
    def _filter_outliers(self, dots: List[Dot], threshold: float = 3.0) -> List[Dot]:
        """Remove outlier dots that are too far from the main cluster"""
        if len(dots) < 4:
            return dots
        
        positions = np.array([[d.x, d.y] for d in dots])
        centroid = positions.mean(axis=0)
        distances = np.sqrt(((positions - centroid) ** 2).sum(axis=1))
        
        mean_dist = distances.mean()
        std_dist = distances.std()
        
        filtered = [d for d, dist in zip(dots, distances) 
                   if dist <= mean_dist + threshold * std_dist]
        
        return filtered
    
    def _cluster_nearby_dots(self, dots: List[Dot], cluster_dist: int = 10) -> List[Dot]:
        """Cluster nearby dots and take centroids"""
        if len(dots) < 2:
            return dots
        
        positions = np.array([[d.x, d.y] for d in dots])
        
        if len(positions) == 0:
            return []
        
        from scipy.cluster.hierarchy import fclusterdata
        
        try:
            clusters = fclusterdata(positions, t=cluster_dist, criterion='distance')
        except:
            return dots
        
        clustered_dots = []
        for cluster_id in np.unique(clusters):
            cluster_points = positions[clusters == cluster_id]
            centroid = cluster_points.mean(axis=0)
            clustered_dots.append(Dot(x=centroid[0], y=centroid[1], id=len(clustered_dots)))
        
        return clustered_dots
    
    def _detect_lines(self, img: np.ndarray, dots: List[Dot]) -> List[Line]:
        """Detect lines connecting the dots"""
        edges = cv2.Canny(img, 50, 150)
        
        lines = []
        dot_positions = np.array([[d.x, d.y] for d in dots])
        
        for i, dot1 in enumerate(dots):
            for j, dot2 in enumerate(dots):
                if i >= j:
                    continue
                
                dist = dot1.distance_to(dot2)
                
                if dist > 0 and dist < 300:
                    mid_x, mid_y = (dot1.x + dot2.x) / 2, (dot1.y + dot2.y) / 2
                    
                    x1, y1 = int(dot1.x), int(dot1.y)
                    x2, y2 = int(dot2.x), int(dot2.y)
                    
                    if 0 <= mid_x < img.shape[1] and 0 <= mid_y < img.shape[0]:
                        if edges[int(mid_y), int(mid_x)] > 0:
                            lines.append(Line(start=dot1, end=dot2))
        
        return lines
    
    def _analyze_symmetry(self, img: np.ndarray, dots: List[Dot]) -> SymmetryAnalysis:
        """Analyze symmetry of the Kolam pattern"""
        if len(dots) < 2:
            return SymmetryAnalysis()
        
        positions = np.array([[d.x, d.y] for d in dots])
        height, width = img.shape[:2]
        center_x, center_y = width / 2, height / 2
        
        analysis = SymmetryAnalysis()
        
        analysis.horizontal_score = self._check_reflection_symmetry(
            positions, axis='horizontal', center=center_y
        )
        analysis.vertical_score = self._check_reflection_symmetry(
            positions, axis='vertical', center=center_x
        )
        analysis.diagonal_score = self._check_diagonal_symmetry(positions, center_x, center_y)
        analysis.rotational_180_score = self._check_rotational_symmetry(positions, 180, center_x, center_y)
        analysis.rotational_90_score = self._check_rotational_symmetry(positions, 90, center_x, center_y)
        
        analysis.determine_primary()
        
        return analysis
    
    def _check_reflection_symmetry(self, positions: np.ndarray, axis: str, center: float) -> float:
        """Check reflection symmetry along an axis"""
        if axis == 'horizontal':
            reflected = positions.copy()
            reflected[:, 1] = 2 * center - positions[:, 1]
        else:
            reflected = positions.copy()
            reflected[:, 0] = 2 * center - positions[:, 0]
        
        return self._calculate_similarity(positions, reflected)
    
    def _check_diagonal_symmetry(self, positions: np.ndarray, cx: float, cy: float) -> float:
        """Check diagonal symmetry (both diagonals)"""
        translated = positions - np.array([cx, cy])
        
        diag1 = translated[:, 0] - translated[:, 1]
        diag1_mirror = np.column_stack([translated[:, 1], translated[:, 0]])
        diag1_mirror = diag1_mirror + np.array([cx, cy])
        
        score1 = self._calculate_similarity(positions, diag1_mirror)
        
        diag2_mirror = np.column_stack([-translated[:, 1], -translated[:, 0]])
        diag2_mirror = diag2_mirror + np.array([cx, cy])
        
        score2 = self._calculate_similarity(positions, diag2_mirror)
        
        return max(score1, score2)
    
    def _check_rotational_symmetry(self, positions: np.ndarray, angle: float, cx: float, cy: float) -> float:
        """Check rotational symmetry"""
        angle_rad = np.radians(angle)
        cos_a, sin_a = np.cos(angle_rad), np.sin(angle_rad)
        
        translated = positions - np.array([cx, cy])
        
        rotated = np.column_stack([
            translated[:, 0] * cos_a - translated[:, 1] * sin_a,
            translated[:, 0] * sin_a + translated[:, 1] * cos_a
        ])
        rotated = rotated + np.array([cx, cy])
        
        return self._calculate_similarity(positions, rotated)
    
    def _calculate_similarity(self, positions1: np.ndarray, positions2: np.ndarray) -> float:
        """Calculate similarity between two point sets"""
        if len(positions1) == 0 or len(positions2) == 0:
            return 0.0
        
        distances = cdist(positions1, positions2)
        
        min_distances = distances.min(axis=1)
        threshold = 20
        
        match_count = np.sum(min_distances < threshold)
        
        return match_count / max(len(positions1), len(positions2))
    
    def _extract_principles(self, graph: KolamGraph, symmetry: SymmetryAnalysis, 
                           dots: List[Dot], img: np.ndarray) -> DesignPrinciples:
        """Extract design principles from the analysis"""
        principles = DesignPrinciples()
        
        principles.grid_rows, principles.grid_cols = self._detect_grid_dimensions(dots)
        principles.grid_type = self._classify_grid(dots)
        
        principles.is_continuous = graph.is_eulerian()
        principles.path_type = "continuous" if principles.is_continuous else "broken"
        
        principles.uses_symmetry = symmetry.primary_symmetry != "none"
        principles.symmetry_type = symmetry.primary_symmetry
        
        principles.pattern_type = self._classify_pattern_type(graph, symmetry)
        
        principles.construction_rule = self._generate_construction_rule(
            principles, graph, symmetry
        )
        
        return principles
    
    def _detect_grid_dimensions(self, dots: List[Dot]) -> Tuple[Optional[int], Optional[int]]:
        """Detect grid rows and columns from dot positions"""
        if len(dots) < 4:
            return None, None
        
        positions = np.array([[d.x, d.y] for d in dots])
        
        x_unique = len(np.unique(np.round(positions[:, 0] / 10)))
        y_unique = len(np.unique(np.round(positions[:, 1] / 10)))
        
        x_positions = np.sort(np.unique(positions[:, 0]))
        y_positions = np.sort(np.unique(positions[:, 1]))
        
        if len(x_positions) > 1:
            x_diffs = np.diff(x_positions)
            x_diffs = x_diffs[x_diffs > 5]
            if len(x_diffs) > 0 and np.std(x_diffs) / (np.mean(x_diffs) + 1e-6) < 0.3:
                cols = len(x_positions)
            else:
                cols = x_unique
        else:
            cols = 1
        
        if len(y_positions) > 1:
            y_diffs = np.diff(y_positions)
            y_diffs = y_diffs[y_diffs > 5]
            if len(y_diffs) > 0 and np.std(y_diffs) / (np.mean(y_diffs) + 1e-6) < 0.3:
                rows = len(y_positions)
            else:
                rows = y_unique
        else:
            rows = 1
        
        return int(rows), int(cols)
    
    def _classify_grid(self, dots: List[Dot]) -> str:
        """Classify the type of dot grid"""
        if len(dots) < 4:
            return "unknown"
        
        positions = np.array([[d.x, d.y] for d in dots])
        
        x_positions = np.sort(np.unique(positions[:, 0]))
        y_positions = np.sort(np.unique(positions[:, 1]))
        
        if len(x_positions) > 1 and len(y_positions) > 1:
            x_diffs = np.diff(x_positions)
            y_diffs = np.diff(y_positions)
            
            if len(x_diffs) > 0 and len(y_diffs) > 0:
                x_mean = np.mean(x_diffs)
                y_mean = np.mean(y_diffs)
                
                if 0.8 < x_mean / y_mean < 1.2:
                    return "square_grid"
                elif x_mean > y_mean * 1.5:
                    return "rectangular_grid"
        
        return "irregular_grid"
    
    def _classify_pattern_type(self, graph: KolamGraph, symmetry: SymmetryAnalysis) -> str:
        """Classify the Kolam pattern type"""
        avg_degree = sum(graph.get_degree(d.id) for d in graph.dots) / max(len(graph.dots), 1)
        
        if avg_degree < 2:
            return "minimal"
        elif avg_degree < 4:
            if symmetry.primary_symmetry != "none":
                return "symmetric_pattern"
            return "freeform"
        else:
            return "intricate"
    
    def _generate_construction_rule(self, principles: DesignPrinciples, 
                                    graph: KolamGraph, symmetry: SymmetryAnalysis) -> str:
        """Generate a human-readable construction rule"""
        rules = []
        
        if principles.grid_rows and principles.grid_cols:
            rules.append(f"Start with a {principles.grid_rows}x{principles.grid_cols} dot grid")
        
        if principles.uses_symmetry:
            rules.append(f"Apply {symmetry.primary_symmetry} symmetry")
        
        if principles.is_continuous:
            rules.append("Draw a continuous line connecting all dots")
        else:
            rules.append("Connect dots with line segments")
        
        if graph.get_holes() > 0:
            rules.append(f"Create {graph.get_holes()} closed loop(s)")
        
        return ". ".join(rules) if rules else "Follow traditional Kolam construction methods"


def analyze_kolam(image_path: str) -> Dict:
    """Convenience function to analyze a Kolam image"""
    analyzer = KolamAnalyzer()
    result = analyzer.analyze(image_path)
    return result.to_dict()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = analyze_kolam(sys.argv[1])
        import json
        print(json.dumps(result, indent=2))
