from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
from PIL import Image
import io
from background_removal import remove_background

app = Flask(__name__)
CORS(app)

# Configure upload and output folders
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@app.route('/api/remove-background', methods=['POST'])
def remove_bg():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        original_filename = file.filename
        file_extension = os.path.splitext(original_filename)[1]
        
        # Save uploaded file
        input_path = os.path.join(UPLOAD_FOLDER, f"{file_id}{file_extension}")
        file.save(input_path)
        
        # Process image
        output_filename = f"processed_{file_id}_{original_filename.replace(file_extension, '.png')}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        result_image = remove_background(input_path)
        result_image.save(output_path, 'PNG')
        
        # Convert to base64 for preview
        img_buffer = io.BytesIO()
        result_image.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        import base64
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Clean up input file
        os.remove(input_path)
        
        return jsonify({
            'success': True,
            'image': f'data:image/png;base64,{img_base64}',
            'filename': output_filename
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        file_path = os.path.join(OUTPUT_FOLDER, filename)
        
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Get export options from query parameters
        width = request.args.get('width', type=int)
        height = request.args.get('height', type=int)
        format_type = request.args.get('format', 'png').lower()
        quality = request.args.get('quality', 90, type=int)
        maintain_aspect_ratio = request.args.get('maintainAspectRatio', 'true').lower() == 'true'
        
        # Open the processed image
        image = Image.open(file_path)
        
        # Resize if dimensions are specified
        if width or height:
            original_width, original_height = image.size
            
            if maintain_aspect_ratio:
                if width and height:
                    # Calculate which dimension to use based on aspect ratio
                    width_ratio = width / original_width
                    height_ratio = height / original_height
                    ratio = min(width_ratio, height_ratio)
                    new_width = int(original_width * ratio)
                    new_height = int(original_height * ratio)
                elif width:
                    ratio = width / original_width
                    new_width = width
                    new_height = int(original_height * ratio)
                elif height:
                    ratio = height / original_height
                    new_width = int(original_width * ratio)
                    new_height = height
            else:
                new_width = width or original_width
                new_height = height or original_height
            
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Convert format if needed
        if format_type == 'jpg':
            # Convert RGBA to RGB for JPG
            if image.mode == 'RGBA':
                # Create a white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
                image = background
            
            # Save as JPG
            img_buffer = io.BytesIO()
            image.save(img_buffer, format='JPEG', quality=quality, optimize=True)
            img_buffer.seek(0)
            
            return send_file(
                img_buffer,
                mimetype='image/jpeg',
                as_attachment=True,
                download_name=filename.replace('.png', '.jpg')
            )
            
        elif format_type == 'webp':
            img_buffer = io.BytesIO()
            image.save(img_buffer, format='WebP', quality=quality, optimize=True)
            img_buffer.seek(0)
            
            return send_file(
                img_buffer,
                mimetype='image/webp',
                as_attachment=True,
                download_name=filename.replace('.png', '.webp')
            )
        
        else:  # PNG (default)
            if width or height:
                # Save resized PNG
                img_buffer = io.BytesIO()
                image.save(img_buffer, format='PNG', optimize=True)
                img_buffer.seek(0)
                
                return send_file(
                    img_buffer,
                    mimetype='image/png',
                    as_attachment=True,
                    download_name=filename
                )
            else:
                # Send original PNG file
                return send_file(file_path, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)