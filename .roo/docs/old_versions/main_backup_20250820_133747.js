// CellShader Application JavaScript

// Global variables
let selectedFile = null;
let currentProcessedPath = null;
let originalAspectRatio = null;
let originalWidth = null;
let originalHeight = null;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    initializeFileUpload();
    initializeResolutionControls();
});

// Initialize slider controls with real-time updates
function initializeSliders() {
    const edgeSlider = document.getElementById('edgeThickness');
    const colorSlider = document.getElementById('colorLevels');
    const smoothingSlider = document.getElementById('smoothingAmount');

    edgeSlider.addEventListener('input', function() {
        document.getElementById('edgeValue').textContent = this.value;
    });

    colorSlider.addEventListener('input', function() {
        document.getElementById('colorValue').textContent = this.value;
    });

    smoothingSlider.addEventListener('input', function() {
        document.getElementById('smoothingValue').textContent = this.value;
    });
}

// Initialize resolution controls with event handlers
function initializeResolutionControls() {
    const targetWidthInput = document.getElementById('targetWidth');
    const targetHeightInput = document.getElementById('targetHeight');
    const keepRatioCheckbox = document.getElementById('keepRatio');

    // Width input handler - auto-updates height when keep ratio is on
    targetWidthInput.addEventListener('input', function() {
        if (keepRatioCheckbox.checked && originalAspectRatio && this.value) {
            const width = parseInt(this.value);
            if (width > 0) {
                const height = Math.round(width / originalAspectRatio);
                targetHeightInput.value = height;
                validateResolution(width, height);
            }
        } else if (this.value) {
            validateResolution(parseInt(this.value), targetHeightInput.value ? parseInt(targetHeightInput.value) : null);
        }
    });

    // Height input handler - validate but don't auto-update width
    targetHeightInput.addEventListener('input', function() {
        if (this.value) {
            validateResolution(targetWidthInput.value ? parseInt(targetWidthInput.value) : null, parseInt(this.value));
        }
    });

    // Keep ratio checkbox handler
    keepRatioCheckbox.addEventListener('change', function() {
        if (this.checked && originalAspectRatio && targetWidthInput.value) {
            // Recalculate height based on current width
            const width = parseInt(targetWidthInput.value);
            const height = Math.round(width / originalAspectRatio);
            targetHeightInput.value = height;
            validateResolution(width, height);
        }
        
        // Disable/enable height input based on keep ratio setting
        targetHeightInput.disabled = this.checked;
    });

    // Initially disable height input if keep ratio is checked
    targetHeightInput.disabled = keepRatioCheckbox.checked;
}

// Validate resolution inputs and show status
function validateResolution(width, height) {
    const maxWidth = 3840;
    const maxHeight = 2160;
    
    if (width && (width < 1 || width > maxWidth)) {
        showStatus(`Width must be between 1 and ${maxWidth} pixels.`, 'error');
        return false;
    }
    
    if (height && (height < 1 || height > maxHeight)) {
        showStatus(`Height must be between 1 and ${maxHeight} pixels.`, 'error');
        return false;
    }
    
    return true;
}

// Reset resolution controls
function resetResolutionControls() {
    document.getElementById('targetWidth').value = '';
    document.getElementById('targetHeight').value = '';
    document.getElementById('keepRatio').checked = true;
    document.getElementById('targetHeight').disabled = true;
    document.getElementById('originalDims').textContent = 'Original: --';
    originalAspectRatio = null;
    originalWidth = null;
    originalHeight = null;
}

// Initialize file upload functionality with drag and drop
function initializeFileUpload() {
    const uploadSection = document.getElementById('uploadSection');
    const fileInput = document.getElementById('imageUpload');

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop handlers
    uploadSection.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadSection.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleFileSelection(file);
            } else {
                showStatus('Please select a valid image file.', 'error');
            }
        }
    });
}

// Handle file selection and preview
function handleFileSelection(file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
        showStatus('Invalid file type. Please select PNG, JPG, JPEG, GIF, BMP, or TIFF files.', 'error');
        return;
    }

    // Validate file size (16MB limit)
    const maxSize = 16 * 1024 * 1024; // 16MB
    if (file.size > maxSize) {
        showStatus('File too large. Maximum size is 16MB.', 'error');
        return;
    }

    selectedFile = file;
    document.getElementById('processBtn').disabled = false;
    
    // Show preview of selected file and read dimensions
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Store original dimensions and aspect ratio
            originalWidth = this.naturalWidth;
            originalHeight = this.naturalHeight;
            originalAspectRatio = originalWidth / originalHeight;
            
            // Update UI with original dimensions
            document.getElementById('originalDims').textContent = `Original: ${originalWidth}x${originalHeight}`;
            
            // Prefill resolution fields with original dimensions
            document.getElementById('targetWidth').value = originalWidth;
            document.getElementById('targetHeight').value = originalHeight;
            
            // Set the preview image
            document.getElementById('originalImage').src = e.target.result;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    showStatus(`Selected: ${file.name} (${formatFileSize(file.size)})`, 'info');
}

