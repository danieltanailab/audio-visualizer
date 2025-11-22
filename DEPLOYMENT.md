# Audio Visualizer - Deployment Guide

## 🚀 FREE Deployment (Vercel + Render)

### Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com
- Render account (free): https://render.com

---

## Step 1: Push Code to GitHub

```bash
cd /Users/tanyungsin/.gemini/antigravity/scratch/audio-visualizer
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Click **Deploy**

✅ Your frontend will be live at: `https://your-app.vercel.app`

---

## Step 3: Deploy Backend to Render

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. **Name**: `audio-visualizer-api`
5. **Root Directory**: `backend`
6. **Environment**: Python 3
7. **Build Command**: `pip install -r requirements.txt`
8. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
9. **Instance Type**: Free
10. Click **Create Web Service**

✅ Your backend will be live at: `https://audio-visualizer-api.onrender.com`

---

## Step 4: Update Frontend with Backend URL

1. In Vercel dashboard, go to your project settings
2. Go to **Environment Variables**
3. Add: `VITE_API_URL` = `https://audio-visualizer-api.onrender.com`
4. Redeploy

---

## Step 5: Update Backend CORS

Update `backend/main.py` line 19-23:

```python
allow_origins=[
    "http://localhost:5173",
    "https://your-app.vercel.app"  # Add your Vercel URL
],
```

Push changes and Render will auto-deploy.

---

## 🎉 Done!

Your app is now live and FREE to use!

**Important Notes:**
- Free tier backend sleeps after 15min inactivity (wakes in ~30s)
- Users bring their own API keys (zero API costs for you)
- Upgrade to paid tier ($7/month) for always-on backend

---

## Next Steps (Optional)

1. **Custom Domain**: Add in Vercel settings
2. **Analytics**: Add Vercel Analytics
3. **Monitoring**: Set up Render health checks
4. **Database**: Add PostgreSQL if needed (also free tier on Render)
