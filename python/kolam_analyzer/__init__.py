"""
Kolam Analyzer - Analyzes Kolam designs to extract mathematical principles
Version 2.0 - With proper error handling and validation
"""

import numpy as np
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Optional, Set
from collections import defaultdict
import logging
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV not available. Image analysis will be limited.")

try:
    from scipy import ndimage
    from scipy.spatial.distance import cdist
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    logger.warning("SciPy not available. Some features will be limited.")

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False
    logger.warning("NetworkX not available. Graph analysis will use fallback.")


@dataclass
class Dot:
    """Represents a dot (pulli) in a Kolam"""
    x: float
    y: float
    id: int = 0
    
    def distance_to(self, other: 'Dot') -> float:
        return np.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)
    
    def to_dict(self) -> Dict:
        return {"id": self.id, "x": self.x, "y": self.y}


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
    
    def to_dict(self) -> Dict:
        return {
            "start": {"x": self.start.x, "y": self.start.y},
            "end": {"x": self.end.x, "y": self.end.y},
            "length": self.length
        }


@dataclass
class KolamGraph:
    """Graph representation of a Kolam pattern"""
    dots: List[Dot] = field(default_factory=list)
    lines: List[Line] = field(default_factory=list)
    adjacency: Dict[int, Set[int]] = field(default_factory=dict)
    
    def build_graph(self) -> None:
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
        if not self.adjacency or not self.dots:
            return False
        odd_degree_count = sum(1 for d in self.dots if self.get_degree(d.id) % 2 == 1)
        return odd_degree_count in [0, 2]
    
    def get_connected_components(self) -> int:
        """Get number of connected components"""
        if not self.dots:
            return 0
        
        if NETWORKX_AVAILABLE:
            G = nx.Graph()
            for dot in self.dots:
                G.add_node(dot.id)
            for line in self.lines:
                G.add_edge(line.start.id, line.end.id)
            return nx.number_connected_components(G)
        else:
            visited = set()
            components = 0
            
            def dfs(node: int) -> None:
                stack = [node]
                while stack:
                    n = stack.pop()
                    if n in visited:
                        continue
                    visited.add(n)
                    for neighbor in self.adjacency.get(n, []):
                        if neighbor not in visited:
                            stack.append(neighbor)
            
            for dot in self.dots:
                if dot.id not in visited:
                    components += 1
                    dfs(dot.id)
            
            return components
    
    def get_holes(self) -> int:
        """Estimate number of holes/loops in the Kolam"""
        if not self.lines:
            return 0
        
        if NETWORKX_AVAILABLE:
            G = nx.Graph()
            for line in self.lines:
                G.add_edge(line.start.id, line.end.id)
            cycles = nx.cycle_basis(G)
            return len(cycles)
        else:
            visited_edges = set()
            holes = 0
            
            for line in self.lines:
                edge = tuple(sorted([line.start.id, line.end.id]))
                if edge in visited_edges:
                    continue
                
                path = [line.start.id]
                current = line.start.id
                visited = {line.start.id}
                
                while True:
                    found_next = False
                    for neighbor in self.adjacency.get(current, []):
                        next_edge = tuple(sorted([current, neighbor]))
                        if next_edge not in visited_edges and neighbor not in visited:
                            visited.add(neighbor)
                            path.append(neighbor)
                            visited_edges.add(next_edge)
                            current = neighbor
                            found_next = True
                            break
                    
                    if not found_next:
                        break
                
                if len(path) >= 3 and current in self.adjacency.get(path[0], set()):
                    holes += 1
            
            return holes


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
    
    def determine_primary(self) -> None:
        scores = {
            "horizontal": self.horizontal_score,
            "vertical": self.vertical_score,
            "diagonal": self.diagonal_score,
            "rotational_90": self.rotational_90_score,
            "rotational_180": self.rotational_180_score
        }
        max_score = float(max(scores.values())) if scores else 0.0
        
        if max_score < 0.5:
            self.primary_symmetry = "none"
            self.symmetry_group = "C1"
        else:
            best_key = "horizontal"
            best_val = 0.0
            for k, v in scores.items():
                if v > best_val:
                    best_val = v
                    best_key = k
            
            self.primary_symmetry = best_key
            
            if best_key in ("horizontal", "vertical"):
                self.symmetry_group = "D1"
            elif best_key == "diagonal":
                self.symmetry_group = "D2"
            elif best_key == "rotational_90":
                self.symmetry_group = "C4"
            elif best_key == "rotational_180":
                self.symmetry_group = "C2"
    
    def to_dict(self) -> Dict:
        return {
            "horizontal": self.horizontal_score,
            "vertical": self.vertical_score,
            "diagonal": self.diagonal_score,
            "rotational_90": self.rotational_90_score,
            "rotational_180": self.rotational_180_score,
            "primary_symmetry": self.primary_symmetry,
            "symmetry_group": self.symmetry_group
        }


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
    
    def calculate(self, graph: KolamGraph) -> None:
        self.num_dots = len(graph.dots)
        self.num_lines = len(graph.lines)
        
        if self.num_dots > 0:
            degrees = [graph.get_degree(d.id) for d in graph.dots]
            self.avg_degree = float(np.mean(degrees)) if degrees else 0.0
            self.max_degree = max(degrees) if degrees else 0
        
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
    
    def to_dict(self) -> Dict:
        return {
            "num_dots": self.num_dots,
            "num_lines": self.num_lines,
            "edge_density": self.edge_density,
            "avg_degree": self.avg_degree,
            "max_degree": self.max_degree,
            "hole_count": self.hole_count,
            "complexity_score": self.complexity_score,
            "complexity_label": self.complexity_label
        }


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
    error: Optional[str] = None
    
    def to_dict(self) -> Dict:
        result = {
            "symmetry": self.symmetry.to_dict(),
            "dot_grid": {
                "rows": self.principles.grid_rows,
                "cols": self.principles.grid_cols,
                "grid_type": self.principles.grid_type,
                "num_dots": self.complexity.num_dots,
                "regularity_score": self._calculate_regularity()
            },
            "characteristics": self.complexity.to_dict(),
            "principles": self.principles.to_dict(),
            "is_eulerian": self.graph.is_eulerian(),
            "connected_components": self.graph.get_connected_components(),
            "image_size": self.image_size,
            "processing_time": self.processing_time
        }
        
        if self.error:
            result["error"] = self.error
            
        return result
    
    def _calculate_regularity(self) -> float:
        """Calculate how regular the dot grid is"""
        if len(self.graph.dots) < 4:
            return 0.0
        
        try:
            positions = np.array([[d.x, d.y] for d in self.graph.dots])
            
            x_positions = np.sort(np.unique(positions[:, 0]))
            y_positions = np.sort(np.unique(positions[:, 1]))
            
            if len(x_positions) < 2 or len(y_positions) < 2:
                return 0.0
            
            x_diffs = np.diff(x_positions)
            y_diffs = np.diff(y_positions)
            
            if len(x_diffs) == 0 or len(y_diffs) == 0:
                return 0.0
            
            x_reg = 1.0 - min(float(np.std(x_diffs) / (np.mean(x_diffs) + 1e-6)), 1.0)
            y_reg = 1.0 - min(float(np.std(y_diffs) / (np.mean(y_diffs) + 1e-6)), 1.0)
            
            return (x_reg + y_reg) / 2
        except Exception:
            return 0.0


