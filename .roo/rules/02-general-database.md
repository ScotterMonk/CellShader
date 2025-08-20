# Database 

ALWAYS use the live postgres database for testing and production (`PGDB`); never SQLite or any other database system. 

## Credentials
- Connection credentials: `@\.env`.
- Users' credentials: `@\.env`.

## Structure
- Schema File: `@\.roo\docs\database_schema.md`.
- DB Models: .
- `PGDB` is the primary source of truth. When there is any doubt about a column, see `PGDB`. If a column is needed or column name needs to change, always ask user for permission to make the add/change.
- Any time you make changes to `PGDB`:
	* log the date and change in `@\.roo\docs\pgdb_changes.md`.
	* update Schema File and appropriate DB_Models to reflect those changes.
