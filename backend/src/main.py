from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import uuid
import shutil
from pathlib import Path
from background_removal import remove_background

app = FastAPI(title="Background Remover API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
MODELS_DIR = Path("models")

for directory in [UPLOAD_DIR, OUTPUT_DIR, MODELS_DIR]:
    directory.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Background Remover API is running"}

@app.post("/api/remove-background")
async def api_remove_background(
    file: UploadFile = File(...),
    resolution: str = Form("original")
):
    """
    Remove background from uploaded image

    - **file**: Image file (png, jpg, jpeg, gif, bmp, webp)
    - **resolution**: Output resolution (original, hd, fullhd, 4k)
    """
    try:
        # Validate file type
        allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}
        file_ext = Path(file.filename).suffix.lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type")

        # Generate unique filenames
        unique_id = str(uuid.uuid4())
        input_filename = f"{unique_id}_input{file_ext}"
        output_filename = f"{unique_id}_output.png"

        input_path = UPLOAD_DIR / input_filename
        output_path = OUTPUT_DIR / output_filename

        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Check if model exists
        model_path = MODELS_DIR / "u2net.pth"
        if not model_path.exists():
            # Clean up
            input_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=500,
                detail="Model file not found. Please download the model first."
            )

        # Process the image
        remove_background(
            str(input_path),
            str(output_path),
            resolution=resolution,
            model_path=str(model_path)
        )

        # Clean up input file
        input_path.unlink(missing_ok=True)

        return {
            "success": True,
            "output_file": output_filename,
            "message": "Background removed successfully"
        }

    except Exception as e:
        # Clean up on error
        if 'input_path' in locals():
            input_path.unlink(missing_ok=True)
        if 'output_path' in locals():
            output_path.unlink(missing_ok=True)

        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Download processed image"""
    file_path = OUTPUT_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="image/png"
    )

@app.delete("/api/cleanup/{filename}")
async def cleanup_file(filename: str):
    """Delete processed file from server"""
    file_path = OUTPUT_DIR / filename

    if file_path.exists():
        file_path.unlink()
        return {"success": True, "message": "File deleted successfully"}

    return {"success": False, "message": "File not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
