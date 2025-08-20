# CellShader - Flask Web Application for Image Processing
# Phase 2: Core Image Processing

from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for
import os
import cv2
import numpy as np
from PIL import Image
from werkzeug.utils import secure_filename
import io
import logging
import json
from datetime import datetime

# Initialize Flask application.
app = Flask(__name__)

# Configuration settings.
app.config['SECRET_KEY'] = 'cellshader-dev-key-change-in-production'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size.
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['METADATA_FILE'] = 'uploads/images_metadata.json'

# Allowed file extensions for image uploads.
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

# Configure logging.
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    """Check if uploaded file has allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_upload_folder():
    """Create upload folder if it doesn't exist."""
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

def load_images_metadata():
    """Load images metadata from JSON file."""
    try:
        if os.path.exists(app.config['METADATA_FILE']):
            with open(app.config['METADATA_FILE'], 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        logger.error(f"Error loading images metadata: {str(e)}")
        return []

def save_images_metadata(images):
    """Save images metadata to JSON file."""
    try:
        os.makedirs(os.path.dirname(app.config['METADATA_FILE']), exist_ok=True)
        with open(app.config['METADATA_FILE'], 'w', encoding='utf-8') as f:
            json.dump(images, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved metadata for {len(images)} images")
    except Exception as e:
        logger.error(f"Error saving images metadata: {str(e)}")
        raise

def add_image_metadata(filename, original_name, file_size, width, height, target_width=None, target_height=None, keep_ratio=True):
    """Add new image to metadata storage."""
    try:
        images = load_images_metadata()
        
        # Create new image entry.
        image_entry = {
            'id': len(images) + 1,
            'filename': filename,
            'original_name': original_name,
            'file_size': file_size,
            'original_width': width,
            'original_height': height,
            'target_width': target_width or width,
            'target_height': target_height or height,
            'keep_ratio': keep_ratio,
            'aspect_ratio': width / height,
            'upload_time': datetime.now().isoformat(),
            'file_path': os.path.join('uploads', filename).replace('\\', '/')
        }
        
        images.append(image_entry)
        save_images_metadata(images)
        
        logger.info(f"Added image metadata: {original_name}")
        return image_entry
        
    except Exception as e:
        logger.error(f"Error adding image metadata: {str(e)}")
        raise

def remove_image_metadata(image_id):
    """Remove image from metadata storage."""
    try:
        images = load_images_metadata()
        images = [img for img in images if img.get('id') != image_id]
        save_images_metadata(images)
        logger.info(f"Removed image metadata for ID: {image_id}")
    except Exception as e:
        logger.error(f"Error removing image metadata: {str(e)}")
        raise

def create_cell_shaded_folder(original_path):
    """Create cell-shaded subfolder in the same directory as the original image."""
    try:
        directory = os.path.dirname(original_path)
        cell_shaded_folder = os.path.join(directory, 'cell-shaded')
        
        if not os.path.exists(cell_shaded_folder):
            os.makedirs(cell_shaded_folder)
            logger.info(f"Created cell-shaded folder: {cell_shaded_folder}")
        
        return cell_shaded_folder
    except Exception as e:
        logger.error(f"Error creating cell-shaded folder: {str(e)}")
        raise

def apply_cell_shading(image_path, edge_thickness=7, color_levels=8, smoothing_amount=7, saturation_amount=1.0, target_width=None, target_height=None, keep_ratio=True):
    """
    Apply cell-shading effect to an image using OpenCV.
    
    Args:
        image_path (str): Path to the input image
        edge_thickness (int): Thickness of edges (1-10)
        color_levels (int): Number of color levels (2-20)
        smoothing_amount (int): Amount of smoothing (1-15)
        saturation_amount (float): Saturation multiplier (0.0-2.0, 1.0 = original)
        target_width (int, optional): Target width for resizing
        target_height (int, optional): Target height for resizing
        keep_ratio (bool): Whether to maintain aspect ratio when resizing
    
    Returns:
        numpy.ndarray: Processed image as numpy array
    """
    try:
        # Read the image.
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        logger.info(f"Processing image: {image_path}")
        logger.info(f"Parameters - Edge thickness: {edge_thickness}, Color levels: {color_levels}, Smoothing: {smoothing_amount}, Saturation: {saturation_amount}")
        
        # Apply custom resizing if target dimensions are provided.
        height, width = img.shape[:2]
        if target_width is not None or target_height is not None:
            # Compute final dimensions with keep_ratio logic.
            if keep_ratio:
                aspect_ratio = width / height
                if target_width is not None and target_height is not None:
                    # Prefer width when both provided.
                    new_width = target_width
                    new_height = int(target_width / aspect_ratio)
                elif target_width is not None:
                    new_width = target_width
                    new_height = int(target_width / aspect_ratio)
                elif target_height is not None:
                    new_height = target_height
                    new_width = int(target_height * aspect_ratio)
            else:
                new_width = target_width if target_width is not None else width
                new_height = target_height if target_height is not None else height
            
            # Choose interpolation method based on scaling direction.
            if new_width * new_height < width * height:
                # Downscaling - use INTER_AREA for better quality.
                interpolation = cv2.INTER_AREA
            else:
                # Upscaling - use INTER_LANCZOS4 for better quality.
                interpolation = cv2.INTER_LANCZOS4
            
            img = cv2.resize(img, (new_width, new_height), interpolation=interpolation)
            logger.info(f"Resized image to {new_width}x{new_height}")
        
        # Apply bilateral filter for smoothing while preserving edges.
        smooth = cv2.bilateralFilter(img, smoothing_amount, 80, 80)
        
        # Apply saturation adjustment if needed.
        if saturation_amount != 1.0:
            # Convert to HSV color space for saturation adjustment.
            hsv = cv2.cvtColor(smooth, cv2.COLOR_BGR2HSV)
            hsv = hsv.astype(np.float32)
            
            # Adjust saturation channel (index 1 in HSV).
            hsv[:, :, 1] = hsv[:, :, 1] * saturation_amount
            
            # Clamp values to valid range and convert back to uint8.
            hsv[:, :, 1] = np.clip(hsv[:, :, 1], 0, 255)
            hsv = hsv.astype(np.uint8)
            
            # Convert back to BGR color space.
            smooth = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
            logger.info(f"Applied saturation adjustment: {saturation_amount}")
        
        # Create edge mask using adaptive threshold.
        gray = cv2.cvtColor(smooth, cv2.COLOR_BGR2GRAY)
        gray_blur = cv2.medianBlur(gray, 5)
        # Ensure blockSize is odd and greater than 1 for adaptiveThreshold
        block_size = edge_thickness if edge_thickness % 2 == 1 else edge_thickness + 1
        edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, block_size, edge_thickness)
        
        # Convert edges to 3-channel.
        edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
        
        # Reduce colors using K-means clustering.
        data = smooth.reshape((-1, 3))
        data = np.float32(data)
        
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
        _, labels, centers = cv2.kmeans(data, color_levels, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        
        # Convert back to uint8 and reshape.
        centers = np.uint8(centers)
        segmented_data = centers[labels.flatten()]
        segmented_image = segmented_data.reshape(smooth.shape)
        
        # Combine the segmented image with edges.
        cartoon = cv2.bitwise_and(segmented_image, edges)
        
        logger.info("Cell-shading effect applied successfully")
        return cartoon
        
    except Exception as e:
        logger.error(f"Error applying cell-shading: {str(e)}")
        raise

def save_processed_image(processed_img, original_path, output_folder):
    """
    Save the processed image to the output folder.
    
    Args:
        processed_img (numpy.ndarray): Processed image array
        original_path (str): Path to original image
        output_folder (str): Output folder path
    
    Returns:
        str: Path to saved processed image
    """
    try:
        # Get original filename and extension.
        original_filename = os.path.basename(original_path)
        name, ext = os.path.splitext(original_filename)
        
        # Create output filename with timestamp.
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{name}_cellshaded_{timestamp}{ext}"
        output_path = os.path.join(output_folder, output_filename)
        
        # Save the processed image.
        success = cv2.imwrite(output_path, processed_img)
        if not success:
            raise ValueError(f"Failed to save image to {output_path}")
        
        logger.info(f"Processed image saved to: {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Error saving processed image: {str(e)}")
        raise

@app.route('/')
def index():
    """Main page route - displays the image upload and processing interface."""
    return render_template('index.html')

@app.route('/api/images', methods=['GET'])
def get_images():
    """Get all stored images metadata."""
    try:
        images = load_images_metadata()
        return jsonify({
            'success': True,
            'images': images
        })
    except Exception as e:
        logger.error(f"Error getting images: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/images/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):
    """Delete image and its metadata."""
    try:
        images = load_images_metadata()
        image_to_delete = None
        
        # Find the image to delete.
        for img in images:
            if img.get('id') == image_id:
                image_to_delete = img
                break
        
        if not image_to_delete:
            return jsonify({
                'success': False,
                'error': 'Image not found'
            }), 404
        
        # Delete the physical file.
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_to_delete['filename'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Remove from metadata.
        remove_image_metadata(image_id)
        
        return jsonify({
            'success': True,
            'message': 'Image deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Error deleting image {image_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/images/<int:image_id>', methods=['PUT'])
def update_image(image_id):
    """Update image metadata (width, height, keep_ratio)."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        images = load_images_metadata()
        image_updated = False
        
        # Find and update the image.
        for img in images:
            if img.get('id') == image_id:
                if 'target_width' in data:
                    img['target_width'] = int(data['target_width'])
                if 'target_height' in data:
                    img['target_height'] = int(data['target_height'])
                if 'keep_ratio' in data:
                    img['keep_ratio'] = bool(data['keep_ratio'])
                image_updated = True
                break
        
        if not image_updated:
            return jsonify({
                'success': False,
                'error': 'Image not found'
            }), 404
        
        save_images_metadata(images)
        
        return jsonify({
            'success': True,
            'message': 'Image updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Error updating image {image_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and process image with cell-shading effect."""
    try:
        # Check if file was uploaded.
        if 'file' not in request.files:
            flash('No file selected')
            return redirect(request.url)
        
        file = request.files['file']
        if file.filename == '':
            flash('No file selected')
            return redirect(request.url)
        
        # Validate file type.
        if not allowed_file(file.filename):
            flash('Invalid file type. Please upload PNG, JPG, JPEG, GIF, BMP, or TIFF files.')
            return redirect(request.url)
        
        # Get processing parameters from form.
        edge_thickness = int(request.form.get('edge_thickness', 7))
        color_levels = int(request.form.get('color_levels', 8))
        smoothing_amount = int(request.form.get('smoothing_amount', 7))
        saturation_amount = float(request.form.get('saturation_amount', 1.0))
        
        # Get sizing parameters from form.
        target_width = request.form.get('target_width')
        target_height = request.form.get('target_height')
        keep_ratio = request.form.get('keep_ratio', '1') == '1'
        
        # Convert and validate sizing parameters.
        if target_width:
            target_width = int(target_width)
            if target_width <= 0 or target_width > 3840:
                return jsonify({
                    'success': False,
                    'error': 'Target width must be between 1 and 3840 pixels.'
                }), 400
        else:
            target_width = None
            
        if target_height:
            target_height = int(target_height)
            if target_height <= 0 or target_height > 2160:
                return jsonify({
                    'success': False,
                    'error': 'Target height must be between 1 and 2160 pixels.'
                }), 400
        else:
            target_height = None
        
        # Validate processing parameters.
        edge_thickness = max(1, min(10, edge_thickness))
        color_levels = max(2, min(20, color_levels))
        smoothing_amount = max(1, min(15, smoothing_amount))
        saturation_amount = max(0.0, min(2.0, saturation_amount))
        
        # Save uploaded file.
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        logger.info(f"File uploaded: {file_path}")
        
        # Get original image dimensions.
        original_img = cv2.imread(file_path)
        if original_img is None:
            return jsonify({
                'success': False,
                'error': 'Could not read uploaded image.'
            }), 400
        original_height, original_width = original_img.shape[:2]
        original_dims = {'width': original_width, 'height': original_height}
        
        # Save image metadata for persistence.
        try:
            add_image_metadata(
                filename=unique_filename,
                original_name=file.filename,
                file_size=file.content_length or os.path.getsize(file_path),
                width=original_width,
                height=original_height,
                target_width=target_width,
                target_height=target_height,
                keep_ratio=keep_ratio
            )
        except Exception as e:
            logger.warning(f"Could not save image metadata: {str(e)}")
        
        # Compute final dimensions if sizing parameters provided.
        if target_width is not None or target_height is not None:
            if keep_ratio:
                aspect_ratio = original_width / original_height
                if target_width is not None and target_height is not None:
                    # Prefer width when both provided.
                    final_width = target_width
                    final_height = int(target_width / aspect_ratio)
                elif target_width is not None:
                    final_width = target_width
                    final_height = int(target_width / aspect_ratio)
                elif target_height is not None:
                    final_height = target_height
                    final_width = int(target_height * aspect_ratio)
                
                # Cap to maximum dimensions while preserving aspect ratio.
                if final_width > 3840 or final_height > 2160:
                    scale = min(3840 / final_width, 2160 / final_height)
                    final_width = int(final_width * scale)
                    final_height = int(final_height * scale)
            else:
                final_width = target_width if target_width is not None else original_width
                final_height = target_height if target_height is not None else original_height
                
            final_dims = {'width': final_width, 'height': final_height}
        else:
            # No resizing - use original dimensions.
            final_dims = original_dims
            final_width = original_width
            final_height = original_height
        
        # Create cell-shaded output folder.
        output_folder = create_cell_shaded_folder(file_path)
        
        # Apply cell-shading effect with sizing parameters.
        processed_img = apply_cell_shading(
            file_path,
            edge_thickness,
            color_levels,
            smoothing_amount,
            saturation_amount,
            final_width if final_width != original_width else None,
            final_height if final_height != original_height else None,
            keep_ratio
        )
        
        # Save processed image.
        output_path = save_processed_image(processed_img, file_path, output_folder)
        
        # Return success response with dimension information.
        return jsonify({
            'success': True,
            'message': 'Image processed successfully',
            'original_path': file_path,
            'processed_path': output_path,
            'original_dims': original_dims,
            'final_dims': final_dims,
            'parameters': {
                'edge_thickness': edge_thickness,
                'color_levels': color_levels,
                'smoothing_amount': smoothing_amount,
                'saturation_amount': saturation_amount,
                'target_width': target_width,
                'target_height': target_height,
                'keep_ratio': keep_ratio
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files and processed images."""
    try:
        # Check if file exists in uploads folder
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            return send_file(file_path)
        
        # Check if file exists in cell-shaded subfolder
        cell_shaded_path = os.path.join(app.config['UPLOAD_FOLDER'], 'cell-shaded', filename)
        if os.path.exists(cell_shaded_path):
            return send_file(cell_shaded_path)
        
        # File not found
        return jsonify({'error': 'File not found'}), 404
        
    except Exception as e:
        logger.error(f"Error serving file {filename}: {str(e)}")
        return jsonify({'error': 'Error serving file'}), 500

@app.route('/health')
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'message': 'CellShader application is running',
        'version': '2.0.0'
    })

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors."""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return render_template('500.html'), 500

@app.errorhandler(413)
def file_too_large(error):
    """Handle file too large errors."""
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size is 16MB.'
    }), 413

if __name__ == '__main__':
    # Create necessary directories.
    create_upload_folder()
    
    # Run the Flask application in debug mode.
    app.run(debug=True, host='0.0.0.0', port=5000)
