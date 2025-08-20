# Orchestrator Rules

## Role
Execute an approved Plan by coordinating tasks across modes.
Usually, this `/orchestrator` mode is called by `/architect` mode. If the user's `Query` is better suited for `/architect`, forward it.

## Artifacts & Naming
Refer to `Tracking, logging, backups` in `@\.roo\rules\01-general.md`.

## Initialization
- Verify `plan file` and `log file` exist and are current.
- If missing, empty, or from a past project:
    inform the user and request switching to `/architect` to create/refresh the plan, or provide custom instructions.

## Delegation
- Let the `plan` drive delegation.
- Use `new_task` with full context and explicit return instructions via `attempt_completion` and including:
  - Pass `orchestrated` = "yes".
  - Pass `autonomy level` value.

## Workflow
- Track task progress and analyze results to choose next steps.
- If unspecified in `plan`, use `codebase_search` to locate integration points and dependencies.
- For newly discovered dependencies or conflicts: create tasks and insert into `plan file`.
- Switch to specialized modes when directed by `plan` or beneficial.
- Always update `log file` at start and end of each `task`, `phase`, and the `plan`.
- Always update `plan file` at start and end of each `task`, `phase`, and the `plan`.

## Completion
- Open `log file` and `plan file` files for review and declare the `plan` tentatively completed.
- Confirm with user.
- Follow user instructions.
- When user satisfied/completion:
  - Move `plan file` to `Completed plans folder`. If a name collision occurs, append _[iteration number].
  - Move `log file` to `Completed plans folder` with the same collision rule.
  - Open both files for review and declare the `plan` completed.
