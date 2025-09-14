import torch
import torch.nn as nn
import torchvision.transforms as transforms
import cv2 as cv # Import cv2 as cv
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from scipy.spatial import distance
from sklearn.cluster import DBSCAN
import json
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path
import sys
import os
import pickle

# --- Content from kolam_model_clean.py ---
# Placeholder CONFIG
CONFIG = {
    "num_classes": 5, # Example number of classes
    "input_size": (224, 224) # Example input size
}

class KolamModel(nn.Module):
    def __init__(self, config):
        super().__init__()
        # Minimal model for unpickling
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.classifier = nn.Linear(16, config["num_classes"])

    def forward(self, x):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

def get_transforms():
    # Placeholder transforms
    train_transform = transforms.Compose([
        transforms.Resize(CONFIG["input_size"]),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    val_transform = transforms.Compose([
        transforms.Resize(CONFIG["input_size"]),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    return train_transform, val_transform

# --- Content from kolam_analysis_system.py ---
@dataclass
class DotGrid:
    """Represents extracted dot grid structure"""
    dots: List[Tuple[int, int]]
    rows: int
    cols: int
    spacing_x: float
    spacing_y: float
    regularity_score: float

@dataclass
class SymmetryInfo:
    """Symmetry analysis results"""
    horizontal: float
    vertical: float
    diagonal: float
    rotational_90: float
    rotational_180: float
    primary_symmetry: str
    is_symmetric: bool

@dataclass 
class KolamAnalysis:
    """Complete Kolam analysis results"""
    dot_grid: DotGrid
    symmetry: SymmetryInfo
    kolam_type: str
    type_confidence: float
    dl_classification: str
    dl_confidence: float
    repetition_patterns: Dict
    characteristics: Dict

class KolamCVAnalyzer:
    """Advanced Computer Vision analyzer for Kolam patterns"""
    
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.transform = None
        self._load_dl_model()
        
    def _load_dl_model(self):
        """Load the fine-tuned deep learning model"""
        model_path = Path('kolam_model.pkl') # Changed path to .pkl file
        
        # Always initialize the model first
        self.model = KolamModel(CONFIG).to(self.device)
        
        if model_path.exists():
            map_loc = torch.device('cpu') if not torch.cuda.is_available() else self.device
            try:
                # Load the state_dict, explicitly mapping to the determined device
                checkpoint = torch.load(model_path, map_location=map_loc)
                self.model.load_state_dict(checkpoint['model_state_dict'])
                self.model.eval()
                sys.stderr.write("✓ Deep Learning model state_dict loaded successfully from .pkl\n")
            except Exception as e:
                sys.stderr.write(f"❌ Error loading model state_dict from .pkl: {e}\n")
                sys.stderr.write("⚠ Model loading failed - using untrained weights\n")
        else:
            sys.stderr.write("⚠ Model file not found - using untrained weights\n")
        
        _, self.transform = get_transforms()
    
    def analyze_kolam(self, image_path: str) -> KolamAnalysis:
        """
        Complete Kolam analysis combining CV and DL
        """
        sys.stderr.write(f"\n{'='*60}\n")
        sys.stderr.write(f" ANALYZING KOLAM PATTERN\n")
        sys.stderr.write(f"{'='*60}\n")
        
        # Load image
        img = cv.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot read image: {image_path}")
        
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
        
        # 1. Extract dot grid
        dot_grid = self.extract_dot_grid(gray)
        
        # 2. Identify symmetry and repetition
        symmetry = self.identify_symmetry(gray)
        repetition = self.identify_repetition_patterns(gray)
        
        # 3. Classify Kolam type using CV features
        cv_type, cv_confidence = self.classify_kolam_type_cv(
            dot_grid, symmetry, gray
        )
        
        # 4. Get DL model classification
        dl_class, dl_confidence = self.classify_with_dl_model(image_path)
        
        # 5. Extract additional characteristics
        characteristics = self.extract_characteristics(gray)
        
        # Create analysis result
        analysis = KolamAnalysis(
            dot_grid=dot_grid,
            symmetry=symmetry,
            kolam_type=cv_type,
            type_confidence=cv_confidence,
            dl_classification=dl_class,
            dl_confidence=dl_confidence,
            repetition_patterns=repetition,
            characteristics=characteristics
        )
        
        self._print_analysis_results(analysis)
        
        return analysis
    
    def extract_dot_grid(self, img: np.ndarray) -> DotGrid:
        """
        Extract dot grid using multiple detection methods
        """
        sys.stderr.write("\n🔍 Extracting dot grid...\n")
        
        # Preprocess image
        enhanced = self._enhance_for_dots(img)
        
        # Detect dots using multiple methods
        dots = []
        
        # Method 1: Hough Circles
        dots_hough = self._detect_dots_hough(enhanced)
        dots.extend(dots_hough)
        
        # Method 2: Blob detection
        dots_blob = self._detect_dots_blob(enhanced)
        dots.extend(dots_blob)
        
        # Method 3: Contour detection
        dots_contour = self._detect_dots_contour(enhanced)
        dots.extend(dots_contour)
        
        # Method 4: Jimp-style dot detection
        dots_jimp_style = self._detect_dots_jimp_style(img) # Pass original grayscale img
        dots.extend(dots_jimp_style)
        
        # Remove duplicates
        unique_dots = self._cluster_dots(dots) if dots else []
        
        # Analyze grid structure
        if len(unique_dots) >= 4:
            grid_info = self._analyze_grid_structure(unique_dots)
            return DotGrid(
                dots=unique_dots,
                rows=grid_info['rows'],
                cols=grid_info['cols'],
                spacing_x=grid_info['spacing_x'],
                spacing_y=grid_info['spacing_y'],
                regularity_score=grid_info['regularity']
            )
        
        return DotGrid(dots=[], rows=0, cols=0, 
                      spacing_x=0, spacing_y=0, regularity_score=0)
    
    def _enhance_for_dots(self, img: np.ndarray) -> np.ndarray:
        """Enhance image for better dot detection"""
        # CLAHE for contrast enhancement
        clahe = cv.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(img)
        
        # Morphological operations
        kernel = np.ones((3,3), np.uint8)
        enhanced = cv.morphologyEx(enhanced, cv.MORPH_CLOSE, kernel)
        enhanced = cv.morphologyEx(enhanced, cv.MORPH_OPEN, kernel)
        
        # Gaussian blur
        enhanced = cv.GaussianBlur(enhanced, (5,5), 1)
        
        return enhanced
    
    def _detect_dots_hough(self, img: np.ndarray) -> List[Tuple[int, int]]:
        """Detect dots using Hough Circle Transform"""
        dots = []
        
        # Try multiple parameter sets
        param_sets = [
            {'dp': 1.0, 'minDist': 15, 'param2': 20},
            {'dp': 1.2, 'minDist': 20, 'param2': 25},
            {'dp': 1.5, 'minDist': 25, 'param2': 30}
        ]
        
        for params in param_sets:
            circles = cv.HoughCircles(
                img, cv.HOUGH_GRADIENT,
                dp=params['dp'],
                minDist=params['minDist'],
                param1=50,
                param2=params['param2'],
                minRadius=3,
                maxRadius=15
            )
            
            if circles is not None and circles.shape[0] > 0: # Add shape check
                # Ensure circles is a 2D array before accessing circles[0]
                circles = np.uint16(np.around(circles)).reshape(-1, 3)
                for circle in circles: # Iterate directly over circles (each is [x, y, r])
                    dots.append((int(circle[0]), int(circle[1])))
        
        return dots
    
    def _detect_dots_blob(self, img: np.ndarray) -> List[Tuple[int, int]]:
        """Detect dots using blob detection"""
        dots = []
        
        # Setup blob detector
        # Setup blob detector
        params = cv.SimpleBlobDetector_Params()
        params.filterByArea = True
        params.minArea = 10.0
        params.maxArea = 500.0
        params.filterByCircularity = True
        params.minCircularity = 0.5
        
        detector = cv.SimpleBlobDetector.create(params)
        keypoints = detector.detect(img)
        
        for kp in keypoints:
            dots.append((int(kp.pt[0]), int(kp.pt[1])))
        
        return dots
    
    def _detect_dots_contour(self, img: np.ndarray) -> List[Tuple[int, int]]:
        """Detect dots using contour analysis"""
        dots = []
        
        # Binary threshold
        _, binary = cv.threshold(img, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU) # Use cv.
        
        # Find contours
        contours, _ = cv.findContours(binary, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE) # Use cv.
        
        for contour in contours:
            area = cv.contourArea(contour) # Use cv.
            if 10 < area < 500:  # Filter by area
                # Check circularity
                perimeter = cv.arcLength(contour, True) # Use cv.
                if perimeter > 0:
                    circularity = 4 * np.pi * area / (perimeter * perimeter)
                    if circularity > 0.5:
                        M = cv.moments(contour) # Use cv.
                        if M["m00"] != 0:
                            cx = int(M["m10"] / M["m00"])
                            cy = int(M["m01"] / M["m00"])
                            dots.append((cx, cy))
        
        return dots

    def _detect_dots_jimp_style(self, gray_img_np: np.ndarray) -> List[Tuple[int, int]]:
        """
        Detect dots using histogram + Otsu-like thresholding and flood fill,
        translated from the provided Javascript logic.
        """
        sys.stderr.write("🔍 Detecting dots using Jimp-style logic...\n")
        height, width = gray_img_np.shape
        
        # Histogram + Otsu-like threshold
        hist = np.zeros(256, dtype=int)
        for row in gray_img_np:
            for pixel_val in row:
                hist[pixel_val] += 1
        
        total = width * height
        sum_val = np.sum(np.arange(256) * hist)
        sumB = 0
        wB = 0
        varMax = 0
        otsu = 127
        for t in range(256):
            wB += hist[t]
            if wB == 0:
                continue
            wF = total - wB
            if wF == 0:
                break
            sumB += t * hist[t]
            mB = sumB / wB
            mF = (sum_val - sumB) / wF
            between = wB * wF * (mB - mF) * (mB - mF)
            if between > varMax:
                varMax = between
                otsu = t
        threshold = min(255, max(0, otsu + 10))

        is_dot_pixel = lambda x, y: gray_img_np[y, x] > threshold

        dirs = [
            (1, 0), (-1, 0), (0, 1), (0, -1),
            (1, 1), (1, -1), (-1, 1), (-1, -1)
        ]

        visited = np.zeros_like(gray_img_np, dtype=bool)
        centroids = []

        for y in range(height):
            for x in range(width):
                if visited[y, x]:
                    continue
                if not is_dot_pixel(x, y):
                    continue
                
                # Flood fill
                q = [(x, y)]
                visited[y, x] = True
                size = 0
                sumX = 0
                sumY = 0
                head = 0
                
                while head < len(q):
                    cx, cy = q[head]
                    head += 1
                    
                    size += 1
                    sumX += cx
                    sumY += cy
                    
                    for dx, dy in dirs:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if not visited[ny, nx] and is_dot_pixel(nx, ny):
                                visited[ny, nx] = True
                                q.append((nx, ny))
                
                max_size = min(8000, (width * height) // 6)
                if size > 12 and size < max_size:
                    centroids.append((int(round(sumX / size)), int(round(sumY / size))))
        
        return centroids
    
    def _cluster_dots(self, dots: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        """Remove duplicate dots using clustering"""
        if not dots:
            return []
        
        # Convert to numpy array
        X = np.array(dots)
        
        # Cluster nearby dots
        clustering = DBSCAN(eps=15, min_samples=1).fit(X)
        
        # Average positions in each cluster
        unique_dots = []
        for label in set(clustering.labels_):
            cluster_points = X[clustering.labels_ == label]
            center = np.mean(cluster_points, axis=0)
            unique_dots.append((int(center[0]), int(center[1])))
        
        return unique_dots
    
    def _analyze_grid_structure(self, dots: List[Tuple[int, int]]) -> Dict:
        """Analyze grid structure from dots"""
        X = np.array(dots)
        
        # Sort by x and y coordinates
        x_sorted = np.sort(X[:, 0])
        y_sorted = np.sort(X[:, 1])
        
        # Find spacing
        x_diffs = np.diff(x_sorted)
        y_diffs = np.diff(y_sorted)
        
        # Filter out small differences
        x_diffs = x_diffs[x_diffs > 10]
        y_diffs = y_diffs[y_diffs > 10]
        
        if len(x_diffs) > 0 and len(y_diffs) > 0:
            spacing_x = float(np.median(x_diffs)) # Cast to float
            spacing_y = float(np.median(y_diffs)) # Cast to float
            
            # Estimate grid dimensions
            width_range = x_sorted[-1] - x_sorted[0]
            height_range = y_sorted[-1] - y_sorted[0]
            
            cols = int(width_range / spacing_x) + 1 if spacing_x > 0 else 1
            rows = int(height_range / spacing_y) + 1 if spacing_y > 0 else 1
            
            # Calculate regularity
            regularity = self._calculate_grid_regularity(X, spacing_x, spacing_y)
            
            return {
                'rows': rows,
                'cols': cols,
                'spacing_x': spacing_x,
                'spacing_y': spacing_y,
                'regularity': regularity
            }
        
        return {'rows': 0, 'cols': 0, 'spacing_x': 0, 'spacing_y': 0, 'regularity': 0}
    
    def _calculate_grid_regularity(self, dots: np.ndarray, spacing_x: float, spacing_y: float) -> float:
        """Calculate how regular the grid is (0-1)"""
        if len(dots) < 4:
            return 0.0
        
        regularity_scores = []
        
        for dot in dots:
            # Find nearest neighbors
            distances = np.linalg.norm(dots - dot, axis=1)
            distances[distances == 0] = np.inf
            
            # Check spacing consistency
            nearest = np.min(distances)
            expected = min(spacing_x, spacing_y)
            
            if expected > 0:
                score = 1.0 - abs(nearest - expected) / expected
                regularity_scores.append(max(0.0, min(1.0, float(score)))) # Cast to float
        
        return float(np.mean(regularity_scores)) if regularity_scores else 0.0 # Cast to float
    
    def identify_symmetry(self, img: np.ndarray) -> SymmetryInfo:
        """
        Identify symmetry and repetition rules
        """
        sys.stderr.write("\n🔄 Identifying symmetry...\n")
        
        h, w = img.shape
        
        # Horizontal symmetry
        top = img[:h//2, :]
        bottom = np.flip(img[h//2:h//2+top.shape[0], :], axis=0)
        h_sym = self._calculate_similarity(top, bottom)
        
        # Vertical symmetry  
        left = img[:, :w//2]
        right = np.flip(img[:, w//2:w//2+left.shape[1]], axis=1)
        v_sym = self._calculate_similarity(left, right)
        
        # Diagonal symmetry
        size = min(h, w)
        square = img[:size, :size]
        diag_sym = self._calculate_similarity(square, square.T)
        
        # Rotational symmetry
        center = (w//2, h//2)
        
        # 90-degree rotation
        M90 = cv.getRotationMatrix2D(center, 90, 1.0) # Use cv.
        rot90 = cv.warpAffine(img, M90, (w, h)) # Use cv.
        rot90_sym = self._calculate_similarity(img, rot90)
        
        # 180-degree rotation
        M180 = cv.getRotationMatrix2D(center, 180, 1.0) # Use cv.
        rot180 = cv.warpAffine(img, M180, (w, h)) # Use cv.
        rot180_sym = self._calculate_similarity(img, rot180)
        
        # Determine primary symmetry
        symmetries = {
            'horizontal': h_sym,
            'vertical': v_sym,
            'diagonal': diag_sym,
            'rotational_90': rot90_sym,
            'rotational_180': rot180_sym
        }
        
        # Explicitly convert to list of items for max function
        primary = max(symmetries.items(), key=lambda item: item[1])[0]
        is_symmetric = symmetries[primary] > 0.7
        
        return SymmetryInfo(
            horizontal=h_sym,
            vertical=v_sym,
            diagonal=diag_sym,
            rotational_90=rot90_sym,
            rotational_180=rot180_sym,
            primary_symmetry=primary,
            is_symmetric=is_symmetric
        )
    
    def _calculate_similarity(self, img1: np.ndarray, img2: np.ndarray) -> float:
        """Calculate similarity between two images"""
        if img1.shape != img2.shape:
            return 0.0
        
        # Normalize images
        img1_norm = (img1 - np.mean(img1)) / (np.std(img1) + 1e-8)
        img2_norm = (img2 - np.mean(img2)) / (np.std(img2) + 1e-8)
        
        # Calculate correlation
        correlation = np.sum(img1_norm * img2_norm) / img1_norm.size
        
        return max(0.0, min(1.0, (float(correlation) + 1) / 2))  # Normalize to 0-1, cast to float
    
    def identify_repetition_patterns(self, img: np.ndarray) -> Dict:
        """Identify repetition patterns in the design"""
        sys.stderr.write("\n🔁 Identifying repetition patterns...\n")
        
        h, w = img.shape
        patterns = {}
        
        # Try different tile sizes
        tile_sizes = [(h//4, w//4), (h//3, w//3), (h//2, w//2)]
        
        best_score = 0.0
        best_tile = None
        
        for tile_h, tile_w in tile_sizes:
            if tile_h < 20 or tile_w < 20:
                continue
            
            # Extract tile
            tile = img[:tile_h, :tile_w]
            
            # Check repetition
            matches = 0
            total = 0
            
            for i in range(0, h-tile_h+1, tile_h):
                for j in range(0, w-tile_w+1, tile_w):
                    region = img[i:i+tile_h, j:j+tile_w]
                    similarity = self._calculate_similarity(tile, region)
                    if similarity > 0.7:
                        matches += 1
                    total += 1
            
            if total > 0:
                score = float(matches) / total # Cast to float
                if score > best_score:
                    best_score = score
                    best_tile = (tile_h, tile_w)
        
        patterns['has_repetition'] = best_score > 0.5
        patterns['repetition_score'] = best_score
        patterns['tile_size'] = best_tile
        
        return patterns
    
    def classify_kolam_type_cv(self, dot_grid: DotGrid, symmetry: SymmetryInfo, 
                               img: np.ndarray) -> Tuple[str, float]:
        """
        Classify Kolam type using Computer Vision features
        Types: Sikku, Pulli, Freehand
        """
        sys.stderr.write("\n🎨 Classifying Kolam type...\n")
        
        # Extract features
        features = self._extract_cv_features(img)
        
        scores = {}
        
        # Pulli Kolam - characterized by dot grids
        pulli_score = 0.0
        if dot_grid.rows > 0 and dot_grid.cols > 0:
            pulli_score += 0.4
        if dot_grid.regularity_score > 0.7:
            pulli_score += 0.3
        if len(dot_grid.dots) > 10:
            pulli_score += 0.2
        if symmetry.is_symmetric:
            pulli_score += 0.1
        scores['Pulli'] = pulli_score
        
        # Sikku Kolam - continuous lines, no dots, complex patterns
        sikku_score = 0.0
        if len(dot_grid.dots) < 5:
            sikku_score += 0.3
        if features['num_loops'] > 5:
            sikku_score += 0.3
        if features['num_curves'] > 10:
            sikku_score += 0.2
        if features['line_continuity'] > 0.7:
            sikku_score += 0.2
        scores['Sikku'] = sikku_score
        
        # Freehand Kolam - irregular, artistic
        freehand_score = 0.0
        if not symmetry.is_symmetric:
            freehand_score += 0.3
        if dot_grid.regularity_score < 0.3:
            freehand_score += 0.2
        if features['edge_density'] > 0.15:
            freehand_score += 0.3
        if features['irregularity'] > 0.6:
            freehand_score += 0.2
        scores['Freehand'] = freehand_score
        
        # Normalize scores
        total = sum(scores.values())
        if total > 0:
            scores = {k: v/total for k, v in scores.items()}
        
        # Get best type
        best_type = max(scores.items(), key=lambda item: item[1])[0] # Explicitly convert to list of items
        confidence = scores[best_type]
        
        return best_type, float(confidence) # Cast to float
    
    def _extract_cv_features(self, img: np.ndarray) -> Dict:
        """Extract CV features for classification"""
        features = {}
        
        # Edge detection
        edges = cv.Canny(img, 50, 150) # Use cv.
        features['edge_density'] = float(np.sum(edges > 0) / edges.size) # Cast to float
        
        # Find contours
        contours, _ = cv.findContours(edges, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE) # Use cv.
        
        # Count loops (closed contours)
        loops = 0
        curves = 0
        for contour in contours:
            area = cv.contourArea(contour) # Use cv.
            if area > 100:
                loops += 1
            
            # Check if curved
            if len(contour) > 5:
                perimeter = cv.arcLength(contour, True) # Use cv.
                approx = cv.approxPolyDP(contour, 0.02 * perimeter, True) # Use cv.
                if len(approx) < len(contour) * 0.5:
                    curves += 1
        
        features['num_loops'] = loops
        features['num_curves'] = curves
        
        # Line continuity (using Hough lines)
        lines = cv.HoughLinesP(edges, 1, np.pi/180, 50, minLineLength=30, maxLineGap=10) # Use cv.
        features['num_lines'] = len(lines) if lines is not None else 0
        
        # Calculate continuity
        if features['num_lines'] > 0:
            total_length = 0.0
            for line in lines:
                x1, y1, x2, y2 = line[0]
                length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                total_length += length
            features['line_continuity'] = min(1.0, total_length / (img.shape[0] * img.shape[1]) * 100)
        else:
            features['line_continuity'] = 0.0
        
        # Irregularity measure
        if len(contours) > 0:
            areas = [cv.contourArea(c) for c in contours] # Use cv.
            features['irregularity'] = float(np.std(areas) / (np.mean(areas) + 1e-8)) # Cast to float
        else:
            features['irregularity'] = 0.0
        
        return features
    
    def classify_with_dl_model(self, image_path: str) -> Tuple[str, float]:
        """Classify using the fine-tuned deep learning model"""
        # Load and transform image
        image = Image.open(image_path).convert('RGB')
        if self.transform is None:
            _, self.transform = get_transforms() # Ensure transform is loaded
        
        # Apply transform, ensuring it results in a tensor
        image_tensor = self.transform(image)
        # Ensure image_tensor is a torch.Tensor before unsqueezing
        if not isinstance(image_tensor, torch.Tensor):
            raise TypeError("Image transform did not return a torch.Tensor")
        image_tensor = image_tensor.unsqueeze(0).to(self.device) # Add batch dimension and move to device
        
        # Get prediction
        with torch.no_grad():
            if self.model is None:
                raise RuntimeError("Deep Learning model is not loaded.")
            outputs = self.model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted = probabilities.max(1)
        
        # Updated classes with new dot-grid pattern type
        classes = ['Simple (19-dot)', 'Intermediate (29-dot)', 
                  'Complex (109-dot)', 'Traditional', 'Dot-Grid']
        
        return classes[int(predicted.item())], float(confidence.item()) # Cast to int and float
    
    def extract_characteristics(self, img: np.ndarray) -> Dict:
        """Extract additional characteristics"""
        chars = {}
        
        # Ensure self.model is not None before proceeding
        if self.model is None:
            sys.stderr.write("Warning: DL model not loaded, some characteristics might be missing or inaccurate.\n")
            # You might want to return a default or partial dict here
            # For now, we'll proceed, but this is a potential point of failure if model-dependent logic follows.
        
        # Edge features
        edges = cv.Canny(img, 50, 150) # Use cv.
        chars['edge_pixels'] = int(np.sum(edges > 0)) # Cast to int
        chars['edge_density'] = float(chars['edge_pixels'] / edges.size) # Cast to float
        
        # Contour features
        contours, _ = cv.findContours(edges, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE) # Use cv.
        chars['num_contours'] = int(len(contours)) # Cast to int
        
        # Complexity measure
        if chars['edge_density'] < 0.05:
            chars['complexity'] = 'Simple'
        elif chars['edge_density'] < 0.1:
            chars['complexity'] = 'Medium'
        else:
            chars['complexity'] = 'Complex'
        
        return chars
    
    def _print_analysis_results(self, analysis: KolamAnalysis):
        """Print analysis results"""
        sys.stderr.write("\n" + "="*60 + "\n")
        sys.stderr.write(" ANALYSIS RESULTS\n")
        sys.stderr.write("="*60 + "\n")
        
        sys.stderr.write(f"\n📍 DOT GRID:\n")
        sys.stderr.write(f"   Dots detected: {len(analysis.dot_grid.dots)}\n")
        if analysis.dot_grid.rows > 0:
            sys.stderr.write(f"   Grid structure: {analysis.dot_grid.rows}×{analysis.dot_grid.cols}\n")
            sys.stderr.write(f"   Grid regularity: {analysis.dot_grid.regularity_score:.2%}\n")
        
        sys.stderr.write(f"\n🔄 SYMMETRY:\n")
        sys.stderr.write(f"   Primary: {analysis.symmetry.primary_symmetry}\n")
        sys.stderr.write(f"   H: {analysis.symmetry.horizontal:.2%}, V: {analysis.symmetry.vertical:.2%}\n")
        sys.stderr.write(f"   Rotational 90°: {analysis.symmetry.rotational_90:.2%}\n")
        
        sys.stderr.write(f"\n🔁 REPETITION:\n")
        if analysis.repetition_patterns['has_repetition']:
            sys.stderr.write(f"   Found repeating pattern\n")
            sys.stderr.write(f"   Tile size: {analysis.repetition_patterns['tile_size']}\n")
        else:
            sys.stderr.write(f"   No clear repetition pattern\n")
        
        sys.stderr.write(f"\n🎨 KOLAM TYPE (CV):\n")
        sys.stderr.write(f"   Type: {analysis.kolam_type}\n")
        sys.stderr.write(f"   Confidence: {analysis.type_confidence:.2%}\n")
        
        sys.stderr.write(f"\n🤖 DEEP LEARNING CLASSIFICATION:\n")
        sys.stderr.write(f"   Class: {analysis.dl_classification}\n")
        sys.stderr.write(f"   Confidence: {analysis.dl_confidence:.2%}\n")
        
        sys.stderr.write(f"\n📊 CHARACTERISTICS:\n")
        sys.stderr.write(f"   Complexity: {analysis.characteristics['complexity']}\n")
        sys.stderr.write(f"   Contours: {analysis.characteristics['num_contours']}\n")
    
    def visualize_analysis(self, image_path: str, analysis: KolamAnalysis, save_path: str = None):
        """Create visualization of analysis results"""
        img = cv.imread(image_path) # Use cv.
        if img is None: # Check if image loaded successfully
            sys.stderr.write(f"Error: Could not load image for visualization: {image_path}\n")
            return
        assert img is not None # Assert img is not None for Pylance
        img_rgb = cv.cvtColor(img, cv.COLOR_BGR2RGB) # Use cv.
        
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        fig.suptitle('Complete Kolam Analysis', fontsize=16, fontweight='bold')
        
        # Original image
        axes[0, 0].imshow(img_rgb)
        axes[0, 0].set_title('Original')
        axes[0, 0].axis('off')
        
        # Dot detection
        img_dots = img_rgb.copy()
        for dot in analysis.dot_grid.dots:
            cv.circle(img_dots, dot, 5, (0, 255, 0), -1) # Use cv.
            cv.circle(img_dots, dot, 7, (0, 255, 0), 2) # Use cv.
        axes[0, 1].imshow(img_dots)
        axes[0, 1].set_title(f'Dot Grid ({len(analysis.dot_grid.dots)} dots)')
        axes[0, 1].axis('off')
        
        # Edge detection
        gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY) # Use cv.
        edges = cv.Canny(gray, 50, 150) # Use cv.
        axes[0, 2].imshow(edges, cmap='gray')
        axes[0, 2].set_title('Pattern Extraction')
        axes[0, 2].axis('off')
        
        # Symmetry scores
        sym_labels = ['H', 'V', 'Diag', 'Rot90', 'Rot180']
        sym_values = [
            analysis.symmetry.horizontal,
            analysis.symmetry.vertical,
            analysis.symmetry.diagonal,
            analysis.symmetry.rotational_90,
            analysis.symmetry.rotational_180
        ]
        axes[1, 0].bar(sym_labels, sym_values)
        axes[1, 0].set_ylim([0, 1])
        axes[1, 0].set_title('Symmetry Analysis')
        axes[1, 0].set_ylabel('Score')
        
        # Classification results
        axes[1, 1].text(0.1, 0.8, f"CV Classification:", fontweight='bold', transform=axes[1, 1].transAxes)
        axes[1, 1].text(0.1, 0.6, f"{analysis.kolam_type} ({analysis.type_confidence:.1%})", 
                       fontsize=14, transform=axes[1, 1].transAxes)
        axes[1, 1].text(0.1, 0.4, f"DL Classification:", fontweight='bold', transform=axes[1, 1].transAxes)
        axes[1, 1].text(0.1, 0.2, f"{analysis.dl_classification} ({analysis.dl_confidence:.1%})",
                       fontsize=14, transform=axes[1, 1].transAxes)
        axes[1, 1].set_title('Classification Results')
        axes[1, 1].axis('off')
        
        # Summary
        summary = f"""
Grid: {analysis.dot_grid.rows}×{analysis.dot_grid.cols}
Dots: {len(analysis.dot_grid.dots)}
Regularity: {analysis.dot_grid.regularity_score:.1%}

Primary Symmetry: {analysis.symmetry.primary_symmetry}
Repetition: {'Yes' if analysis.repetition_patterns['has_repetition'] else 'No'}
Complexity: {analysis.characteristics['complexity']}
        """
        axes[1, 2].text(0.1, 0.5, summary, fontsize=10, 
                       transform=axes[1, 2].transAxes, verticalalignment='center')
        axes[1, 2].set_title('Analysis Summary')
        axes[1, 2].axis('off')
        
        plt.tight_layout()
        
        if save_path is not None: # Ensure save_path is not None before saving
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
        
        return fig

# --- Main execution logic from analyze_pkl.py ---
def main():
    analyzer = KolamCVAnalyzer()

    if len(sys.argv) > 1:
        file_path_to_analyze = sys.argv[1]
    else:
        # Default to a known image file for demonstration if no argument is provided
        file_path_to_analyze = "archive/Kolam109 Images/Kolam109 Images/kolam109-0.jpg" 
        sys.stderr.write(f"No file path provided. Analyzing default image: {file_path_to_analyze}\n")

    try:
        analysis_result = analyzer.analyze_kolam(file_path_to_analyze)
        
        # Convert dataclass objects and numpy types to standard Python types for JSON serialization
        dot_grid_dict = analysis_result.dot_grid.__dict__.copy()
        dot_grid_dict['num_dots'] = len(dot_grid_dict['dots'])
        dot_grid_dict['sample_dots'] = dot_grid_dict['dots'][:10] # Provide a sample of the first 10 dots
        del dot_grid_dict['dots'] # Remove the full list of dots for better presentation
        dot_grid_dict['rows'] = int(dot_grid_dict['rows'])
        dot_grid_dict['cols'] = int(dot_grid_dict['cols'])
        dot_grid_dict['spacing_x'] = float(dot_grid_dict['spacing_x'])
        dot_grid_dict['spacing_y'] = float(dot_grid_dict['spacing_y'])
        dot_grid_dict['regularity_score'] = float(dot_grid_dict['regularity_score'])

        symmetry_dict = analysis_result.symmetry.__dict__.copy()
        symmetry_dict['is_symmetric'] = bool(symmetry_dict['is_symmetric'])
        symmetry_dict['horizontal'] = float(symmetry_dict['horizontal'])
        symmetry_dict['vertical'] = float(symmetry_dict['vertical'])
        symmetry_dict['diagonal'] = float(symmetry_dict['diagonal'])
        symmetry_dict['rotational_90'] = float(symmetry_dict['rotational_90'])
        symmetry_dict['rotational_180'] = float(symmetry_dict['rotational_180'])

        repetition_patterns_dict = analysis_result.repetition_patterns.copy()
        if repetition_patterns_dict['tile_size'] is not None:
            repetition_patterns_dict['tile_size'] = tuple(int(x) for x in repetition_patterns_dict['tile_size'])
        repetition_patterns_dict['repetition_score'] = float(repetition_patterns_dict['repetition_score'])
        repetition_patterns_dict['has_repetition'] = bool(repetition_patterns_dict['has_repetition'])

        characteristics_dict = analysis_result.characteristics.copy()
        characteristics_dict['edge_pixels'] = int(characteristics_dict['edge_pixels'])
        characteristics_dict['edge_density'] = float(characteristics_dict['edge_density'])
        characteristics_dict['num_contours'] = int(characteristics_dict['num_contours'])

        output_dict = {
            "dot_grid": dot_grid_dict,
            "symmetry": symmetry_dict,
            "kolam_type": analysis_result.kolam_type,
            "type_confidence": float(analysis_result.type_confidence),
            "dl_classification": analysis_result.dl_classification,
            "dl_confidence": float(analysis_result.dl_confidence),
            "repetition_patterns": repetition_patterns_dict,
            "characteristics": characteristics_dict
        }
        print(json.dumps(output_dict, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=4))

if __name__ == "__main__":
    main()
