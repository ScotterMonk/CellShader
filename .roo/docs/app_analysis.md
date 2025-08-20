# CellShader Application — Technical Overview.
This document provides a concise, developer-focused description of the CellShader application: architecture, configuration, data flow, security, and core routes, with clickable references for quick navigation.

1) Purpose.
- Provide a local web UI to upload an image, apply a cell‑shading effect, preview results, and download the processed image.
- Offer tunable parameters for edge thickness, color levels, and smoothing to adjust the stylization quality.

2) Architecture Overview.
- Style: Single‑file Flask app with supporting templates and static assets, centered in `app.py`.
- No app factory or blueprints are used, and all routes live in `app.py`.
- Image processing is implemented with OpenCV and NumPy in `apply_cell_shading()`, with file I/O helpers in `save_processed_image()` and `create_cell_shaded_folder()`.
- Frontend is a single page template `templates/index.html` with logic in `static/js/main.js` and styles in `static/css/main.css`.
- Error pages reside in `templates/404.html` and `templates/500.html`.
- Logging uses Python’s standard logging configured at info level in `logging.basicConfig()`.

3) Runtime and Lifecycle.
- App initialization occurs at import time in `Flask()` and configuration is set immediately after in `app.config`.
- Upload directory creation runs at startup via `create_upload_folder()` when executing the module directly in the main block in `if __name__ == '__main__'`.
- Development server runs with debug enabled and listens on all interfaces at port 5000 in `app.run()`.

4) Configuration.
- Secret key for sessions: set to a development placeholder in `app.config['SECRET_KEY']`.
- Max upload size: 16 MB via `app.config['MAX_CONTENT_LENGTH']`.
- Upload root: relative `uploads` directory via `app.config['UPLOAD_FOLDER']`.
- Allowed extensions: `png`, `jpg`, `jpeg`, `gif`, `bmp`, `tiff` defined near `ALLOWED_EXTENSIONS`.

5) Dependencies.
- Flask 2.3.3 for the web framework as listed in `requirements.txt`.
- OpenCV 4.8.1.78 for image processing as listed in `requirements.txt`.
- NumPy 1.24.3 as listed in `requirements.txt`.
- Pillow 10.0.1 is present but not used by current logic as listed in `requirements.txt`.
- Werkzeug 2.3.7 as an explicit dependency as listed in `requirements.txt`.

6) Routes and HTTP APIs.
- GET / handled by `index()`: returns the main page `templates/index.html`.
- POST /upload handled by `upload_file()`: accepts `multipart/form-data` with fields `file`, `edge_thickness`, `color_levels`, and `smoothing_amount`, validates the upload in `allowed_file()` and parameter ranges in `upload_file()`, saves the original file with a timestamped name using `secure_filename()`, processes via `apply_cell_shading()`, writes the result in `save_processed_image()`, and returns JSON payload with `success`, `message`, `original_path`, `processed_path`, and `parameters` in `upload_file()`.
- GET /uploads/<filename> handled by `uploaded_file()`: serves the original or processed image from `uploads/` or `uploads/cell-shaded/` and returns JSON 404 if not found in `uploaded_file()`.
- GET /health handled by `health_check()`: returns a JSON health status including `version`.
- Error handlers: 404 via `not_found_error()` returns `templates/404.html`, 500 via `internal_error()` returns `templates/500.html`, and 413 via `file_too_large()` returns a JSON error for oversized uploads.

7) Image Processing Pipeline.
- Input read and sanity check: OpenCV reads the image in `cv2.imread()` and raises if `None` in `apply_cell_shading()`.
- Optional resize for large images: scales to fit within 1920x1080 in `apply_cell_shading()`.
- Edge‑preserving smoothing: bilateral filter using the `smoothing_amount` parameter in `cv2.bilateralFilter()`.
- Edge mask extraction: grayscale, median blur, adaptive threshold using `edge_thickness` as both block size and constant in `cv2.adaptiveThreshold()`.
- Color quantization: K‑means to `color_levels` clusters with OpenCV criteria in `cv2.kmeans()`.
- Composite cartoon effect: combine quantized image with edge mask using `cv2.bitwise_and()`.
- Output persistence: generate timestamped filename and save via `save_processed_image()` and `cv2.imwrite()`.

8) Frontend Overview.
- Template: main UI in `templates/index.html` referencing `static/css/main.css` at `templates/index.html` and `static/js/main.js` at `templates/index.html`.
- Core interactions in JavaScript: real‑time slider updates in `initializeSliders()`, drag‑and‑drop and file input handling in `initializeFileUpload()` and `handleFileSelection()`, POST processing workflow in `processImage()`, results rendering in `displayResults()`, downloading in `downloadImage()`, and user feedback via `showStatus()` and `showProgress()`.
- Directory browsing UI is a placeholder that shows mock data and informs users that backend support is required in `browseDirectory()` and `showMockFileList()`.

9) Files and Directories.
- Application module at `app.py`.
- Templates at `templates/index.html`, `templates/404.html`, and `templates/500.html`.
- Static assets at `static/js/main.js` and `static/css/main.css`.
- Upload storage at `uploads/` with processed images written under `uploads/cell-shaded/` created via `create_cell_shaded_folder()`.

10) Security Considerations.
- Input limits and validation: server enforces a 16 MB maximum in `MAX_CONTENT_LENGTH` and filters by file extension in `allowed_file()`, while the frontend also validates MIME types in `isValidImageFile()`.
- Filenames: uploaded names are sanitized using `secure_filename()` and a timestamp prefix reduces collisions.
- Secrets and debug: a development secret key is hardcoded in `app.config['SECRET_KEY']` and debug mode is enabled in `app.run()`, both of which must be changed for production.
- Information exposure: JSON responses include absolute or relative file system paths in `original_path` and `processed_path` in `upload_file()`, which may be sensitive in some deployments.
- Authentication and authorization: none are implemented, so all endpoints are publicly accessible.
- CSRF protection: not present because the app relies on simple form POSTs without session‑bound forms or tokens.

11) Observability and Error Handling.
- Logging: configured globally at info level in `logging.basicConfig()` and used consistently in processing and file operations.
- Structured responses on failures: upload exceptions return JSON with `success: False` in `upload_file()` and oversized uploads return a 413 JSON in `file_too_large()`.
- User‑friendly error pages: 404 and 500 render dedicated templates in `not_found_error()` and `internal_error()`.

12) Running and Deployment.
- Local development: ensure dependencies are installed from `requirements.txt` and run the server with `python app.py`, which calls `create_upload_folder()` and `app.run()`.
- Production readiness checklist: set a strong secret key, disable debug, place behind a production WSGI server, constrain upload directory permissions, and consider serving static files via a web server or CDN.

13) Limitations and Future Enhancements.
- No persistent database, user accounts, or job tracking exist in this version.
- Image processing runs synchronously during the request, which can tie up a worker for large images.
- Parameter semantics in adaptive thresholding use `edge_thickness` for multiple roles and may merit refinement for better control.
- Consider adding progress reporting from the backend, antivirus or content scanning, image metadata stripping, and configurable output formats.

14) Primary Code References.
- App setup and config in `Flask()` and `app.config`.
- Upload validation in `allowed_file()`.
- Processing entrypoint in `upload_file()`.
- Cell‑shading implementation in `apply_cell_shading()`.
- Output persistence in `save_processed_image()`.
- Static client logic in `static/js/main.js`.
- Main template in `templates/index.html`.
