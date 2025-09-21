# Vercel Deployment Guide

## Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Build your project locally first:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Click "New Project"
   - Import your Git repository

3. **Configure the project:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend` (since your React app is in the frontend folder)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - Project name: `carriya-frontend` (or your preferred name)
   - Directory: `./frontend`
   - Override settings? `N`

## Environment Variables (Optional)

If you need environment variables:

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add any required variables

2. **Common variables you might need:**
   ```
   REACT_APP_API_BASE_URL=https://your-api-domain.com
   REACT_APP_ENV=production
   ```

## Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

## Automatic Deployments

Once set up, Vercel will automatically:
- Deploy when you push to your main branch
- Create preview deployments for pull requests
- Provide you with a live URL

## Troubleshooting

### Build Issues
- Make sure all dependencies are in `package.json`
- Check that `npm run build` works locally
- Verify the build output directory is `build`

### Routing Issues
- The `vercel.json` file handles client-side routing
- All routes will redirect to `index.html` for React Router to handle

### Performance
- Vercel automatically optimizes your build
- Images and static assets are served from a CDN
- Consider using Vercel's Image Optimization for better performance

## Local Development vs Production

Your app will work the same way in production as it does locally:
- Cart functionality will persist in localStorage
- All routing will work correctly
- Responsive design will work on all devices

## Next Steps

1. Deploy your frontend
2. Set up a backend API (if needed)
3. Update environment variables to point to your API
4. Configure custom domain (optional)
5. Set up analytics and monitoring

## Support

- Vercel Documentation: https://vercel.com/docs
- React Deployment Guide: https://create-react-app.dev/docs/deployment/
