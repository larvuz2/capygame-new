# Netlify Deployment Guide

This guide provides instructions for deploying the CapyGame to Netlify, with special attention to handling model files.

## Prerequisites

- A GitHub repository with your CapyGame code
- A Netlify account

## Deployment Steps

1. **Connect to GitHub**:
   - Log in to Netlify and click "New site from Git"
   - Choose GitHub and select your repository
   
2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   
3. **Environment Variables**:
   - No special environment variables are needed

4. **Deploy**:
   - Click "Deploy site"

## Verifying Models

After deployment, verify that your models are correctly deployed by checking:

```
https://your-site-name.netlify.app/models/character/character.glb
https://your-site-name.netlify.app/models/character/idle.glb
https://your-site-name.netlify.app/models/character/walk.glb
https://your-site-name.netlify.app/models/character/jump.glb
```

If any of these files return a 404 error, you may need to troubleshoot:

## Troubleshooting

1. **Check Build Logs**:
   - In Netlify dashboard, go to "Deploys" and view the most recent deploy
   - Look for any errors related to copying or processing GLB files

2. **Manual Upload**:
   - If automated deployment of models fails, you can manually upload them:
     - Go to Netlify dashboard → Site settings → Deploy contexts
     - Click "Deploys" → "Functions" → "Files"
     - Upload your GLB files to the `/models/character/` folder

3. **Redirects**:
   - Ensure your `_redirects` file is properly configured:
   ```
   /models/*  /models/:splat  200
   ```

4. **Headers**:
   - Make sure Netlify allows serving these files by adding to `netlify.toml`:
   ```
   [[headers]]
     for = "/models/*"
     [headers.values]
       Access-Control-Allow-Origin = "*"
   ```

## Important Notes

- The game uses a relative path structure with `./` for production builds
- GLB files must not be processed or inlined during build (controlled in vite.config.js)
- The public directory should be copied as-is to the dist directory during build

For more help, check the [Netlify Support Forums](https://answers.netlify.com/) or [Netlify Documentation](https://docs.netlify.com/).