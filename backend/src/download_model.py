"""
Download U2-Net model if it doesn't exist
"""
import os
import urllib.request
from pathlib import Path
import sys
import ssl

def download_with_progress(url, destination):
    """Download file with progress reporting"""
    def reporthook(count, block_size, total_size):
        """Progress bar callback"""
        if total_size > 0:
            percent = int(count * block_size * 100 / total_size)
            sys.stdout.write(f"\rDownloading: {percent}%")
            sys.stdout.flush()

    # Create SSL context that doesn't verify certificates (for Google Drive)
    context = ssl._create_unverified_context()
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=context))
    urllib.request.install_opener(opener)

    urllib.request.urlretrieve(url, destination, reporthook)
    print()  # New line after progress

def download_model():
    """Download the U2-Net model if it doesn't exist"""
    models_dir = Path("src/models")
    models_dir.mkdir(parents=True, exist_ok=True)

    model_path = models_dir / "u2net.pth"

    if model_path.exists():
        file_size_mb = model_path.stat().st_size / (1024 * 1024)
        print(f"✓ Model already exists at {model_path} ({file_size_mb:.1f} MB)")
        return str(model_path)

    print(f"Downloading U2-Net model to {model_path}...")
    print("This may take a few minutes (168MB)...")

    # List of download URLs to try
    urls = [
        "https://drive.usercontent.google.com/download?id=1ao1ovG1Qtx4b7EoskHXmi2E9rp5CHLcZ&export=download&confirm=t",
        "https://huggingface.co/akhaliq/U-2-Net/resolve/main/u2net.pth",
        "https://github.com/xuebinqin/U-2-Net/releases/download/model/u2net.pth",
    ]

    for i, url in enumerate(urls):
        try:
            print(f"\nTrying URL {i+1}/{len(urls)}: {url}")
            download_with_progress(url, model_path)

            # Verify download
            if model_path.exists():
                file_size_mb = model_path.stat().st_size / (1024 * 1024)
                if file_size_mb > 100:  # Model should be ~168MB
                    print(f"✓ Model downloaded successfully ({file_size_mb:.1f} MB)")
                    return str(model_path)
                else:
                    print(f"✗ Downloaded file too small ({file_size_mb:.1f} MB). Trying next URL...")
                    model_path.unlink()
            else:
                print("✗ Download failed. Trying next URL...")

        except Exception as e:
            print(f"✗ Error downloading from {url}: {e}")
            if model_path.exists():
                model_path.unlink()
            continue

    # All URLs failed
    print("\n" + "="*60)
    print("ERROR: Could not download model from any source.")
    print("\nPlease manually download the model:")
    print("1. Download from: https://drive.google.com/uc?id=1ao1ovG1Qtx4b7EoskHXmi2E9rp5CHLcZ")
    print(f"2. Place it at: {model_path.absolute()}")
    print("="*60)
    raise Exception("Model download failed from all sources")

if __name__ == "__main__":
    download_model()
