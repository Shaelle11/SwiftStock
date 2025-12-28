# Deployment Troubleshooting Guide

## Vercel Deployment Issues

### Common Build Errors

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