// CellShader Application JavaScript

// Global variables
let selectedFile = null; // Keep for backward compatibility
let selectedImages = []; // Array to store multiple selected images
let currentProcessedPath = null;
let originalAspectRatio = null;
let originalWidth = null;
let originalHeight = null;
let imageIdCounter = 0; // Counter for unique image IDs

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    initializeFileUpload();
    initializeResolutionControls();
    loadExistingImages();
});

// Initialize slider controls with real-time updates
function initializeSliders() {
    const edgeSlider = document.getElementById('edgeThickness');
    const colorSlider = document.getElementById('colorLevels');
    const smoothingSlider = document.getElementById('smoothingAmount');
    const saturationSlider = document.getElementById('saturationAmount');

    edgeSlider.addEventListener('input', function() {
        document.getElementById('edgeValue').textContent = this.value;
    });

    colorSlider.addEventListener('input', function() {
        document.getElementById('colorValue').textContent = this.value;
    });

    smoothingSlider.addEventListener('input', function() {
        document.getElementById('smoothingValue').textContent = this.value;
    });

    saturationSlider.addEventListener('input', function() {
        document.getElementById('saturationValue').textContent = this.value;
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

    // File input change handler - process all selected files
    fileInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file) {
                handleFileSelection(file);
            }
        });
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
        
        const files = Array.from(e.dataTransfer.files);
        let validFilesCount = 0;
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                handleFileSelection(file);
                validFilesCount++;
            }
        });
        
        if (validFilesCount === 0 && files.length > 0) {
            showStatus('Please select valid image files.', 'error');
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

    // Check if image is already selected
    const existingImage = selectedImages.find(img => img.name === file.name && img.size === file.size);
    if (existingImage) {
        showStatus(`Image "${file.name}" is already selected.`, 'warning');
        return;
    }

    // Keep backward compatibility
    selectedFile = file;
    
    // Add image to selected images array
    addImageToTable(file);
    
    showStatus(`Added: ${file.name} (${formatFileSize(file.size)})`, 'success');
}

// Load existing images from server on page load
async function loadExistingImages() {
    try {
        const response = await fetch('/api/images');
        const result = await response.json();
        
        if (result.success && result.images.length > 0) {
            console.log(`Loading ${result.images.length} existing images`);
            
            for (const imageData of result.images) {
                await loadServerImage(imageData);
            }
            
            // Show images section if we loaded any images
            if (selectedImages.length > 0) {
                showImagesSection();
                updateProcessButton();
                selectedFile = selectedImages[0].file; // Set for backward compatibility
            }
        }
    } catch (error) {
        console.error('Error loading existing images:', error);
    }
}

// Load a single image from server data
async function loadServerImage(serverImageData) {
    try {
        // Create a simplified image data object for the table
        const imageData = {
            id: serverImageData.id,
            file: null, // We don't have the actual file object
            name: serverImageData.original_name,
            size: serverImageData.file_size,
            originalWidth: serverImageData.original_width,
            originalHeight: serverImageData.original_height,
            targetWidth: serverImageData.target_width,
            targetHeight: serverImageData.target_height,
            keepRatio: serverImageData.keep_ratio,
            aspectRatio: serverImageData.aspect_ratio,
            preview: `/uploads/${serverImageData.filename}`,
            serverData: serverImageData // Keep reference to server data
        };
        
        // Add to selected images array
        selectedImages.push(imageData);
        
        // Create table row
        createImageTableRow(imageData);
        
        // Update counter to avoid ID conflicts
        imageIdCounter = Math.max(imageIdCounter, serverImageData.id);
        
    } catch (error) {
        console.error('Error loading server image:', error);
    }
}

