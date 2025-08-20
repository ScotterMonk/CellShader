# Styling Principles

## Terminology
On the front end, objects are synonymous with controls.

## Frameworks
This project is not using Tailwind or Bootstrap.

## Number of CSS files
Use only one .css file unless absolutely necessary to have more. If it seems there is a need for more, ask user.

## Design System Consistency & Separation of concerns
Emphasize creating/keeping to a unified and reusable set of design and coding standards across the application (admin side and user side). Promote reusable components and patterns to maintain visual and functional consistency.

### Consistent spacing and rhythm
Ensure consistent (same on every page) vertical and horizontal rhythm throughout the application's forms by standardizing spacing through the use of CSS classes and CSS variables found in @\static\main.css (CSS File). Before using a class on a page, ensure that class exists in our CSS File. If it does not, use a class that similar already-built pages use.

### Separation of Concerns
Avoid inline CSS, preferring use of our CSS File, embracing the principle of separating content (HTML), presentation (CSS), and behavior (JavaScript). This improves maintainability, scalability, and readability of the codebase.

### Examples

#### Form input spacing
- Horizontal padding for text inputs: Ensure padding of input boxes is at least a few pixels on left and right, but not much on top and bottom.
- Ensure top and bottom margins of all elements is minimal.
- Keep form labels vertically close from the form input box they are paired with.
- Pack sets of parameters into as many classes as possible, like so:
``` css
.form-input, input.form-input, select.form-input, textarea.form-input {
    background-color: var(--color-background);
    padding-left: var(--spacing-1);
    padding-right: var(--spacing-1);
    padding-top: var(--spacing-0);
    padding-bottom: var(--spacing-0);
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    border-radius: var(--border-radius-lg);
    margin-top: var(--spacing-1);
    margin-bottom: var(--spacing-1);
    border: 1px solid var(--color-border-faint);
    box-shadow: none;
    width: 100%;
}
```

#### Curved Corners
Default to curved corners (border-radius) on all objects. If in doubt, check other already-built pages and follow their layout.

#### Cards, forms, and form groups
Prefer simple with compact spacing.
- Forms that move around when they get user focus can be unnerving; keep them still. Maybe change border color from something faint to something more visible as a subtle indication of focus.
- For forms with many objects/controls, ask user if they would like sections of objects hide-able/expose-able via buttons, to incrase how compact the overall form is.

#### Checkbox and radio control label spacing
- For all checkboxes and radio button controls: Ensure spacing between control (checkbox or radio button) and their labels is consistent and the following width: 4px, preferably accomplished using css variables in the main.css file.

#### Buttons
As with the other objects, keep buttons simple.
- No need for borders.
- Upon hover, change background colors. Keep caption white.
- Notice and follow this practice: there are 3 kinds of buttons: nav-link (used only in navigation (layout.html)), btn (default; most buttons in app), and btn-submit (for form submissions). 

# Accessibility
For now, we're favoring simplicity over accessibility.
- No ARIA-related features.
- Yes to simple and highly-compatible accessibility.

# Movement
No transitions.