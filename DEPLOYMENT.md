# Deployment Guide - PAT-ANI WMS

## Quick Deploy to Vercel

### Prerequisites
1. GitHub account
2. MongoDB Atlas account (free tier)
3. Vercel account (free tier)

### Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. **Important:** Whitelist IP `0.0.0.0/0` (allow all IPs for serverless functions)

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Push this code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=generate_random_string_here
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Environment Variables

In Vercel Dashboard > Your Project > Settings > Environment Variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas connection string |
| `NODE_ENV` | `production` | Environment mode |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your app URL |
| `NEXTAUTH_SECRET` | Random string | Auth secret (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Your app URL for auth |

### Step 4: Post-Deployment

1. Visit your deployed app at `https://your-app.vercel.app`
2. Test all features:
   - Inventory management
   - Order creation
   - Customer management
   - Expense tracking
   - Tax management
   - PDF generation
3. Set up custom domain (optional)

## Features Included

✅ Inventory Management
✅ Order Management
✅ Customer Tracking
✅ Payment Processing
✅ Expense Management
✅ Tax Management
✅ PDF Report Generation
✅ Real-time Updates
✅ Professional Nigerian Business Formatting

## Tech Stack

- **Framework:** Next.js 15
- **Database:** MongoDB Atlas
- **Hosting:** Vercel
- **PDF Generation:** jsPDF
- **Styling:** Tailwind CSS

## Support

For issues or questions, check the GitHub repository issues section.

---

🚀 **Deployed and Built by Claude Code**