// Add image to the table and selectedImages array
function addImageToTable(file) {
    const imageId = ++imageIdCounter;
    
    // Create image object
    const imageData = {
        id: imageId,
        file: file,
        name: file.name,
        size: file.size,
        originalWidth: null,
        originalHeight: null,
        targetWidth: null,
        targetHeight: null,
        keepRatio: true,
        aspectRatio: null,
        preview: null
    };
    
    // Read image dimensions and create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Update image data with dimensions
            imageData.originalWidth = this.naturalWidth;
            imageData.originalHeight = this.naturalHeight;
            imageData.targetWidth = this.naturalWidth;
            imageData.targetHeight = this.naturalHeight;
            imageData.aspectRatio = this.naturalWidth / this.naturalHeight;
            imageData.preview = e.target.result;
            
            // Add to selected images array
            selectedImages.push(imageData);
            
            // Create table row
            createImageTableRow(imageData);
            
            // Show the images section and enable process button
            showImagesSection();
            updateProcessButton();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Create a table row for the image
function createImageTableRow(imageData) {
    const tableBody = document.getElementById('imageTableBody');
    const row = document.createElement('tr');
    row.id = `image-row-${imageData.id}`;
    
    row.innerHTML = `
        <td>
            <img src="${imageData.preview}" alt="${imageData.name}" class="image-preview">
        </td>
        <td>
            <div class="image-name" title="${imageData.name}">${imageData.name}</div>
            <div class="text-muted" style="font-size: 0.8em;">${formatFileSize(imageData.size)}</div>
        </td>
        <td>
            <input type="number" class="dimension-input" id="width-${imageData.id}"
                   value="${imageData.targetWidth}" min="1" max="3840"
                   onchange="updateImageWidth(${imageData.id}, this.value)">
            <div class="text-muted" style="font-size: 0.8em;">/${imageData.originalWidth}</div>
        </td>
        <td>
            <input type="number" class="dimension-input" id="height-${imageData.id}"
                   value="${imageData.targetHeight}" min="1" max="2160"
                   onchange="updateImageHeight(${imageData.id}, this.value)"
                   ${imageData.keepRatio ? 'disabled' : ''}>
            <div class="text-muted" style="font-size: 0.8em;">/${imageData.originalHeight}</div>
        </td>
        <td>
            <input type="checkbox" class="keep-ratio-checkbox" id="ratio-${imageData.id}"
                   ${imageData.keepRatio ? 'checked' : ''}
                   onchange="toggleKeepRatio(${imageData.id}, this.checked)">
        </td>
        <td>
            <button class="remove-btn" onclick="removeImage(${imageData.id})"
                    title="Remove image">✕</button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

// Show the images section
function showImagesSection() {
    document.getElementById('selectedImagesSection').classList.remove('hidden');
}

// Hide the images section
function hideImagesSection() {
    document.getElementById('selectedImagesSection').classList.add('hidden');
}

// Update process button state
function updateProcessButton() {
    const processBtn = document.getElementById('processBtn');
    processBtn.disabled = selectedImages.length === 0;
}

// Update image width and recalculate height if keep ratio is enabled
async function updateImageWidth(imageId, width) {
    const imageData = selectedImages.find(img => img.id === imageId);
    if (!imageData) return;
    
    const newWidth = parseInt(width);
    if (isNaN(newWidth) || newWidth < 1) return;
    
    imageData.targetWidth = newWidth;
    
    if (imageData.keepRatio) {
        const newHeight = Math.round(newWidth / imageData.aspectRatio);
        imageData.targetHeight = newHeight;
        document.getElementById(`height-${imageId}`).value = newHeight;
    }
    
    // Sync with server if this is a server image
    if (imageData.serverData) {
        await syncImageWithServer(imageId, {
            target_width: imageData.targetWidth,
            target_height: imageData.targetHeight,
            keep_ratio: imageData.keepRatio
        });
    }
}

// Update image height
async function updateImageHeight(imageId, height) {
    const imageData = selectedImages.find(img => img.id === imageId);
    if (!imageData) return;
    
    const newHeight = parseInt(height);
    if (isNaN(newHeight) || newHeight < 1) return;
    
    imageData.targetHeight = newHeight;
    
    // Sync with server if this is a server image
    if (imageData.serverData) {
        await syncImageWithServer(imageId, {
            target_width: imageData.targetWidth,
            target_height: imageData.targetHeight,
            keep_ratio: imageData.keepRatio
        });
    }
}

// Toggle keep ratio for specific image
async function toggleKeepRatio(imageId, keepRatio) {
    const imageData = selectedImages.find(img => img.id === imageId);
    if (!imageData) return;
    
    imageData.keepRatio = keepRatio;
    const heightInput = document.getElementById(`height-${imageId}`);
    heightInput.disabled = keepRatio;
    
    if (keepRatio) {
        // Recalculate height based on current width
        const newHeight = Math.round(imageData.targetWidth / imageData.aspectRatio);
        imageData.targetHeight = newHeight;
        heightInput.value = newHeight;
    }
    
    // Sync with server if this is a server image
    if (imageData.serverData) {
        await syncImageWithServer(imageId, {
            target_width: imageData.targetWidth,
            target_height: imageData.targetHeight,
            keep_ratio: imageData.keepRatio
        });
    }
}

// Sync image changes with server
async function syncImageWithServer(imageId, updateData) {
    try {
        const response = await fetch(`/api/images/${imageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Failed to sync image with server:', result.error);
        }
    } catch (error) {
        console.error('Error syncing image with server:', error);
    }
}

