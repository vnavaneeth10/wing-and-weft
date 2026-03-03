# Wing & Weft — Admin Dashboard Setup Guide

Complete step-by-step instructions for setting up the admin dashboard.
Estimated time: 30–45 minutes (zero coding required after this).

---

## What You're Setting Up

```
Your Website (Vercel)          Supabase (Free Backend)
┌─────────────────────┐        ┌─────────────────────────┐
│  /          ← Public│  ←──→  │  products table          │
│  /category/ ← Public│        │  banners table           │
│  /product/  ← Public│        │  inquiries table         │
│  /admin     ← LOCKED│        │  settings table          │
│             (login) │        │  Storage (images)        │
└─────────────────────┘        └─────────────────────────┘
```

---

## Step 1: Create Supabase Account & Project

1. Go to **https://supabase.com** → click **Start for free**
2. Sign up (GitHub login is fastest)
3. Click **New project**
4. Fill in:
   - **Organization:** Wing and Weft (or your name)
   - **Project name:** `wing-and-weft`
   - **Database password:** Create a strong password — **save this somewhere safe**
   - **Region:** Southeast Asia (Singapore) — closest to India
5. Click **Create new project**
6. Wait ~2 minutes for the project to be ready

---

## Step 2: Run the Database Setup Script

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-setup.sql` from your project folder
4. Copy the entire contents
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" — this is correct!

---

## Step 3: Create Storage Buckets (for images)

1. In the left sidebar, click **Storage**
2. Click **New bucket**
3. Create first bucket:
   - Name: `product-images`
   - ✅ Check "Public bucket"
   - Click **Save**
4. Create second bucket:
   - Name: `banner-images`
   - ✅ Check "Public bucket"
   - Click **Save**

---

## Step 4: Create Your Admin Login

1. In the left sidebar, click **Authentication**
2. Click **Users** tab
3. Click **Invite user**
4. Enter your email address (e.g., `admin@wingandweft.com`)
5. Click **Send invitation**
6. Check your email — you'll get an invite link
7. Click the link, set your password
8. **You now have your admin login credentials!**

> ⚠️ Only invite one admin user. Don't share this login with anyone you don't fully trust.

---

## Step 5: Get Your API Keys

1. In the left sidebar, click **Project Settings** (gear icon)
2. Click **API** tab
3. Copy these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## Step 6: Add Keys to Your Project

Open the file `.env` in your project root (create it if it doesn't exist):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with what you copied in Step 5.

> ⚠️ Never share your `.env` file or commit it to GitHub. It's already in `.gitignore`.

---

## Step 7: Add Keys to Vercel (for deployment)

1. Go to **https://vercel.com** → your project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` → your Project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
3. Click **Save**
4. Redeploy your site (Vercel will auto-deploy or click Redeploy)

---

## Step 8: Test the Admin Dashboard

1. Open your site at: `https://your-site.vercel.app/admin`
2. You should see the Wing & Weft Admin login page
3. Enter the email and password from Step 4
4. You're in! 🎉

---

## How the Client Uses the Dashboard

### Adding a New Product

1. Go to `/admin` → sign in
2. Click **Products** in the left sidebar
3. Click **Add Product** (top right)
4. Fill in all details:
   - Product name, category, fabric
   - Original price and discount price (optional)
   - Stock count
   - Upload 4 product photos (drag & drop)
   - Description
   - Saree specifications
   - Check the tags: New Arrival, Best Seller, Featured
5. Click **Add Product**
6. Product appears on the website immediately!

### Updating Stock

**Quick way (recommended for the client):**
1. Products page → find the product
2. Click the stock badge (e.g., "10 in stock")
3. Type the new number → press Enter
4. Done! Shows "Out of Stock" automatically when 0

**Full edit way:**
1. Click the edit pencil icon on any product
2. Change the Stock Count field
3. Click Save

### Updating Banners

1. Click **Banners** in sidebar
2. Find the slide to edit (Slide 1, 2, or 3)
3. Drag a new photo into the image area
4. Update the headline, subtitle, and button text
5. Click **Save** on that slide
6. Toggle the eye icon to show/hide a slide

### Viewing Customer Inquiries

1. Click **Inquiries** in sidebar
2. New messages show with a red indicator
3. Click **Reply on WhatsApp** — opens WhatsApp with the customer's number pre-filled
4. Mark as **Seen** or **Replied** to track follow-ups

### Changing WhatsApp/Instagram Links

1. Click **Settings** in sidebar
2. Update the WhatsApp number, Instagram URL, etc.
3. Click **Save changes**

---

## Admin Dashboard Features Summary

| Feature | What the client can do |
|---|---|
| **Products** | Add, edit, delete products. Update stock with one click. |
| **Stock alerts** | Dashboard shows products with ≤3 stock automatically |
| **Banners** | Replace images, edit text, show/hide slides |
| **Inquiries** | Read customer messages, reply via WhatsApp, track status |
| **Settings** | Update WhatsApp number, social links, ribbon text |

---

## Accessing the Admin on Mobile

The admin dashboard works on mobile too. The client can:
- Open `your-site.com/admin` in their phone browser
- Bookmark it for quick access
- Update stock on the go after selling at exhibitions/events

---

## Troubleshooting

**"Login failed" error:**
→ Check you're using the email and password set up in Step 4
→ Make sure the Supabase keys in `.env` are correct

**Products not showing on website:**
→ Check that RLS policies were created (Step 2 SQL ran successfully)
→ In Supabase → Authentication → Settings → make sure JWT expiry is 3600+

**Images not uploading:**
→ Confirm storage buckets are set to **Public** (Step 3)
→ Check the bucket names match exactly: `product-images` and `banner-images`

**Dashboard shows blank page:**
→ Check browser console for errors (F12)
→ Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel

---

## Cost Summary

| Service | Free Tier Limit | Notes |
|---|---|---|
| Supabase | 500MB database, 1GB storage, 50K API calls/month | More than enough for starting out |
| Vercel | Unlimited deploys, 100GB bandwidth | Free forever for this size |
| **Total** | **₹0 / month** | 🎉 |

Supabase free tier supports ~500 products, all images, and hundreds of daily visitors without any charge.

---

*Setup guide for Wing & Weft Admin Dashboard — March 2026*
