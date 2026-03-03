"""
Kolam AI Backend - FastAPI server for Kolam analysis and generation
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional
import base64
import io
import json
import numpy as np
from PIL import Image
import tempfile
import os

from kolam_analyzer import KolamAnalyzer, analyze_kolam
from kolam_generator import KolamGenerator, generate_kolam, KolamType, SymmetryType

app = FastAPI(
    title="Kolam AI API",
    description="API for analyzing and generating Kolam patterns",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Kolam AI API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze - Analyze a Kolam image",
            "generate": "/generate - Generate a Kolam pattern",
            "templates": "/templates - List available templates",
            "principles": "/principles - Get design principles"
        }
    }


@app.post("/analyze")
async def analyze_kolam_endpoint(file: UploadFile = File(...)):
    """
    Analyze a Kolam image to extract design principles
    
    Returns:
        - Dot grid information (rows, cols, spacing)
        - Symmetry analysis (horizontal, vertical, diagonal, rotational)
        - Complexity metrics
        - Design principles
    """
    try:
        contents = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            result = analyze_kolam(tmp_path)
            return JSONResponse(content=result)
        finally:
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/base64")
async def analyze_kolam_base64(image_data: str = Form(...)):
    """
    Analyze a Kolam image from base64 encoded string
    """
    try:
        image_bytes = base64.b64decode(image_data)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        try:
            result = analyze_kolam(tmp_path)
            return JSONResponse(content=result)
        finally:
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_kolam_endpoint(
    template: str = Form("pulli_5x5"),
    grid_size: int = Form(5),
    symmetry: str = Form("none"),
    output_format: str = Form("json")
):
    """
    Generate a Kolam pattern
    
    Parameters:
        - template: Template name (pulli_3x3, pulli_5x5, sikku_basic, star, diamond, spiral, mandala)
        - grid_size: Size of the dot grid (3-11)
        - symmetry: Symmetry type (none, horizontal, vertical, diagonal, rotational_90, rotational_180, radial)
        - output_format: Output format (json, svg, png)
    """
    try:
        if grid_size < 2 or grid_size > 15:
            raise HTTPException(status_code=400, detail="Grid size must be between 2 and 15")
        
        valid_templates = [
            "pulli_3x3", "pulli_5x5", "pulli_7x7",
            "sikku_basic", "sikku_diagonal",
            "star", "diamond", "spiral", "mandala"
        ]
        if template not in valid_templates:
            raise HTTPException(status_code=400, detail=f"Invalid template. Valid: {valid_templates}")
        
        valid_symmetries = ["none", "horizontal", "vertical", "diagonal", "rotational_90", "rotational_180", "radial"]
        if symmetry not in valid_symmetries:
            raise HTTPException(status_code=400, detail=f"Invalid symmetry. Valid: {valid_symmetries}")
        
        generator = KolamGenerator(grid_size=grid_size)
        pattern = generator.generate_from_template(template)
        
        if symmetry != "none":
            sym_map = {
                "horizontal": SymmetryType.HORIZONTAL,
                "vertical": SymmetryType.VERTICAL,
                "diagonal": SymmetryType.DIAGONAL,
                "rotational_90": SymmetryType.ROTATIONAL_90,
                "rotational_180": SymmetryType.ROTATIONAL_180,
                "radial": SymmetryType.RADIAL,
            }
            pattern = generator.generate_with_symmetry(pattern.lines, sym_map[symmetry])
        
        if output_format == "json":
            result = {
                "template": template,
                "grid_size": grid_size,
                "symmetry": symmetry,
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
        
        elif output_format == "svg":
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
        
        elif output_format == "png":
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
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/templates")
async def list_templates():
    """List all available Kolam templates"""
    templates = {
        "pulli": {
            "templates": ["pulli_3x3", "pulli_5x5", "pulli_7x7"],
            "description": "Dot-based Kolam patterns with straight line connections"
        },
        "sikku": {
            "templates": ["sikku_basic", "sikku_diagonal"],
            "description": "Knot-based Kolam patterns with curved interlacings"
        },
        "geometric": {
            "templates": ["star", "diamond"],
            "description": "Geometric patterns based on stars and diamonds"
        },
        "spiral": {
            "templates": ["spiral", "mandala"],
            "description": "Spiral and circular patterns"
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
        "templates": all_templates
    })


@app.get("/principles")
async def get_design_principles():
    """
    Get information about Kolam design principles
    
    This endpoint provides educational information about:
    - Construction rules
    - Symmetry types
    - Grid classifications
    - Pattern categories
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
            "square_grid": "Regular grid with equal horizontal and vertical spacing",
            "rectangular_grid": "Grid with different horizontal and vertical spacing",
            "diamond_grid": "Square grid rotated 45 degrees",
            "triangular_grid": "Triangle-based lattice arrangement",
            "hexagonal_grid": "Honeycomb-style arrangement"
        },
        "pattern_types": {
            "pulli": "Dot-based patterns (Pulli Kolam)",
            "sikku": "Knot-based patterns (Sikku Kolam)",
            "kambi": "Line-based patterns (Kambi Kolam)",
            "neli": "Curvy flowing patterns (Neli Kolam)",
            "freehand": "Free-form artistic patterns"
        },
        "complexity_levels": {
            "simple": "Basic patterns with few dots and lines",
            "moderate": "Intermediate patterns with moderate complexity",
            "complex": "Advanced patterns with multiple symmetries",
            "very_complex": "Expert-level intricate designs"
        }
    }
    
    return JSONResponse(content=principles)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "kolam-ai-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
