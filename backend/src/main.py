from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import sys
import uuid
import shutil
from pathlib import Path

# Add the src directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from background_removal import remove_background
from download_model import download_model

app = FastAPI(title="Background Remover API")

# Download model on startup if it doesn't exist
@app.on_event("startup")
async def startup_event():
    """Download model file if it doesn't exist"""
    try:
        download_model()
    except Exception as e:
        print(f"Warning: Could not download model: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
UPLOAD_DIR = Path("src/uploads")
OUTPUT_DIR = Path("src/outputs")
MODELS_DIR = Path("src/models")

for directory in [UPLOAD_DIR, OUTPUT_DIR, MODELS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

@app.get("/")
@app.head("/")
async def root():
    return {"message": "Background Remover API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint - verifies API and model are ready"""
    model_path = MODELS_DIR / "u2net.pth"
    model_exists = model_path.exists()

    status = {
        "status": "healthy" if model_exists else "unhealthy",
        "api": "running",
        "model_loaded": model_exists,
    }

    if model_exists:
        file_size_mb = model_path.stat().st_size / (1024 * 1024)
        status["model_size_mb"] = round(file_size_mb, 1)
        status["model_path"] = str(model_path)

    return status

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
    input_path = None
    output_path = None

    try:
        print(f"\n=== New background removal request ===")
        print(f"Filename: {file.filename}")
        print(f"Content-Type: {file.content_type}")
        print(f"Resolution: {resolution}")

        # Validate file type
        allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}
        file_ext = Path(file.filename).suffix.lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file_ext}. Allowed: {', '.join(allowed_extensions)}"
            )

        # Generate unique filenames
        unique_id = str(uuid.uuid4())
        input_filename = f"{unique_id}_input{file_ext}"
        output_filename = f"{unique_id}_output.png"

        input_path = UPLOAD_DIR / input_filename
        output_path = OUTPUT_DIR / output_filename

        # Save uploaded file
        print(f"Saving uploaded file to {input_path}")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size_mb = input_path.stat().st_size / (1024 * 1024)
        print(f"File saved successfully ({file_size_mb:.2f} MB)")

        # Check if model exists
        model_path = MODELS_DIR / "u2net.pth"
        if not model_path.exists():
            print(f"ERROR: Model not found at {model_path}")
            input_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=500,
                detail="Model file not found. Please wait for model download or contact support."
            )

        print(f"Model found at {model_path}")

        # Process the image
        print("Starting background removal process...")
        remove_background(
            str(input_path),
            str(output_path),
            resolution=resolution,
            model_path=str(model_path)
        )

        # Verify output was created
        if not output_path.exists():
            raise Exception("Output file was not created")

        output_size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"Output file created successfully ({output_size_mb:.2f} MB)")

        # Clean up input file
        input_path.unlink(missing_ok=True)
        print(f"Input file cleaned up")

        print(f"=== Request completed successfully ===\n")
        return {
            "success": True,
            "output_file": output_filename,
            "message": "Background removed successfully"
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

        # Clean up on error
        if input_path and input_path.exists():
            input_path.unlink(missing_ok=True)
            print("Cleaned up input file after error")
        if output_path and output_path.exists():
            output_path.unlink(missing_ok=True)
            print("Cleaned up output file after error")

        raise HTTPException(
            status_code=500,
            detail=f"Background removal failed: {str(e)}"
        )

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
    uvicorn.run(app, host="0.0.0.0", port=5000)
