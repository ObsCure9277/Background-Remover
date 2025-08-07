import torch
import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
from u2net_model import U2NET

class BackgroundRemover:
    def __init__(self, model_path="models/u2net.pth"):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.net = U2NET(3, 1)
        self.net.load_state_dict(torch.load(model_path, map_location=self.device))
        self.net.to(self.device)
        self.net.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((320, 320)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])

    def remove_background(self, image_path, output_path=None):
        # Load image - explicitly handle WEBP
        try:
            image = Image.open(image_path)
            # Convert to RGB if needed (WEBP can have different modes)
            if image.mode in ('RGBA', 'LA', 'P'):
                # Create a white background for transparent images
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
        except Exception as e:
            raise Exception(f"Error loading image: {str(e)}")
            
        original_size = image.size
        
        # Preprocess
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        # Predict
        with torch.no_grad():
            d1, d2, d3, d4, d5, d6, d7 = self.net(input_tensor)
            
        # Post-process
        pred = d1[:, 0, :, :]
        pred_np = pred.cpu().numpy()[0]
        
        # Normalize to 0-1
        pred_np = (pred_np - pred_np.min()) / (pred_np.max() - pred_np.min())
        
        # Resize mask to original size
        mask = Image.fromarray((pred_np * 255).astype(np.uint8)).resize(original_size, Image.LANCZOS)
        mask_np = np.array(mask) / 255.0
        
        # Apply mask to original image
        image_np = np.array(image)
        result = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
        result[:, :, :3] = image_np
        result[:, :, 3] = (mask_np * 255).astype(np.uint8)
        
        result_image = Image.fromarray(result, 'RGBA')
        
        if output_path:
            result_image.save(output_path)
        
        return result_image

# Global instance for convenience
_remover = None

def remove_background(image_path, output_path=None):
    """
    Convenience function to remove background from an image.
    
    Args:
        image_path (str): Path to input image
        output_path (str, optional): Path to save output image
    
    Returns:
        PIL.Image: Processed image with transparent background
    """
    global _remover
    if _remover is None:
        _remover = BackgroundRemover()
    
    return _remover.remove_background(image_path, output_path)