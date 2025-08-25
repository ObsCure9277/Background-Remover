import torch
from PIL import Image
import numpy as np
import sys
from u2net_model import U2NET

def remove_background(input_path, output_path, resolution="original", model_path="models/u2net.pth"):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    net = U2NET(3, 1)
    net.load_state_dict(torch.load(model_path, map_location=device))
    net.to(device)
    net.eval()

    image = Image.open(input_path).convert('RGB')
    orig_size = image.size

    # Preprocess
    image = image.resize((320, 320))
    img_np = np.array(image).astype(np.float32) / 255.0
    img_np = img_np.transpose((2, 0, 1))
    img_tensor = torch.from_numpy(img_np).unsqueeze(0).to(device)

    # Predict mask
    with torch.no_grad():
        d1, *_ = net(img_tensor)
    pred = d1[:, 0, :, :].cpu().numpy()[0]
    pred = (pred - pred.min()) / (pred.max() - pred.min())
    mask = Image.fromarray((pred * 255).astype(np.uint8)).resize(orig_size, Image.LANCZOS)

    # Apply mask to original image
    image = Image.open(input_path).convert('RGBA')
    mask_np = np.array(mask) / 255.0
    img_np = np.array(image)
    img_np[..., 3] = (mask_np * 255).astype(np.uint8)
    result = Image.fromarray(img_np, 'RGBA')

    # Resize the result based on the selected resolution
    if resolution != "original":
        if resolution == "hd":
            target_width, target_height = 1280, 720
        elif resolution == "fullhd":
            target_width, target_height = 1920, 1080
        elif resolution == "4k":
            target_width, target_height = 3840, 2160
        else:
            raise ValueError(f"Unsupported resolution: {resolution}")
        
        # Preserve aspect ratio
        orig_width, orig_height = result.size
        aspect_ratio = orig_width / orig_height

        if target_width / target_height > aspect_ratio:
            # Adjust width to maintain aspect ratio
            target_width = int(target_height * aspect_ratio)
        else:
            # Adjust height to maintain aspect ratio
            target_height = int(target_width / aspect_ratio)

        new_size = (target_width, target_height)
        print(f"Resizing image to resolution: {resolution}, size: {new_size}")
        result = result.resize(new_size, Image.LANCZOS)

    result.save(output_path)

if __name__ == "__main__":
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    resolution = sys.argv[3] if len(sys.argv) > 3 else "original"
    print("Input path:", input_path)
    print("Output path:", output_path)
    print("Resolution:", resolution)
    remove_background(input_path, output_path, resolution)