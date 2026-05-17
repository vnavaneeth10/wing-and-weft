# Wing & Weft — First-Time Setup Checklist

One-time steps to get the backend, admin login, and deployment live.
Estimated time: 30–45 minutes. No coding required.

---

## Step 1: Create a Supabase Account & Project

1. Go to **https://supabase.com** → click **Start for free**
2. Sign up (GitHub login is fastest)
3. Click **New project** and fill in:
   - **Organization:** Wing and Weft (or your name)
   - **Project name:** `wing-and-weft`
   - **Database password:** Create a strong password — **save this somewhere safe**
   - **Region:** Southeast Asia (Singapore) — closest to India
4. Click **Create new project** and wait ~2 minutes for it to be ready

---

## Step 2: Run the Database Setup Script

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-setup.sql` from your project folder
4. Copy the entire contents, paste into the editor, and click **Run** (or Ctrl+Enter)
5. You should see "Success. No rows returned" — this is correct

---

## Step 3: Create Storage Buckets

1. In the left sidebar, click **Storage** → **New bucket**
2. Create two buckets:

| Bucket name | Setting |
|---|---|
| `product-images` | ✅ Public bucket |
| `banner-images` | ✅ Public bucket |

Make sure the names match exactly — the app looks for these specific names.

---

## Step 4: Create the Admin Login

1. In the left sidebar, click **Authentication** → **Users**
2. Click **Invite user**
3. Enter your email address and click **Send invitation**
4. Check your inbox, click the invite link, and set your password

> ⚠️ Only create one admin user. Don't share this login with anyone you don't fully trust.

---

## Step 5: Get Your API Keys

1. In the left sidebar, click **Project Settings** (gear icon) → **API**
2. Copy these two values and keep them handy for Steps 6 and 7:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon/public key** — long string starting with `eyJ...`

---

## Step 6: Add Keys to the Project (Local Dev)

Open the `.env` file in your project root (create it if it doesn't exist):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the placeholder values with what you copied in Step 5.

> ⚠️ Never share your `.env` file or commit it to GitHub. It's already in `.gitignore`.

---

## Step 7: Add Keys to Vercel (Live Site)

1. Go to **https://vercel.com** → your project → **Settings** → **Environment Variables**
2. Add both variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **Save**, then redeploy the site (Vercel will auto-deploy on next push, or click **Redeploy** manually)

---

## Step 8: Verify Everything Works

1. Open `https://wingandweft.com/admin`
2. Sign in with the email and password from Step 4
3. You should land on the admin dashboard ✅

---

## Troubleshooting

| Problem | What to check |
|---|---|
| "Login failed" error | Confirm the email/password from Step 4. Check that the Supabase keys in Vercel match Step 5 exactly. |
| Products not showing on the website | Confirm the SQL script in Step 2 ran successfully (RLS policies must be created). |
| Images not uploading | Confirm both storage buckets are set to **Public** and names match exactly (`product-images`, `banner-images`). |
| Dashboard shows a blank page | Open browser console (F12) and check for errors. Confirm both env variables are saved in Vercel and the site was redeployed after adding them. |

---

## Cost Reference

| Service | Free Tier | Notes |
|---|---|---|
| Supabase | 500 MB database, 1 GB storage, 50K API calls/month | Sufficient for hundreds of products and daily visitors |
| Vercel | Unlimited deploys, 100 GB bandwidth | Free for this project size |
| **Total** | **₹0 / month** | 🎉 |

---

> For day-to-day usage — adding products, updating stock, managing banners — see **Section 16 of the project README**.

*Wing & Weft — Setup Checklist v2.0 — May 2026*