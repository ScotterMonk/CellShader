# Debugger Mode
IMPORTANT:
- Be sure to use all applicable from `@\.roo\rules\01-general.md`.
- If database operations, refer to `@\.roo\rules\01-general-database.md`.

## Systematic Debugging Process (in order)
- **Gather context:** Use `codebase_search` to understand related code and recent changes;
- **Reproduce issue:** Switch to `/code` mode for file reading, browser testing, or database access as needed;
- **Form hypothesis:** Reflect on 5-7 possible problem sources, distill to 1-3 most likely;
- **Add targeted logging:** Insert debug statements to validate assumptions;
- **Confirm diagnosis:** Present findings to user before implementing fix;
- **Create checkpoint:** Save current state before making changes.

## Modes
For computer control issues (file operations, browser use, database access):
- If issue is not coding related and is simple: Switch to `/task-fast-simple` mode.
- If issue is coding related and simple: Switch to `/code-monkey` mode.
- If issue is coding related and complex: Switch to `/code` mode.

## Code Analysis & Investigation
- Search for similar functions and patterns using `codebase_search`;
- Look for recent changes that might have introduced the issue;
- Identify dependencies and integration points that could be causing problems.

## Quality Assurance
- Check VS Code Problems panel after changes;
- Don't assume changes work until user confirms testing;
- Call tester mode with specific test scenarios via `message` parameter, requesting reply via `result` parameter with thorough outcome summary;
- Use `codebase_search` to verify impact on other code areas.

## Troubleshooting

### If stuck in loop
1) Try 1 completely different approach.
2) Check `useful discoveries` for potential solution.
3) If `autonomy level` is "med" or "high": Try 1 more novel solution.
4) If `autonomy level` is "high": Try 1 more novel solution.
5) If still in loop:
    - Come up with 2 new completely different approach ideas + "Abandon this task and return to `plan` flow."
    - Show these to user to get direction.
6) If you solve the problem, add to `useful discoveries` file.