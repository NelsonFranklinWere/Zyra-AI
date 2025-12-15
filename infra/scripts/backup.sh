#!/bin/bash
# Database backup script for Zyra
# Usage: ./backup.sh [backup_dir]

set -e

BACKUP_DIR=${1:-./backups}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME=${POSTGRES_DB:-zyra_db}
DB_USER=${POSTGRES_USER:-zyra_user}
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/zyra_backup_$TIMESTAMP.sql"

echo "🔄 Starting database backup..."
echo "   Database: $DB_NAME"
echo "   Output: $BACKUP_FILE"

# Perform backup
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  -F p \
  > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Backup completed successfully!"
echo "   File: $BACKUP_FILE"
echo "   Size: $BACKUP_SIZE"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "zyra_backup_*.sql.gz" -mtime +30 -delete

echo "🧹 Cleaned up backups older than 30 days"