class KolamAnalyzerConfig:
    """Configuration for Kolam Analyzer"""
    def __init__(
        self,
        min_dot_radius: int = 3,
        max_dot_radius: int = 20,
        canny_low: int = 50,
        canny_high: int = 150,
        max_line_distance: int = 300,
        similarity_threshold: float = 20.0,
        cluster_distance: int = 10,
        outlier_threshold: float = 3.0
    ):
        self.min_dot_radius = min_dot_radius
        self.max_dot_radius = max_dot_radius
        self.canny_low = canny_low
        self.canny_high = canny_high
        self.max_line_distance = max_line_distance
        self.similarity_threshold = similarity_threshold
        self.cluster_distance = cluster_distance
        self.outlier_threshold = outlier_threshold


class KolamAnalyzer:
    """Main class for analyzing Kolam patterns"""
    
    def __init__(self, config: Optional[KolamAnalyzerConfig] = None):
        self.config = config or KolamAnalyzerConfig()
        
        if not CV2_AVAILABLE:
            logger.warning("OpenCV not available. Some methods will not work.")
    
    def analyze(self, image_path: str) -> KolamAnalysis:
        """Complete analysis of a Kolam image with error handling"""
        import time
        start_time = time.time()
        
        if not CV2_AVAILABLE:
            return self._error_result("OpenCV not available", 0)
        
        try:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                return self._error_result(f"Could not load image: {image_path}", 0)
            
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
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            logger.debug(traceback.format_exc())
            return self._error_result(str(e), 0)
    
    def analyze_from_array(self, img_array: np.ndarray) -> KolamAnalysis:
        """Analyze from numpy array"""
        import time
        start_time = time.time()
        
        if not CV2_AVAILABLE:
            return self._error_result("OpenCV not available", 0)
        
        try:
            if len(img_array.shape) == 3:
                img = cv2.cvtColor(img_array, cv2.COLOR_BGR2GRAY)
            else:
                img = img_array
            
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
            
        except Exception as e:
            logger.error(f"Error analyzing array: {e}")
            return self._error_result(str(e), 0)
    
    def _error_result(self, error_msg: str, img_size: int) -> KolamAnalysis:
        """Create error result"""
        return KolamAnalysis(
            graph=KolamGraph(),
            symmetry=SymmetryAnalysis(),
            complexity=ComplexityMetrics(),
            principles=DesignPrinciples(),
            image_size=(0, 0),
            processing_time=0.0,
            error=error_msg
        )
    
    def _detect_dots(self, img: np.ndarray) -> List[Dot]:
        """Detect dots (pulli) in the Kolam image"""
        try:
            blurred = cv2.GaussianBlur(img, (5, 5), 0)
            _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            kernel = np.ones((3, 3), np.uint8)
            binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
            
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            dots = []
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
                
                if self.config.min_dot_radius <= radius <= self.config.max_dot_radius:
                    dots.append(Dot(x=cx, y=cy, id=i))
            
            if len(dots) >= 4:
                dots = self._filter_outliers(dots)
                dots = self._cluster_nearby_dots(dots)
            
            for i, dot in enumerate(dots):
                dot.id = i
            
            return dots
            
        except Exception as e:
            logger.error(f"Error detecting dots: {e}")
            return []
    
    def _filter_outliers(self, dots: List[Dot], threshold: float = 3.0) -> List[Dot]:
        """Remove outlier dots that are too far from the main cluster"""
        if len(dots) < 4:
            return dots
        
        try:
            positions = np.array([[d.x, d.y] for d in dots])
            centroid = positions.mean(axis=0)
            distances = np.sqrt(((positions - centroid) ** 2).sum(axis=1))
            
            mean_dist = float(distances.mean())
            std_dist = float(distances.std())
            
            if std_dist == 0:
                return dots
            
            filtered = [d for d, dist in zip(dots, distances) 
                       if dist <= mean_dist + threshold * std_dist]
            
            return filtered if len(filtered) >= 4 else dots
            
        except Exception:
            return dots
    
    def _cluster_nearby_dots(self, dots: List[Dot], cluster_dist: int = 10) -> List[Dot]:
        """Cluster nearby dots and take centroids"""
        if len(dots) < 2:
            return dots
        
        try:
            positions = np.array([[d.x, d.y] for d in dots])
            
            if len(positions) == 0:
                return []
            
            if SCIPY_AVAILABLE:
                from scipy.cluster.hierarchy import fclusterdata
                clusters = fclusterdata(positions, t=cluster_dist, criterion='distance')
                
                clustered_dots = []
                for cluster_id in np.unique(clusters):
                    cluster_points = positions[clusters == cluster_id]
                    centroid = cluster_points.mean(axis=0)
                    clustered_dots.append(Dot(x=float(centroid[0]), y=float(centroid[1]), id=len(clustered_dots)))
                
                return clustered_dots
            else:
                return dots
                
        except Exception:
            return dots
    
    def _detect_lines(self, img: np.ndarray, dots: List[Dot]) -> List[Line]:
        """Detect lines connecting the dots"""
        if not dots or not CV2_AVAILABLE:
            return []
        
        try:
            edges = cv2.Canny(img, self.config.canny_low, self.config.canny_high)
            
            lines = []
            for i, dot1 in enumerate(dots):
                for j, dot2 in enumerate(dots):
                    if i >= j:
                        continue
                    
                    dist = dot1.distance_to(dot2)
                    
                    if 0 < dist < self.config.max_line_distance:
                        mid_x = (dot1.x + dot2.x) / 2
                        mid_y = (dot1.y + dot2.y) / 2
                        
                        if 0 <= mid_x < img.shape[1] and 0 <= mid_y < img.shape[0]:
                            if edges[int(mid_y), int(mid_x)] > 0:
                                lines.append(Line(start=dot1, end=dot2))
            
            return lines
            
        except Exception as e:
            logger.error(f"Error detecting lines: {e}")
            return []
    
    def _analyze_symmetry(self, img: np.ndarray, dots: List[Dot]) -> SymmetryAnalysis:
        """Analyze symmetry of the Kolam pattern"""
        if len(dots) < 2:
            return SymmetryAnalysis()
        
        try:
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
            
        except Exception as e:
            logger.error(f"Error analyzing symmetry: {e}")
            return SymmetryAnalysis()
    
    def _check_reflection_symmetry(self, positions: np.ndarray, axis: str, center: float) -> float:
        """Check reflection symmetry along an axis"""
        try:
            if axis == 'horizontal':
                reflected = positions.copy()
                reflected[:, 1] = 2 * center - positions[:, 1]
            else:
                reflected = positions.copy()
                reflected[:, 0] = 2 * center - positions[:, 0]
            
            return self._calculate_similarity(positions, reflected)
        except Exception:
            return 0.0
    
    def _check_diagonal_symmetry(self, positions: np.ndarray, cx: float, cy: float) -> float:
        """Check diagonal symmetry (both diagonals)"""
        try:
            translated = positions - np.array([cx, cy])
            
            diag1_mirror = np.column_stack([translated[:, 1], translated[:, 0]])
            diag1_mirror = diag1_mirror + np.array([cx, cy])
            score1 = self._calculate_similarity(positions, diag1_mirror)
            
            diag2_mirror = np.column_stack([-translated[:, 1], -translated[:, 0]])
            diag2_mirror = diag2_mirror + np.array([cx, cy])
            score2 = self._calculate_similarity(positions, diag2_mirror)
            
            return max(score1, score2)
        except Exception:
            return 0.0
    
    def _check_rotational_symmetry(self, positions: np.ndarray, angle: float, cx: float, cy: float) -> float:
        """Check rotational symmetry"""
        try:
            angle_rad = np.radians(angle)
            cos_a = float(np.cos(angle_rad))
            sin_a = float(np.sin(angle_rad))
            
            translated = positions - np.array([cx, cy])
            
            rotated = np.column_stack([
                translated[:, 0] * cos_a - translated[:, 1] * sin_a,
                translated[:, 0] * sin_a + translated[:, 1] * cos_a
            ])
            rotated = rotated + np.array([cx, cy])
            
            return self._calculate_similarity(positions, rotated)
        except Exception:
            return 0.0
    
    def _calculate_similarity(self, positions1: np.ndarray, positions2: np.ndarray) -> float:
        """Calculate similarity between two point sets"""
        try:
            if len(positions1) == 0 or len(positions2) == 0:
                return 0.0
            
            distances = cdist(positions1, positions2)
            min_distances = distances.min(axis=1)
            
            match_count = np.sum(min_distances < self.config.similarity_threshold)
            
            return float(match_count / max(len(positions1), len(positions2)))
        except Exception:
            return 0.0
    
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
        
        try:
            positions = np.array([[d.x, d.y] for d in dots])
            
            x_positions = np.sort(np.unique(positions[:, 0]))
            y_positions = np.sort(np.unique(positions[:, 1]))
            
            if len(x_positions) < 2 or len(y_positions) < 2:
                return len(y_positions), len(x_positions)
            
            x_diffs = np.diff(x_positions)
            y_diffs = np.diff(y_positions)
            
            if len(x_diffs) > 0 and len(y_diffs) > 0:
                x_std = float(np.std(x_diffs)) if len(x_diffs) > 1 else 0
                y_std = float(np.std(y_diffs)) if len(y_diffs) > 1 else 0
                x_mean = float(np.mean(x_diffs))
                y_mean = float(np.mean(y_diffs))
                
                if x_mean > 0 and x_std / x_mean < 0.3:
                    cols = len(x_positions)
                else:
                    cols = len(np.unique(np.round(positions[:, 0] / 10)))
                
                if y_mean > 0 and y_std / y_mean < 0.3:
                    rows = len(y_positions)
                else:
                    rows = len(np.unique(np.round(positions[:, 1] / 10)))
                
                return int(rows), int(cols)
            
            return len(y_positions), len(x_positions)
            
        except Exception:
            return None, None
    
    def _classify_grid(self, dots: List[Dot]) -> str:
        """Classify the type of dot grid"""
        if len(dots) < 4:
            return "unknown"
        
        try:
            positions = np.array([[d.x, d.y] for d in dots])
            
            x_positions = np.sort(np.unique(positions[:, 0]))
            y_positions = np.sort(np.unique(positions[:, 1]))
            
            if len(x_positions) > 1 and len(y_positions) > 1:
                x_diffs = np.diff(x_positions)
                y_diffs = np.diff(y_positions)
                
                if len(x_diffs) > 0 and len(y_diffs) > 0:
                    x_mean = float(np.mean(x_diffs))
                    y_mean = float(np.mean(y_diffs))
                    
                    if y_mean > 0:
                        ratio = x_mean / y_mean
                        if 0.8 < ratio < 1.2:
                            return "square_grid"
                        elif ratio > 1.5:
                            return "rectangular_grid"
            
            return "irregular_grid"
            
        except Exception:
            return "unknown"
    
    def _classify_pattern_type(self, graph: KolamGraph, symmetry: SymmetryAnalysis) -> str:
        """Classify the Kolam pattern type"""
        if not graph.dots:
            return "unknown"
        
        try:
            avg_degree = sum(graph.get_degree(d.id) for d in graph.dots) / len(graph.dots)
            
            if avg_degree < 2:
                return "minimal"
            elif avg_degree < 4:
                if symmetry.primary_symmetry != "none":
                    return "symmetric_pattern"
                return "freeform"
            else:
                return "intricate"
                
        except Exception:
            return "unknown"
    
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


def analyze_kolam(image_path: str, config: Optional[KolamAnalyzerConfig] = None) -> Dict:
    """Convenience function to analyze a Kolam image"""
    analyzer = KolamAnalyzer(config)
    result = analyzer.analyze(image_path)
    return result.to_dict()


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) > 1:
        result = analyze_kolam(sys.argv[1])
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python kolam_analyzer.py <image_path>")
