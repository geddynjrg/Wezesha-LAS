# Database backups

SQL dumps for the Majuu applicant portal database (`majuu_portal`).

Restore example:

```bash
docker exec -i majuu-portal-db mariadb -u majuu_portal -p majuu_portal majuu_portal < backups/majuu_portal_YYYYMMDD.sql
```
