# EdTech Platform - Render Deployment Guide

## ✅ Deployment Checklist

### Step 1: Prepare Your GitHub Repository

Before deploying to Render, your code must be on GitHub.

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial EdTech Platform commit"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/edtech.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important Files to Verify:**
- ✅ `backend/package.json` (with all dependencies)
- ✅ `backend/src/server.js` (main entry point)
- ✅ `frontend/package.json`
- ✅ `frontend/vite.config.js`
- ✅ `.gitignore` (includes `.env`, `node_modules`)

---

## Step 2: Prepare Environment Variables

### Backend Environment Variables (.env)

```
PORT=5000
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-proj-your-api-key
FRONTEND_URL=https://edtech-frontend.onrender.com
NODE_ENV=production
```

**To generate JWT_SECRET:**
```bash
# On Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([guid]::NewGuid()))

# Or use this online: https://generate-random.org/base64
```

### Frontend Environment Variables (.env)

```
VITE_API_BASE=https://edtech-backend.onrender.com
```

---

## Step 3: Deploy Backend to Render

### Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize GitHub access

### Deploy Backend Service

1. **Click "New +"** → Select **"Web Service"**
2. **Connect GitHub repository**
   - Choose your EdTech repo
   - Authorize if needed
3. **Configure Service:**
   - **Name:** `edtech-backend` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free (or Starter for production)
4. **Add Environment Variables:**
   - Click "Advanced" → "Add Environment Variable"
   - Add each variable:
     - `PORT=5000`
     - `DATABASE_URL=your-postgresql-url`
     - `JWT_SECRET=your-generated-secret`
     - `OPENAI_API_KEY=your-openai-key`
     - `FRONTEND_URL=https://edtech-frontend.onrender.com`
     - `NODE_ENV=production`
5. **Click "Deploy"**

⏳ **Wait 5-10 minutes for deployment to complete**

Once deployed, you'll get a URL like: `https://edtech-backend.onrender.com`

---

## Step 4: Deploy Frontend to Render (or Vercel)

### Option A: Deploy Frontend to Render

1. **In your main repo, add a `render.yaml`:**

```yaml
services:
  - type: web
    name: edtech-frontend
    env: static-site
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    envVars:
      - key: VITE_API_BASE
        value: https://edtech-backend.onrender.com
```

2. **In Render Dashboard:**
   - Click "New +" → Select **"Static Site"**
   - Connect your GitHub repo
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Add Environment Variable:**
     - `VITE_API_BASE=https://edtech-backend.onrender.com`
   - Click "Deploy"

⏳ **Frontend deployment takes 2-5 minutes**

### Option B: Deploy Frontend to Vercel (Recommended)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your EdTech repo
5. **Framework Preset:** Vite
6. **Root Directory:** `frontend`
7. **Build Command:** `npm run build`
8. **Output Directory:** `dist`
9. **Environment Variable:**
   - `VITE_API_BASE=https://edtech-backend.onrender.com`
10. Click "Deploy"

---

## Step 5: Update Configuration

### Update Frontend API URL

After deployment, update your frontend `.env`:

```
VITE_API_BASE=https://edtech-backend.onrender.com
```

Then redeploy the frontend.

### Update Backend CORS

In `backend/src/server.js`, ensure CORS is properly configured:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
```

---

## Step 6: Test Your Deployment

1. **Open Frontend URL** (e.g., https://edtech-frontend.onrender.com)
2. **Try to Register**
   - Should connect to backend
   - Data saves to database
3. **Try to Login**
   - Should authenticate
   - Should redirect to dashboard
4. **Check browser console** for any errors

---

## Step 7: Custom Domain (Optional)

### Add Custom Domain to Render

1. Go to your Render service
2. Settings → **Custom Domains**
3. Add your domain (e.g., `edtech.com`)
4. Render provides DNS records to add to your domain provider
5. Wait for DNS to propagate (5-48 hours)

---

## 🚨 Important Security Notes

1. **Never commit `.env` files to GitHub**
   - Already in `.gitignore`
   - Set env vars in Render dashboard instead

2. **Rotate secrets regularly**
   - Change `JWT_SECRET` quarterly
   - Regenerate API keys annually

3. **Monitor Logs**
   - Render Dashboard → Logs tab
   - Check for errors daily initially

4. **Database Backups**
   - If using Supabase: automated backups enabled
   - If using other services: set up backups

---

## 📊 Estimated Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| Render Backend | Available | $7-20/month |
| Vercel Frontend | Available | Free |
| PostgreSQL | Included in your DB service | Varies |
| OpenAI API | Pay as you go | ~$5-50/month |
| **Total** | **~$0-70/month** | - |

---

## ❌ Common Issues & Solutions

### "Cannot POST /auth/login" 
- **Fix:** Check `FRONTEND_URL` in backend .env matches frontend domain

### "CORS error when logging in"
- **Fix:** Verify `FRONTEND_URL` is correct in backend env vars

### "Database connection failed"
- **Fix:** Verify `DATABASE_URL` is correct and IP is whitelisted

### "Cannot find module 'express'"
- **Fix:** Make sure `npm install` runs in build command (backend)

### "Vite build fails"
- **Fix:** Check `VITE_API_BASE` is set in frontend env vars

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Render
3. ✅ Deploy frontend to Vercel/Render
4. ✅ Fix any CORS/API issues
5. ✅ Test in production
6. ✅ Get custom domain (optional)
7. ✅ Monitor logs daily

**Deployment should take 15-30 minutes total!**
