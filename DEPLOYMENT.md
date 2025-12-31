# Deployment Guide for SwiftStock

## Quick Fix for Current Error

**Error**: `Environment variable not found: DATABASE_URL`

### Immediate Solution:
1. **Go to Vercel Dashboard** → Your SwiftStock project
2. **Settings** → **Environment Variables** 
3. **Add these variables:**

```
DATABASE_URL=postgresql://your-connection-string
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-also-long-and-random
```

4. **Redeploy** from Deployments tab

## Database Setup Options

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create Database" → "Postgres"
4. Copy the connection string provided
5. Add it as `DATABASE_URL` in Environment Variables

### Option B: Supabase (Free)
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Add as `DATABASE_URL` in Vercel Environment Variables

### Option C: Neon (Free)
1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy the connection string from dashboard
4. Add as `DATABASE_URL` in Vercel Environment Variables

## Common Build Errors

1. **"Failed to collect page data for /api/auth/login"**
   - This usually happens when environment variables are missing during build
   - Ensure `DATABASE_URL` and `JWT_SECRET` are set in Vercel environment variables

2. **Prisma Client Generation Issues**
   - Run `prisma generate` before building
   - This is handled automatically in the `vercel-build` script

### Environment Variables Required

Set these in your Vercel dashboard:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret
```

### Build Commands

- Development: `npm run dev`
- Production build: `npm run build`
- Vercel build: `npm run vercel-build`
- Check deployment readiness: `npm run check-deployment`

### Troubleshooting Steps

1. Run the deployment check script locally:
   ```bash
   npm run check-deployment
   ```

2. Ensure all environment variables are set in Vercel

3. Try building locally first:
   ```bash
   npm run build
   ```

4. Check Vercel build logs for specific error messages

### Database Setup

Make sure your database is accessible from Vercel and that the connection string includes all necessary parameters including SSL if required.