// Remove image from table and array
async function removeImage(imageId) {
    // Find the image to remove
    const imageToRemove = selectedImages.find(img => img.id === imageId);
    
    // If it's a server image, delete from server
    if (imageToRemove && imageToRemove.serverData) {
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (!result.success) {
                showStatus(`Error deleting image: ${result.error}`, 'error');
                return;
            }
        } catch (error) {
            showStatus(`Network error: ${error.message}`, 'error');
            return;
        }
    }
    
    // Remove from array
    selectedImages = selectedImages.filter(img => img.id !== imageId);
    
    // Remove table row
    const row = document.getElementById(`image-row-${imageId}`);
    if (row) {
        row.remove();
    }
    
    // Update UI
    updateProcessButton();
    
    if (selectedImages.length === 0) {
        hideImagesSection();
        selectedFile = null; // Clear backward compatibility variable
    } else {
        selectedFile = selectedImages[0].file; // Keep first image for backward compatibility
    }
    
    showStatus('Image removed from selection.', 'info');
}

// Remove all images from table and array
async function removeAllImages() {
    if (selectedImages.length === 0) {
        showStatus('No images to remove.', 'info');
        return;
    }
    
    // Confirm with user
    if (!confirm(`Are you sure you want to remove all ${selectedImages.length} image(s)?`)) {
        return;
    }
    
    showStatus('Removing all images...', 'info');
    
    let errorCount = 0;
    const imagesToRemove = [...selectedImages]; // Create a copy to iterate over
    
    // Remove each image (including server images)
    for (const imageData of imagesToRemove) {
        if (imageData.serverData) {
            try {
                const response = await fetch(`/api/images/${imageData.id}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                if (!result.success) {
                    console.error(`Error deleting image ${imageData.name}: ${result.error}`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`Network error deleting image ${imageData.name}: ${error.message}`);
                errorCount++;
            }
        }
    }
    
    // Clear the arrays and UI
    selectedImages = [];
    selectedFile = null;
    
    // Clear image table
    document.getElementById('imageTableBody').innerHTML = '';
    
    // Update UI
    updateProcessButton();
    hideImagesSection();
    
    // Show result message
    if (errorCount === 0) {
        showStatus('All images removed successfully.', 'success');
    } else {
        showStatus(`Images removed with ${errorCount} error(s). Check console for details.`, 'warning');
    }
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

// Process all selected images with current parameters
async function processImage() {
    if (selectedImages.length === 0) {
        showStatus('Please select at least one image first.', 'error');
        return;
    }

    // Get processing parameters
    const edgeThickness = document.getElementById('edgeThickness').value;
    const colorLevels = document.getElementById('colorLevels').value;
    const smoothingAmount = document.getElementById('smoothingAmount').value;
    const saturationAmount = document.getElementById('saturationAmount').value;

    // Show processing status
    showStatus(`Processing ${selectedImages.length} image(s)...`, 'info');
    showProgress(0);
    document.getElementById('processBtn').disabled = true;

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    try {
        // Process each image sequentially
        for (let i = 0; i < selectedImages.length; i++) {
            const imageData = selectedImages[i];
            
            // Skip server images without file data
            if (!imageData.file) {
                showStatus(`Skipping ${imageData.name} - no file data available`, 'warning');
                processedCount++;
                errorCount++;
                continue;
            }

            // Update status for current image
            showStatus(`Processing ${imageData.name} (${i + 1}/${selectedImages.length})...`, 'info');
            
            // Create form data for this image
            const formData = new FormData();
            formData.append('file', imageData.file);
            formData.append('edge_thickness', edgeThickness);
            formData.append('color_levels', colorLevels);
            formData.append('smoothing_amount', smoothingAmount);
            formData.append('saturation_amount', parseFloat(saturationAmount) / 100.0);
            
            // Add image-specific resolution parameters
            if (imageData.targetWidth && imageData.targetWidth !== imageData.originalWidth) {
                formData.append('target_width', imageData.targetWidth);
            }
            if (imageData.targetHeight && imageData.targetHeight !== imageData.originalHeight) {
                formData.append('target_height', imageData.targetHeight);
            }
            formData.append('keep_ratio', imageData.keepRatio ? '1' : '0');

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    successCount++;
                    results.push({
                        success: true,
                        imageName: imageData.name,
                        result: result
                    });
                } else {
                    errorCount++;
                    results.push({
                        success: false,
                        imageName: imageData.name,
                        error: result.error
                    });
                }
            } catch (error) {
                errorCount++;
                results.push({
                    success: false,
                    imageName: imageData.name,
                    error: error.message
                });
            }

            processedCount++;
            
            // Update progress
            const progress = Math.round((processedCount / selectedImages.length) * 100);
            showProgress(progress);
        }

        // Show final results
        if (successCount > 0 && errorCount === 0) {
            showStatus(`All ${successCount} image(s) processed successfully!`, 'success');
        } else if (successCount > 0 && errorCount > 0) {
            showStatus(`${successCount} image(s) processed successfully, ${errorCount} failed.`, 'warning');
        } else {
            showStatus(`All ${errorCount} image(s) failed to process.`, 'error');
        }

        // Display all results in table format
        if (results.length > 0) {
            displayResults(results);
        }

        // Log detailed results
        console.log('Processing results:', results);

    } catch (error) {
        showStatus(`Processing error: ${error.message}`, 'error');
        console.error('Processing error:', error);
    } finally {
        document.getElementById('processBtn').disabled = false;
        setTimeout(() => {
            document.getElementById('statusSection').classList.add('hidden');
        }, 5000);
    }
}

// Display processing results in table format
function displayResults(results) {
    const resultsTableBody = document.getElementById('resultsTableBody');
    const resultsSubtitle = document.getElementById('resultsSubtitle');
    
    // Clear existing results
    resultsTableBody.innerHTML = '';
    
    // Count successful and failed results
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    // Update subtitle
    resultsSubtitle.textContent = `${successCount} of ${totalCount} images processed successfully. Click thumbnails to view full size.`;
    
    // Add each result to the table
    results.forEach((result, index) => {
        const row = document.createElement('tr');
        
        if (result.success) {
            const filename = result.result.processed_path.split(/[/\\]/).pop();
            const originalFilename = result.result.original_path.split(/[/\\]/).pop();
            
            row.innerHTML = `
                <td>
                    <div class="image-name" title="${result.imageName}">${result.imageName}</div>
                </td>
                <td>
                    <img src="/uploads/${originalFilename}" alt="Original ${result.imageName}"
                         class="result-thumbnail" onclick="openImageModal('/uploads/${originalFilename}', 'Original: ${result.imageName}')">
                </td>
                <td>
                    <img src="/uploads/${filename}" alt="Cell Shaded ${result.imageName}"
                         class="result-thumbnail" onclick="openImageModal('/uploads/${filename}', 'Cell Shaded: ${result.imageName}')">
                </td>
                <td>
                    <span class="status-success-indicator">✓ Success</span>
                </td>
                <td>
                    <button class="download-result-btn" onclick="downloadProcessedImage('${filename}', '${result.imageName}')">
                        Download
                    </button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>
                    <div class="image-name" title="${result.imageName}">${result.imageName}</div>
                </td>
                <td>-</td>
                <td>-</td>
                <td>
                    <span class="status-error-indicator">✗ Failed</span>
                    <div class="text-muted" style="font-size: 12px; margin-top: 2px;">${result.error}</div>
                </td>
                <td>
                    <button class="download-result-btn" disabled>
                        N/A
                    </button>
                </td>
            `;
        }
        
        resultsTableBody.appendChild(row);
    });
    
    // Show results section
    document.getElementById('resultsSection').classList.remove('hidden');
    
    // Scroll to results smoothly
    document.getElementById('resultsSection').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Open image in modal (simple implementation)
function openImageModal(imageSrc, title) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        cursor: pointer;
    `;
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        text-align: center;
    `;
    
    // Create title
    const titleElement = document.createElement('div');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        color: white;
        font-size: 18px;
        margin-bottom: 10px;
        font-weight: 500;
    `;
    
    // Create image
    const image = document.createElement('img');
    image.src = imageSrc;
    image.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    // Create close instruction
    const closeText = document.createElement('div');
    closeText.textContent = 'Click anywhere to close';
    closeText.style.cssText = `
        color: white;
        font-size: 14px;
        margin-top: 10px;
        opacity: 0.8;
    `;
    
    // Assemble modal
    imageContainer.appendChild(titleElement);
    imageContainer.appendChild(image);
    imageContainer.appendChild(closeText);
    modal.appendChild(imageContainer);
    
    // Add to page
    document.body.appendChild(modal);
    
    // Close on click
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Download processed image
function downloadProcessedImage(filename, originalName) {
    const link = document.createElement('a');
    link.href = `/uploads/${filename}`;
    link.download = `cellshaded_${originalName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showStatus('Download started!', 'success');
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
    // Clear selected images
    selectedFile = null;
    selectedImages = [];
    currentProcessedPath = null;
    imageIdCounter = 0;
    
    // Clear image table
    document.getElementById('imageTableBody').innerHTML = '';
    hideImagesSection();
    
    // Reset UI elements
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
    handleFileSelection,
    addImageToTable,
    removeImage,
    removeAllImages,
    updateImageWidth,
    updateImageHeight,
    toggleKeepRatio
};