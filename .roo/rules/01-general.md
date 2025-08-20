# ALL MODES - IMPORTANT

## Environment & Commands
- Windows 11 environment: Use PowerShell/Windows commands, never Linux commands.
- Numbered instructions: Execute in order when marked 1), 2), etc.
- Global commands:
  - "git update" → Switch to `/github` mode.
  - "run", "run app", "turn on app", "server on", "turn on server" → Run `python app.py`.

## Application Context

## Resources
- App knowledge: `@\.roo\docs\app_analysis.md`.
- Codebase navigation: `codebase_search`, `read_file`, `search_files`.
- Patterns: Always use `codebase_search` before creating new code/files.
- Web: Only use Roo's built-in browser tool, clear cache first.
- Login credentials: `@\.env`.
- Discoveries: `@\.roo\docs\useful.md` (create if needed).
- Database: `@\.roo\rules\02-general-database.md`.

## Workflow
1) Setup & Planning
- `autonomy level`: If not established for current `plan`, ask user: "low" (frequent direction), "med", "high" (rare direction).
- `testing type`: Separate from autonomy ask. If not established for current `plan`, ask user: "Use pytest", "Use browser", "Use neither; no testing", "Use both", "Custom".
- Task origin: Determine if assigned by another mode or user-initiated.
- Plan tracking: Create/update plan files:
  - `short plan name`: yymmdd_two_word_description.
  - `plan file`: `@\.roo\docs\plan_[short plan name].md`.
  - `log file`: `@\.roo\docs\plan_log_[short plan name].md`.
  - `completed plans`: `@\.roo\docs\plans_completed`.

1) Pre-Work
- Checkpoint: Create before any changes.
- Context research: Use Resources to understand existing code patterns. Be thorough when gathering information. Make sure you have the full picture before continuing.
- Backup: Copy files to `@\.roo\docs\old_versions` before editing.

1) Implement
- Pattern consistency: Use `codebase_search` to find existing patterns.
- Dependencies: Identify integration points via `codebase_search`.
- Checkpoints: Create liberally for all tasks, subtasks, and file operations.
- Autonomy-based pauses: 
  - Low: Pause after task sets for manual testing/backup opportunities.

1) Quality Assurance
- VS Code Problems: Check and resolve after all changes.
- Impact analysis: Use `codebase_search` to identify affected areas.
- Testing: Call `/tester` mode when needed (don't assume changes work).
- Document: Save discoveries to `useful.md`.

1) Completion
- Review: Open `log file` and `plan file`, declare tentatively complete.
- User confirmation: Wait for user satisfaction.
- Archive: Move completed plan/log files to `plans_completed` (append "_[iteration]" if collision).

## Logging Format
Log entries: `date + time; action summary` (semicolon separated).
- Example: `"2025-08-14 07:23; Plan approved to begin"`.
- Example: `"2025-08-14 07:23; Task completed: Added function update_query() to utils_sql.py, refactored utils_sql.py, junk_n_trunk.py"`.

## Mode Communication
When delegating via `message` parameter:
1. Relevant bug/issue details.
2. Implementation instructions.
3. Return command when complete.
4. Reply requirement via `result` parameter with outcome summary.

## Standards
- Communication: Be brief unless detail requested; don't echo user requests.
- Indentation: Use 4 spaces everywhere (including CSS files).
- Flask templates: Set VS Code Language Mode to `jinja-html` for Flask/Jinja2 pages.
- With markdown:
    - Use back-ticks liberally, brackets rarely, line numbers never, and resist redundancy as you see here:
        [`app.py`](app.py) --> `app.py`.
        [`@\.env`](.env) --> `@\.env`.
        [`apply_a()`](app.py:54) --> `apply_a()`.
    - With numbered subheadings:
        "### 1) Setup" --> "1) Setup"
    - No double-asterisks:
        "**Impact**:" --> "Impact:"
    - Be sure there is a period at the end of every line.

## Code Style Conventions
- Use snake_case for functions, variables, and database tables & columns.
- Use PascalCase for class names.
- Keep vertical spacing compact.
- Use multi-line strings for complex SQL queries.
- Prioritize readable code over compact syntax.
- Simple solutions.
- Preserve existing comments unless code changes.
- Comment liberally.
- For comments and markdown, always put a period at the end of every line, including bullet points.