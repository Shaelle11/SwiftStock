#!/bin/bash

# Production deployment script for Vercel
# This script runs database migrations and generates Prisma client

echo "🚀 Starting production deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations (only if DATABASE_URL is set and is PostgreSQL)
if [[ $DATABASE_URL == postgresql://* ]] || [[ $DATABASE_URL == postgres://* ]]; then
  echo "🗄️ Running database migrations..."
  npx prisma migrate deploy
else
  echo "⚠️ Skipping migrations - DATABASE_URL not set or not PostgreSQL"
fi

echo "✅ Deployment setup complete!"