// Browse directory functionality (placeholder)
function browseDirectory() {
    const directoryPath = document.getElementById('directoryPath').value.trim();
    if (!directoryPath) {
        showStatus('Please enter a directory path.', 'error');
        return;
    }

    // Note: Directory browsing requires backend implementation for security
    showStatus('Directory browsing requires backend implementation for security reasons. Please use the file upload instead.', 'info');
    
    // Show mock file list for demonstration
    showMockFileList();
}

// Show mock file list (demonstration purposes)
function showMockFileList() {
    const fileBrowser = document.getElementById('fileBrowser');
    const fileList = document.getElementById('fileList');
    
    const mockFiles = [
        { name: 'sample1.jpg', size: '2.3 MB' },
        { name: 'sample2.png', size: '1.8 MB' },
        { name: 'sample3.gif', size: '4.1 MB' },
        { name: 'photo.jpeg', size: '3.2 MB' }
    ];

    fileList.innerHTML = '';
    mockFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <strong>${file.name}</strong>
            <span class="text-muted" style="float: right;">${file.size}</span>
        `;
        fileItem.onclick = () => selectFileFromList(fileItem, file.name);
        fileList.appendChild(fileItem);
    });

    fileBrowser.classList.remove('hidden');
}

// Select file from directory list
function selectFileFromList(element, filename) {
    // Remove previous selection
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Select current item
    element.classList.add('selected');
    
    showStatus(`Note: File selection from directory requires backend implementation. Selected: ${filename}`, 'info');
}

// Process image with current parameters
async function processImage() {
    if (!selectedFile) {
        showStatus('Please select an image first.', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('edge_thickness', document.getElementById('edgeThickness').value);
    formData.append('color_levels', document.getElementById('colorLevels').value);
    formData.append('smoothing_amount', document.getElementById('smoothingAmount').value);
    
    // Add resolution parameters
    const targetWidth = document.getElementById('targetWidth').value;
    const targetHeight = document.getElementById('targetHeight').value;
    const keepRatio = document.getElementById('keepRatio').checked;
    
    if (targetWidth) {
        formData.append('target_width', targetWidth);
    }
    if (targetHeight) {
        formData.append('target_height', targetHeight);
    }
    formData.append('keep_ratio', keepRatio ? '1' : '0');

    // Show processing status
    showStatus('Processing image...', 'info');
    showProgress(0);
    document.getElementById('processBtn').disabled = true;

    try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
            const currentWidth = parseInt(document.getElementById('progressBar').style.width) || 0;
            if (currentWidth < 90) {
                showProgress(currentWidth + 10);
            }
        }, 200);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);
        showProgress(100);

        const result = await response.json();

        if (result.success) {
            showStatus('Image processed successfully!', 'success');
            displayResults(result);
        } else {
            showStatus(`Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showStatus(`Network error: ${error.message}`, 'error');
        console.error('Processing error:', error);
    } finally {
        document.getElementById('processBtn').disabled = false;
        setTimeout(() => {
            document.getElementById('statusSection').classList.add('hidden');
        }, 5000);
    }
}

// Display processing results
function displayResults(result) {
    currentProcessedPath = result.processed_path;
    
    // Extract filename from path (handle both Windows and Unix path separators)
    const filename = result.processed_path.split(/[/\\]/).pop();
    
    // Show processed image
    document.getElementById('processedImage').src = `/uploads/${filename}`;
    
    // Show results section
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('downloadBtn').style.display = 'inline-block';
    
    // Scroll to results smoothly
    document.getElementById('resultsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Download processed image
function downloadImage() {
    if (currentProcessedPath && selectedFile) {
        const filename = currentProcessedPath.split(/[/\\]/).pop();
        const link = document.createElement('a');
        link.href = `/uploads/${filename}`;
        link.download = `cellshaded_${selectedFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showStatus('Download started!', 'success');
    }
}

// Show status message with auto-hide
function showStatus(message, type) {
    const statusSection = document.getElementById('statusSection');
    const statusMessage = document.getElementById('statusMessage');
    
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusSection.classList.remove('hidden');
    
    // Auto-hide success and info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusSection.classList.add('hidden');
        }, 4000);
    }
}

// Show progress bar
function showProgress(percentage) {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = Math.min(100, Math.max(0, percentage)) + '%';
}

// Reset form to initial state
function resetForm() {
    selectedFile = null;
    currentProcessedPath = null;
    document.getElementById('processBtn').disabled = true;
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('statusSection').classList.add('hidden');
    document.getElementById('fileBrowser').classList.add('hidden');
    document.getElementById('imageUpload').value = '';
    document.getElementById('directoryPath').value = '';
    document.getElementById('originalImage').src = '';
    document.getElementById('processedImage').src = '';
    showProgress(0);
    resetResolutionControls();
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to validate image file
function isValidImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff'];
    return allowedTypes.includes(file.type);
}

// Export functions for global access
window.CellShader = {
    processImage,
    browseDirectory,
    downloadImage,
    resetForm,
    handleFileSelection
};