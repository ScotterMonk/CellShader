# CellShader Flask Application Plan

**Short Plan Name:** 250820_cellshader_app  
**Autonomy Level:** High (all phases)  
**Primary Mode:** `/code` with `/artist` for frontend work

## Project Overview

Build a Flask web application that allows users to:
- Browse local folders and select image files (GIF, PNG, JPG)
- Configure cell-shading parameters (edge thickness, color levels, smoothing)
- Process images using OpenCV cell-shading algorithms
- Save processed images to automatic "\cell-shaded" subfolders
- View before/after results in web interface

## Phase 1: Foundation & Setup (Mode: `/code`)
**Tasks:**
1. Set up Flask application structure with basic routing and templates
2. Create requirements.txt with Flask and OpenCV dependencies
3. Implement basic project structure (templates, static folders)

**Acceptance Criteria:**
- Flask app runs without errors
- Basic routing structure in place
- All dependencies properly specified

## Phase 2: Core Image Processing (Mode: `/code`)
**Tasks:**
1. Create OpenCV cell-shading processing function with configurable parameters
2. Implement file upload handling and validation for GIF, PNG, JPG files
3. Add image processing workflow that creates "\cell-shaded" subfolder automatically
4. Add error handling for file processing and invalid inputs

**Acceptance Criteria:**
- Cell-shading algorithm works with adjustable parameters
- File validation prevents invalid uploads
- Processed images saved to correct subfolder structure
- Robust error handling for edge cases

## Phase 3: Web Interface Development (Mode: `/artist`)
**Tasks:**
1. Create HTML template for main interface with file browser and parameter controls
2. Build web interface controls for edge thickness, color levels, and smoothing amount
3. Implement folder browsing functionality for local directory selection
4. Add CSS styling for professional web interface appearance
5. Implement JavaScript for dynamic parameter adjustment and file selection
6. Create results display page showing original vs processed images

**Acceptance Criteria:**
- Professional, intuitive user interface
- Responsive parameter controls with real-time feedback
- Clear file browser functionality
- Before/after image comparison display

## Phase 4: Integration & Testing (Mode: `/tester`)
**Tasks:**
1. Test application with sample images and various parameter combinations
2. End-to-end workflow validation
3. Performance testing with different image sizes
4. Cross-browser compatibility testing

**Acceptance Criteria:**
- All workflows function correctly end-to-end
- No breaking errors with various image types and sizes
- Acceptable performance with typical image processing loads
- Works across major browsers

## Technical Specifications

### Cell-Shading Parameters:
- **Edge Thickness:** Slider control (1-10 range)
- **Color Levels:** Slider control (2-20 levels)  
- **Smoothing Amount:** Slider control (low/medium/high)

### File Support:
- Input formats: GIF, PNG, JPG
- Output format: Same as input
- Auto-creation of "\cell-shaded" subfolders

### Architecture:
- Flask backend with Jinja2 templates
- OpenCV for image processing
- JavaScript for dynamic UI interactions
- CSS for professional styling

## Dependencies:
- Flask
- OpenCV (cv2)
- NumPy
- Pillow
- Werkzeug

## Success Metrics:
- User can successfully browse and select local image files
- Cell-shading parameters are adjustable via web interface
- Images process correctly with visible cell-shading effects
- Processed images save to appropriate subfolders
- No crashes or errors during normal operation