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
from datetime import datetime

# Initialize Flask application.
app = Flask(__name__)

# Configuration settings.
app.config['SECRET_KEY'] = 'cellshader-dev-key-change-in-production'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size.
app.config['UPLOAD_FOLDER'] = 'uploads'

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

def apply_cell_shading(image_path, edge_thickness=7, color_levels=8, smoothing_amount=7):
    """
    Apply cell-shading effect to an image using OpenCV.
    
    Args:
        image_path (str): Path to the input image
        edge_thickness (int): Thickness of edges (1-10)
        color_levels (int): Number of color levels (2-20)
        smoothing_amount (int): Amount of smoothing (1-15)
    
    Returns:
        numpy.ndarray: Processed image as numpy array
    """
    try:
        # Read the image.
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        logger.info(f"Processing image: {image_path}")
        logger.info(f"Parameters - Edge thickness: {edge_thickness}, Color levels: {color_levels}, Smoothing: {smoothing_amount}")
        
        # Resize image if too large for processing.
        height, width = img.shape[:2]
        if width > 1920 or height > 1080:
            scale = min(1920/width, 1080/height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
            logger.info(f"Resized image to {new_width}x{new_height}")
        
        # Apply bilateral filter for smoothing while preserving edges.
        smooth = cv2.bilateralFilter(img, smoothing_amount, 80, 80)
        
        # Create edge mask using adaptive threshold.
        gray = cv2.cvtColor(smooth, cv2.COLOR_BGR2GRAY)
        gray_blur = cv2.medianBlur(gray, 5)
        edges = cv2.adaptiveThreshold(gray_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, edge_thickness, edge_thickness)
        
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
        
        # Validate parameters.
        edge_thickness = max(1, min(10, edge_thickness))
        color_levels = max(2, min(20, color_levels))
        smoothing_amount = max(1, min(15, smoothing_amount))
        
        # Save uploaded file.
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        logger.info(f"File uploaded: {file_path}")
        
        # Create cell-shaded output folder.
        output_folder = create_cell_shaded_folder(file_path)
        
        # Apply cell-shading effect.
        processed_img = apply_cell_shading(file_path, edge_thickness, color_levels, smoothing_amount)
        
        # Save processed image.
        output_path = save_processed_image(processed_img, file_path, output_folder)
        
        # Return success response.
        return jsonify({
            'success': True,
            'message': 'Image processed successfully',
            'original_path': file_path,
            'processed_path': output_path,
            'parameters': {
                'edge_thickness': edge_thickness,
                'color_levels': color_levels,
                'smoothing_amount': smoothing_amount
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
