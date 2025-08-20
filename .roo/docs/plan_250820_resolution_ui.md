# Plan: Per-Image Resolution UI

## Summary
Implement per-image resolution input controls with keep-ratio functionality to replace the forced 1920x1080 downscale.

## Requirements
- Remove forced downscale in `apply_cell_shading()`.
- Add optional target_width, target_height, keep_ratio controls end-to-end.
- Default to original size when fields untouched.
- Allow upscaling up to 3840x2160.
- Keep ratio on by default; X edits auto-update Y.

## Implementation Plan

### Backend Changes
1. Remove legacy clamp in `apply_cell_shading()` lines 78-83.
2. Extend `upload_file()` to accept sizing params.
3. Implement keep-ratio logic and validation.
4. Update `apply_cell_shading()` signature for sizing params.
5. Include original_dims and final_dims in JSON response.

### Frontend Changes
1. Add Resolution UI in Controls section.
2. On file select, read intrinsic size and prefill fields.
3. Implement keep-ratio behavior and validation.
4. Submit sizing params in form data.
5. Optional CSS tweaks for alignment.

### Testing
- Manual browser tests for various scenarios.
- Verify 2240x1256 stays unchanged by default.

## Acceptance Criteria
- Default untouched: no automatic downscale occurs.
- Keep ratio on by default; editing Width auto-updates Height.
- Backend validates and allows upscaling up to 3840x2160.
- Response includes original_dims and final_dims.
- Proper interpolation: INTER_AREA for downscale, INTER_LANCZOS4 for upscale.