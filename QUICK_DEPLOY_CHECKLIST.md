# EdTech Platform - Quick Deployment Checklist

## 🚀 Ready to Deploy? Follow These Steps:

### Phase 1: Prepare Code (5 minutes)

- [ ] Check backend `package.json` has `"start": "node src/server.js"` ✅
- [ ] Check backend has `.gitignore` with `.env` ✅
- [ ] Check frontend `vite.config.js` exists ✅
- [ ] Run tests locally to ensure everything works

**Local Testing:**
```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
# Try registering and logging in
```

---

### Phase 2: Push to GitHub (5 minutes)

```bash
# In root directory
git init
git add .
git commit -m "EdTech Platform ready for deployment"
git branch -M main

# Create repo on GitHub then:
git remote add origin https://github.com/YOUR_USERNAME/edtech.git
git push -u origin main
```

✅ **Verify on GitHub:** Check your repo has all files

---

### Phase 3: Deploy Backend (10 minutes)

1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Find and select your GitHub repo
4. Configure:
   - **Name:** `edtech-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Instance Type:** Free
5. Click **"Advanced"** → Add Environment Variables:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   DATABASE_URL=postgresql://...   (your database URL)
   JWT_SECRET=                      (generate random string)
   OPENAI_API_KEY=sk-proj-...      (your OpenAI key)
   NODE_ENV=production
   PORT=5000
   ```
6. Click **"Deploy"** ⏳ (Waits 5-10 min)

✅ **Backend URL:** `https://edtech-backend.onrender.com`

---

### Phase 4: Deploy Frontend (5 minutes)

**Option A: Use Vercel (Recommended)**
1. Go to https://vercel.com → Sign up with GitHub
2. Click **"New Project"**
3. Import your `edtech` repo
4. Settings:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   ```
   VITE_API_BASE=https://edtech-backend.onrender.com
   ```
6. Click **"Deploy"** ⏳ (2-5 min)

✅ **Frontend URL:** `https://your-project-name.vercel.app`

**Option B: Deploy to Render**
1. In Render Dashboard: **"New +"** → **"Static Site"**
2. Select your repo
3. **Build Command:** `cd frontend && npm install && npm run build`
4. **Publish Directory:** `frontend/dist`
5. Add Environment Variable:
   ```
   VITE_API_BASE=https://edtech-backend.onrender.com
   ```

---

### Phase 5: Connect & Test (5 minutes)

1. Open your frontend URL from Vercel/Render
2. **Test Registration:**
   - Fill form and submit
   - Should see success message
3. **Test Login:**
   - Use your registered email/password
   - Should redirect to dashboard
4. If errors, check browser console and backend logs

---

## 🔑 Environment Variables Needed

### Backend (.env in Render)
```
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-long-random-string-here
OPENAI_API_KEY=sk-proj-your-api-key
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env in Vercel/Render)
```
VITE_API_BASE=https://your-backend-domain.com
```

---

## 📝 Notes

- **Free Tier Limitations:** Services may sleep after 15 min inactivity
- **Custom Domain:** Add later in Settings → Custom Domains
- **Logs:** Check in Render/Vercel dashboard for errors
- **Database:** Make sure it's accessible from the internet
- **Costs:** Start free, upgrade if needed

---

## ✅ Deployment Complete When...

✓ Frontend loads without errors  
✓ Can register a new account  
✓ Can login with registered account  
✓ Dashboard displays correctly  
✓ No CORS errors in console  

---

## 🆘 Need Help?

See `RENDER_DEPLOYMENT.md` for detailed troubleshooting

**Common Issues:**
- CORS Error? → Check `FRONTEND_URL` in backend env
- Can't login? → Check `VITE_API_BASE` in frontend env
- Database error? → Verify `DATABASE_URL` is correct
