# 🔖 Smart Bookmark App

A secure, real-time bookmark manager built using **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**, deployed on **Vercel**.

---

## 🚀 Live Demo

🔗 smart-bookmark-app-phi-pink.vercel.app

---

## 📂 GitHub Repository

🔗 https://github.com/Priyanshusharma1407/smart-bookmark-app

---

# 🛠 Tech Stack

- **Next.js 16 (App Router)**
- **Supabase**
  - Google OAuth Authentication
  - Postgres Database
  - Row Level Security (RLS)
  - Realtime Subscriptions
- **Tailwind CSS**
- **Vercel Deployment**

---

# ✨ Features

- 🔐 Google OAuth login (no email/password)
- 👤 User-specific private bookmarks
- ➕ Add bookmarks (URL + Title)
- ❌ Delete bookmarks
- ⚡ Real-time updates across browser tabs
- 🛡 Database-level security using RLS
- 🌍 Fully deployed production app

---

# 🔐 Security Implementation

Row Level Security (RLS) is enabled on the `bookmarks` table.

Policies implemented:

- Users can only **view their own bookmarks**
- Users can only **insert bookmarks where `user_id = auth.uid()`**
- Users can only **delete their own bookmarks**

This ensures complete data isolation between users, even if frontend protections are bypassed.

---


# Problems Faced & Solutions

1️⃣ Realtime Not Working in Production

Problem:
Realtime worked locally but not after deployment.

Cause:
Next.js App Router pre-rendered the /dashboard page during build.

Solution:
Forced the page to be dynamic:

'use client'
export const dynamic = 'force-dynamic'


This ensured WebSocket subscriptions initialized properly in production.

2️⃣ Google OAuth Redirecting to localhost

Problem:
After deployment, login redirected to localhost.

Cause:
Supabase "Site URL" was still set to localhost.

Solution:
Updated in:

Supabase → Authentication → URL Configuration

Set Site URL to Vercel domain

Added proper Redirect URLs

3️⃣ Vercel Build Failing

Problem:
Build failed with:

Your project's URL and API key are required


Cause:
Environment variables were not added in Vercel.

Solution:
Added:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY


under Vercel → Project Settings → Environment Variables.

4️⃣ Delete Events Not Updating UI

Problem:
Delete worked in database but UI did not update instantly.

Cause:
Postgres replica identity was not sending full row data.

Solution:

alter table bookmarks replica identity full;


Additionally simplified realtime logic to refetch bookmarks on change.
