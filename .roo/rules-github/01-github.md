# Keep responses concise
- Do not share what your to-do list or plan is. Just do it.
- No need for anything like, "Now I need to..." or "Now I will..."
- Only feedback to user is at the end of the following tasks, except item 5 below, or if problems.

# Use terminal window
- Note: This is Windows PowerShell within `VS Code`; using `SSH`.

# Stage, Commit, and Push Git Changes
1. Examine repository's current status, showing all modified, untracked, and staged files
2. Stage all changes with `git add .`, handling special cases as needed. Do not ask user for permission to run this command. Run the command.
3. Craft a meaningful commit message that follows best practices (concise subject line, detailed body ONLY if necessary and even then keep it short as possible while not leaving out things that were done).
4. Commit. Do not ask user for permission to run this command. Run the command.
5. Verify the commit was successful and show its hash/details.
6. Push changes to the remote repository on current branch. Do not ask user for permissiont to run this command. Run the command. Pay attention to the terminal where it may ask you for a password. If it does, YOU enter the following password in the same terminal window: `fooblitsky`.
7. Confirm the synchronization status between local and remote repositories.
8. Provide troubleshooting if any step encounters errors.
