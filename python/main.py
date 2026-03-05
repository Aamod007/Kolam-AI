"""
Kolam AI Backend - FastAPI server for Kolam analysis and generation
Version 2.0 - With proper error handling and validation
"""

import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
import base64
import io
import json
import tempfile
import os
from pydantic import BaseModel, Field, validator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Kolam AI API",
    description="API for analyzing and generating Kolam patterns",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    """Request model for Kolam generation"""
    template: str = Field(default="pulli_5x5")
    grid_size: int = Field(default=5, ge=2, le=15)
    symmetry: str = Field(default="none")
    output_format: str = Field(default="json")
    
    @validator('template')
    def validate_template(cls, v):
        valid_templates = [
            "pulli_3x3", "pulli_5x5", "pulli_7x7", "pulli_9x9", "pulli_11x11",
            "sikku_3x3", "sikku_5x5", "sikku_7x7", "sikku_basic", "sikku_diagonal",
            "star", "diamond", "spiral", "mandala", "kodi", "padi"
        ]
        if v not in valid_templates:
            raise ValueError(f"Invalid template. Valid: {valid_templates}")
        return v
    
    @validator('symmetry')
    def validate_symmetry(cls, v):
        valid = ["none", "horizontal", "vertical", "diagonal", "rotational_90", "rotational_180", "radial"]
        if v not in valid:
            raise ValueError(f"Invalid symmetry. Valid: {valid}")
        return v
    
    @validator('output_format')
    def validate_output_format(cls, v):
        valid = ["json", "svg", "png"]
        if v not in valid:
            raise ValueError(f"Invalid output_format. Valid: {valid}")
        return v


@app.get("/")
async def root():
    return {
        "message": "Kolam AI API v2.0.0",
        "version": "2.0.0",
        "endpoints": {
            "analyze": "/analyze - Analyze a Kolam image",
            "generate": "/generate - Generate a Kolam pattern",
            "templates": "/templates - List available templates",
            "principles": "/principles - Get design principles",
            "health": "/health - Health check"
        },
        "documentation": "/docs"
    }


@app.post("/analyze")
async def analyze_kolam_endpoint(
    file: UploadFile = File(...),
    min_dot_radius: int = Form(default=3),
    max_dot_radius: int = Form(default=20)
):
    """
    Analyze a Kolam image to extract design principles
    """
    try:
        if min_dot_radius < 1 or min_dot_radius > 50:
            raise HTTPException(status_code=400, detail="min_dot_radius must be between 1 and 50")
        if max_dot_radius < 1 or max_dot_radius > 100:
            raise HTTPException(status_code=400, detail="max_dot_radius must be between 1 and 100")
        if min_dot_radius >= max_dot_radius:
            raise HTTPException(status_code=400, detail="min_dot_radius must be less than max_dot_radius")
        
        contents = await file.read()
        
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 10MB")
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
        
        try:
            from kolam_analyzer import KolamAnalyzer, KolamAnalyzerConfig
            
            config = KolamAnalyzerConfig(
                min_dot_radius=min_dot_radius,
                max_dot_radius=max_dot_radius
            )
            analyzer = KolamAnalyzer(config)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                tmp.write(contents)
                tmp_path = tmp.name
            
            try:
                result = analyzer.analyze(tmp_path)
                return JSONResponse(content=result.to_dict())
            finally:
                os.unlink(tmp_path)
                
        except ImportError as e:
            logger.warning(f"Python dependencies not available: {e}")
            return JSONResponse(content={
                "error": "Analysis service temporarily unavailable",
                "details": "Python dependencies not installed",
                "setup_instructions": "Run: cd python && pip install -r requirements.txt"
            }, status=503)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return JSONResponse(content={
            "error": "Analysis failed",
            "details": str(e)
        }, status=500)


