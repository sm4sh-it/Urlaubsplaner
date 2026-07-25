#!/bin/sh
set -e

echo "Pushing Prisma schema to database..."
npx -y prisma db push

echo "Starting Next.js server..."
exec "$@"
