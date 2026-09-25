#!/bin/sh
set -e

echo "Pushing Prisma schema to database..."
./node_modules/.bin/prisma db push || npx prisma db push

echo "Starting Next.js server..."
exec "$@"