@app.post("/generate")
async def generate_kolam_endpoint(request: GenerateRequest):
    """
    Generate a Kolam pattern
    """
    try:
        try:
            from kolam_generator import KolamGenerator, KolamGeneratorConfig, generate_kolam as py_generate
            
            config = KolamGeneratorConfig(grid_size=request.grid_size)
            generator = KolamGenerator(config)
            pattern = generator.generate_from_template(request.template)
            
            from kolam_generator import SymmetryType
            sym_map = {
                "horizontal": SymmetryType.HORIZONTAL,
                "vertical": SymmetryType.VERTICAL,
                "diagonal": SymmetryType.DIAGONAL,
                "rotational_90": SymmetryType.ROTATIONAL_90,
                "rotational_180": SymmetryType.ROTATIONAL_180,
                "radial": SymmetryType.RADIAL,
            }
            
            if request.symmetry != "none" and request.symmetry in sym_map:
                pattern = generator.generate_with_symmetry(pattern.lines, sym_map[request.symmetry])
            
            if request.output_format == "json":
                result = {
                    "template": request.template,
                    "grid_size": request.grid_size,
                    "symmetry": request.symmetry,
                    "num_dots": len(pattern.dots),
                    "num_lines": len(pattern.lines),
                    "dots": [{"id": d.id, "x": d.x, "y": d.y} for d in pattern.dots],
                    "lines": [
                        {
                            "from": {"x": ls.start.x, "y": ls.start.y},
                            "to": {"x": ls.end.x, "y": ls.end.y}
                        }
                        for ls in pattern.lines
                    ],
                    "construction_steps": [
                        {
                            "from": {"x": ls.start.x, "y": ls.start.y},
                            "to": {"x": ls.end.x, "y": ls.end.y}
                        }
                        for ls in pattern.lines
                    ]
                }
                return JSONResponse(content=result)
            
            elif request.output_format == "svg":
                with tempfile.NamedTemporaryFile(delete=False, suffix=".svg") as tmp:
                    pattern.to_svg(tmp.name)
                    with open(tmp.name, 'r') as f:
                        svg_content = f.read()
                os.unlink(tmp.name)
                
                return StreamingResponse(
                    io.BytesIO(svg_content.encode()),
                    media_type="image/svg+xml",
                    headers={"Content-Disposition": f"attachment; filename=kolam.svg"}
                )
            
            elif request.output_format == "png":
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                    pattern.to_image(tmp.name)
                    with open(tmp.name, 'rb') as f:
                        img_data = f.read()
                os.unlink(tmp.name)
                
                return StreamingResponse(
                    io.BytesIO(img_data),
                    media_type="image/png",
                    headers={"Content-Disposition": f"attachment; filename=kolam.png"}
                )
            
        except ImportError as e:
            logger.warning(f"Python dependencies not available: {e}")
            return JSONResponse(content={
                "error": "Generation service temporarily unavailable",
                "details": "Python dependencies not installed",
                "setup_instructions": "Run: cd python && pip install -r requirements.txt"
            }, status=503)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation error: {e}")
        return JSONResponse(content={
            "error": "Generation failed",
            "details": str(e)
        }, status=500)


@app.get("/templates")
async def list_templates():
    """List all available Kolam templates"""
    templates = {
        "pulli": {
            "templates": ["pulli_3x3", "pulli_5x5", "pulli_7x7", "pulli_9x9", "pulli_11x11"],
            "description": "Dot-based Kolam patterns with straight line connections"
        },
        "sikku": {
            "templates": ["sikku_3x3", "sikku_5x5", "sikku_7x7", "sikku_basic", "sikku_diagonal"],
            "description": "Knot-based Kolam patterns with curved interlacings"
        },
        "geometric": {
            "templates": ["star", "diamond"],
            "description": "Geometric patterns based on stars and diamonds"
        },
        "spiral": {
            "templates": ["spiral", "mandala"],
            "description": "Spiral and circular patterns"
        },
        "other": {
            "templates": ["kodi", "padi"],
            "description": "Traditional pattern styles"
        }
    }
    
    all_templates = []
    for category, data in templates.items():
        for t in data["templates"]:
            all_templates.append({
                "name": t,
                "category": category,
                "description": data["description"]
            })
    
    return JSONResponse(content={
        "templates": all_templates,
        "count": len(all_templates)
    })


@app.get("/principles")
async def get_design_principles():
    """
    Get information about Kolam design principles
    """
    principles = {
        "construction_rules": [
            "Start with a regular dot grid",
            "Connect dots following symmetry principles",
            "Maintain continuous line flow when possible",
            "Create closed loops for intricate designs",
            "Use reflection and rotation for symmetry"
        ],
        "symmetry_types": {
            "horizontal": "Mirror across horizontal axis",
            "vertical": "Mirror across vertical axis",
            "diagonal": "Mirror across diagonal axes",
            "rotational_90": "4-fold rotational symmetry",
            "rotational_180": "2-fold rotational symmetry",
            "radial": "Multiple axes radiating from center"
        },
        "grid_types": {
            "square_grid": "Regular grid with equal spacing",
            "rectangular_grid": "Different horizontal and vertical spacing",
            "diamond_grid": "Square grid rotated 45 degrees",
            "triangular_grid": "Triangle-based lattice",
            "hexagonal_grid": "Honeycomb-style arrangement"
        },
        "pattern_types": {
            "pulli": "Dot-based patterns",
            "sikku": "Knot-based patterns",
            "kambi": "Line-based patterns",
            "neli": "Curvy flowing patterns",
            "freehand": "Free-form artistic patterns"
        }
    }
    
    return JSONResponse(content=principles)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = {
        "status": "healthy",
        "service": "kolam-ai-api",
        "version": "2.0.0"
    }
    
    try:
        import numpy
        status["numpy"] = "available"
    except ImportError:
        status["numpy"] = "unavailable"
    
    try:
        import cv2
        status["opencv"] = "available"
    except ImportError:
        status["opencv"] = "unavailable"
    
    try:
        import networkx
        status["networkx"] = "available"
    except ImportError:
        status["networkx"] = "unavailable"
    
    return JSONResponse(content=status)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
