"""
Download U2-Net model if it doesn't exist
"""
import os
import urllib.request
from pathlib import Path

MODEL_URL = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx"
# Alternative: Original U2-Net PyTorch model
PYTORCH_MODEL_URL = "https://drive.google.com/uc?id=1ao1ovG1Qtx4b7EoskHXmi2E9rp5CHLcZ&export=download"

def download_model():
    """Download the U2-Net model if it doesn't exist"""
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)

    model_path = models_dir / "u2net.pth"

    if model_path.exists():
        print(f"Model already exists at {model_path}")
        return str(model_path)

    print(f"Downloading U2-Net model to {model_path}...")
    print("This may take a few minutes (168MB)...")

    try:
        # Try downloading from a direct link
        url = "https://huggingface.co/datasets/Xenova/u2net/resolve/main/u2net.pth"
        urllib.request.urlretrieve(url, model_path)
        print(f"Model downloaded successfully to {model_path}")
        return str(model_path)
    except Exception as e:
        print(f"Error downloading model: {e}")
        print("\nPlease manually download the model:")
        print("1. Download from: https://drive.google.com/uc?id=1ao1ovG1Qtx4b7EoskHXmi2E9rp5CHLcZ")
        print(f"2. Place it at: {model_path.absolute()}")
        raise

if __name__ == "__main__":
    download_model()
