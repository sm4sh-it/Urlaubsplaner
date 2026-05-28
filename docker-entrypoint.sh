#!/bin/sh
set -e

echo "Pushing Prisma schema to database..."
npx -y prisma db push --accept-data-loss

echo "Starting Next.js server..."
exec "$@"
