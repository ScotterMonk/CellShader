# CellShader - Flask Web Application for Image Processing
# Phase 1: Foundation & Setup

from flask import Flask, render_template, request, jsonify, send_file
import os
import cv2
import numpy as np
from PIL import Image
from werkzeug.utils import secure_filename
import io

# Initialize Flask application.
app = Flask(__name__)

# Configuration settings.
app.config['SECRET_KEY'] = 'cellshader-dev-key-change-in-production'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size.
app.config['UPLOAD_FOLDER'] = 'uploads'

# Allowed file extensions for image uploads.
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

def allowed_file(filename):
    """Check if uploaded file has allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_upload_folder():
    """Create upload folder if it doesn't exist."""
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/')
def index():
    """Main page route - displays the image upload and processing interface."""
    return render_template('index.html')

@app.route('/health')
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'message': 'CellShader application is running',
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors."""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Create necessary directories.
    create_upload_folder()
    
    # Run the Flask application in debug mode.
    app.run(debug=True, host='0.0.0.0', port=5000)
