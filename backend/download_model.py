import gdown
import os

def download_u2net_model():
    model_dir = "models"
    if not os.path.exists(model_dir):
        os.makedirs(model_dir)
    
    model_path = os.path.join(model_dir, "u2net.pth")
    if not os.path.exists(model_path):
        print("Downloading U2-Net model...")
        url = "https://drive.google.com/uc?id=1ao1ovG1Qtx4b7EoskHXmi2E9rp5CHLcZ"
        gdown.download(url, model_path, quiet=False)
        print("Model downloaded successfully!")
    else:
        print("Model already exists!")

if __name__ == "__main__":
    download_u2net_model()