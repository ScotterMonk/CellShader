# Artist Mode
IMPORTANT:
- Follow all directions below.
- Be sure to use all applicable from `@\.roo\rules\01-general.md`.
- If database operations, refer to `@\.roo\rules\01-general-database.md`.

## Development Workflow

Follow `Workflow` from `@\.roo\rules\01-general.md`.

## Front-end principles & coding preferences

### CSS Frameworks
This project is not using Tailwind or Bootstrap.

### CSS files
- Use only one CSS file unless absolutely necessary to have more: `@/static/css/main.css`. If it seems there is a need for more, ask user.
- Keep comments in CSS to a minimum.
- Keep decorative `/* ===== */ [CR] /* Name of section */ [CR] /* ===== */` to one row; `/* Name of section */`.
- Separation of Concerns: Avoid inline CSS; prefer using our CSS file, separating content (HTML), presentation (CSS), and behavior (JavaScript).

### Design System Consistency & Separation of concerns
Emphasize creating/keeping to a unified and reusable set of design and coding standards across the application (admin side and user side). Promote reusable components and patterns to maintain visual and functional consistency.

### Consistent spacing and rhythm
Ensure consistent vertical and horizontal rhythm throughout the application's forms by standardizing spacing through the use of CSS classes and CSS variables found in `@/static/css/main.css`. Before using a class on a page, ensure that class exists in our CSS file. If it does not, use a class that similar already-built pages use.

### Jinja and HTML
When editing Jinja templates, set VS Code Language Mode to jinja-html.

### Examples

#### Form input spacing
- Horizontal padding for text inputs: Ensure padding of input boxes is at least a few pixels on left and right, but not much on top and bottom.
- Ensure top and bottom margins of all elements is minimal.
- Keep form labels vertically close from the form input box they are paired with.
- Pack sets of parameters into as many classes as possible, like so:
```css
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

### Project Preferences

#### Curved Corners
Default to curved corners (border-radius) on all objects. If in doubt, check other already-built pages and follow their layout.

#### Cards, forms, and form groups
Prefer simple with compact spacing.
- Forms that move around when they get user focus can be unnerving; keep them still. Maybe change border color from something faint to something more visible as a subtle indication of focus.
- For forms with many objects/controls, ask user if they would like sections of objects hide-able/expose-able via buttons, to increase how compact the overall form is.

#### Checkbox and radio control label spacing
- For all checkboxes and radio button controls: Ensure spacing between control (checkbox or radio button) and their labels is consistent and the following width: 4px, preferably accomplished using CSS variables in the CSS file.

#### Buttons
As with the other objects, keep buttons simple.
- No need for borders.
- Upon hover, change background colors. Keep caption white.
- Notice and follow this practice: there are 3 kinds of buttons: `nav-link` (used only in navigation (`templates/layout.html`)), `btn` (default; most buttons in app), and `btn-submit` (for form submissions).

#### Accessibility
For now, we're favoring simplicity over accessibility.
- No ARIA-related features.
- Yes to simple and highly-compatible accessibility.

#### Movement
Keep movement to a minimum. If a transition or animation seems necessary, propose the idea to the user.

## Development workflow
1) During front-end changes: Use `style conventions` and leverage existing patterns found via `codebase_search`. Ensure templates open in jinja-html mode. Prefer reusing classes from `static/css/main.css`.
2) Integration: Use `codebase_search` to identify potentially affected templates, CSS, and JS. Keep global changes small and deliberate.
3) If `autonomy level` is `low` or `med`: Call tester mode with `message` parameter for verification when needed.
4) Don't assume changes work until tested.
5) Save any `useful discoveries`.
6) Check VS Code Problems panel after all changes.

### If stuck in loop
1) Try 1 completely different approach.
2) Check `useful discoveries` for potential solution.
3) If `autonomy level` is "med" or "high": Try 1 more novel solution.
4) If `autonomy level` is "high": Try 1 more novel solution.
5) If still in loop:
    - Come up with 2 new completely different approach ideas + "Abandon this task and return to `plan` flow."
    - Show these to user to get direction.
6) If you solve the problem, add to `useful discoveries` file.

## After completion of code changes
Until user has confirmed they have tested, do not assume your changes were tested and working.
- After every set of code changes has completed, check the "Problems" area at the bottom of VS Code and fix any issues shown there.
Lean strongly toward testing:
- If in doubt, ask user if they want you to run tests.
- Otherwise: Call tester mode, using `message` parameter with instructions a tester would need in order to verify your fix, requesting it reply when done with appropriate `result` parameter, providing a concise yet thorough summary of the outcome.