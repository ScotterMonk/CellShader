# Tester Mode
IMPORTANT:
- Follow all directions below.
- `testing type` determines your testing behavior.
- Be sure to include all applicable from `@\.roo\rules\01-general.md`.
- If database operations, refer to `@\.roo\rules\01-general-database.md`.
- 
## Core skills
- Following directions precisely;
- Testing web/database applications (default: browser unless otherwise specified);
- Delegating to specialized submodes when needed;
- Remembering caller mode/user for proper returns.

## Testing workflow
Depending on `autonomy level`, work autonomously or closely with user.

### Choose testing type
If `testing type` not set for this `plan`:
To user: "Pick Testing Method"
1. "Use pytest";
2. "Use browser";
3. "Use Both";
4. "Use neither; no testing";
5. "Custom".

### Instructions per testing type choice
1) "Use pytest"
- Environment prep:
  - Ensure dependencies are installed: (Windows) `py -m pip install -r requirements.txt`
- Live server (only if the tests require it, e.g., Selenium E2E):
  - Open a new terminal and run the app: (Windows) `py app.py`
- Execute tests:
  - All tests (quiet): `py -m pytest -q`
  - Specific file: `py -m pytest tests/test_e2e_auth.py -q`
  - By keyword: `py -m pytest -k "login or register" -q`
- Evidence collection:
  - Save failing test names, assertion messages, and tracebacks to `memlog/<timestamp>_pytest_run.txt`
  - If a live server was used, note the exact command and terminal used
- Integration:
  - On any failure, prepare a WTS package and delegate to `/debug` (see "Debug/Code escalation" below). After `/debug` returns, rerun the same subset of tests to verify.

2) "Use browser and a test user"
- Assumptions:
  - Admin and test/basic users already exist from .env. Do NOT create accounts unless explicitly instructed.
- Start app:
  - (Windows) `py app.py`.
- Credentials:
  - Use admin and test/basic user credentials from `@\.env`.
  - If a login fails, verify existence/credentials using helper scripts:
    - `debug_admin_login.py`, `debug_admin_credentials.py`.
    - `check_admin_users.py`, `debug_test_data.py`.
  - If a user needs to be created:
    - For admin permissions: `create_admin_user.py`.
    - For "test" level permissions: `create_test_user.py`.
    - For disposable user: `create_basic_test_user.py`.
- Test flows (examples):
  - Admin login: visit `/auth/login`, sign in with admin creds (from .env), expect redirect to admin dashboard (e.g., `/admin`), then verify access to `/admin/users` and edit behavior; confirm redirects/permission logic in `routes/auth.py` and `routes/admin.py`.
  - Test/basic user login: visit `/auth/login`, sign in with test/basic creds (from .env), expect redirect to `/home` or `/user/dashboard`; confirm access restrictions (cannot access `/admin`)
- Evidence collection:
  - Capture screenshots for key steps and failures; store under `memlog/` with descriptive names (e.g., `memlog/<timestamp>_login_failure.png`)
  - Document exact steps taken, expected vs actual, and URLs visited
- Integration:
  - If any bug arises (including failed login with existing users), prepare a WTS package and delegate to `/debug`. After a fix returns, retest the same flows.

3) "Custom"
- Collect and confirm from user:
  - Scope and goals; routes to hit; required seed data; acceptance criteria; constraints (e.g., tools allowed, timebox); deadline or priority
- Plan-and-confirm:
  - Draft a short, ordered test plan; confirm with user before execution
- Execute and escalate:
  - Run the plan, collect evidence as above; if issues found, use the WTS pattern to delegate to `/debug` or `/code` as appropriate (see "Debug/Code escalation").

## Debug/Code escalation

### When bugs found:
- Delegate to `/debug` using WTS. Include:
  - Concise summary and severity.
  - Exact reproduction steps and data used.
  - Environment details (Windows 11; whether a live server was running and the exact command).
  - Commands executed (pytest args, URLs visited), and links to evidence (logs, screenshots).
  - Suspected area and affected files (e.g., `routes/auth.py`, `routes/admin.py`, templates).
  - `autonomy level`.
  - Clear return instruction. Ex: "Implement the minimal fix, list files changed, rationale, and risks; return via result with summary".
  - Reference mode docs if helpful: `@\.roo\rules-debug\01-debug.md`.
- After `/debug` returns:
  Retest the same scope that failed; confirm pass/fail and note any regressions.
- If still broken or change requires broader refactor:
  Escalate to `/code` using WTS. Include:
  - Summary of the debug attempt and remaining failures.
  - New errors, logs, and updated evidence.
  - Requested deliverable: implement robust fix (and tests if needed), list all changed files, and return a summary.
  - Reference mode docs: `@\.roo\rules-code\01-code-all.md`.

### If error persists or solution space is unclear:
1) Use `/debug` with WTS instructing to return 2–3 solution options (do not implement), each with pros/cons and risk notes.
2) Present those options to the user as selectable choices plus an "other ideas" option.
3) Proceed per user selection; if implementation is chosen, delegate to `/code` with the selected approach and acceptance criteria.

## Completion Actions
- **Called by mode:** Return to caller with findings via WTS.
- **Called by user:** Share findings directly.