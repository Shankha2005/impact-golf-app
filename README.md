# Impact Golf - Charity Subscription Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?logo=stripe)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

**Live Production URL:** https://impact-golf-app.vercel.app/

## 📌 Project Overview
Impact Golf is a modern, emotion-driven web application combining golf performance tracking, automated monthly prize draws, and charitable giving. Designed specifically to avoid traditional "golf clichés," the platform focuses on community impact, user engagement, and seamless subscription management.

This project was built as a submission for the **Digital Heroes Full-Stack Development Trainee Selection Process**.

## 🚀 Core Architecture & Features

### 1. Subscription & Payment Engine
* **Gateway:** Fully integrated Stripe checkout for PCI-compliant payment processing.
* **Plans:** Supports both Monthly and discounted Yearly billing cycles.
* **Webhook Architecture:** Utilizes robust Stripe webhooks (`customer.subscription.created`, `updated`, `deleted`) to securely sync subscription states to the database using Supabase Service Role keys, preventing silent failures.
* **Access Control:** Middleware and Row Level Security (RLS) enforce strict access boundaries for non-subscribers.

### 2. Algorithmic Draw & Reward System
* **Mathematical Precision:** Automates the PRD's exact prize pool logic (40% for 5-match, 35% for 4-match, 25% for 3-match).
* **Jackpot Logic:** Successfully calculates and carries forward unclaimed 5-match jackpots to the following month's pool.
* **Simulation Mode:** Provides an admin-exclusive "test run" feature to simulate draw outcomes and preview prize distributions before publishing official results.

### 3. "Rule of 5" Score Management
* **Strict Constraints:** Validates all user inputs to strictly adhere to the Stableford format (1-45 points).
* **Rolling Data Structure:** Engineered a self-pruning database logic. Upon a user's 6th score entry, the system automatically overwrites the oldest record, ensuring only the 5 most recent scores are retained and displayed in reverse chronological order.

### 4. Charity Integration & UI/UX
* **Dynamic Contributions:** Enforces a hard minimum of 10% charity contribution per user, while empowering users with a custom slider to voluntarily increase their impact.
* **Modern Aesthetic:** Built with a mobile-first philosophy using Tailwind CSS. Features smooth micro-interactions, defensive error boundaries, and a clean interface that prioritizes charitable impact over traditional sports imagery.

---

## 🛠️ Tech Stack & Implementation Details

* **Framework:** Next.js (App Router, Server Components, Server Actions)
* **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Triggers)
* **Payments:** Stripe (Checkout Sessions, Webhooks)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### Defensive Programming Highlights
To ensure zero-downtime and prevent "Null Data" digest crashes for new users, the application utilizes strict Server Component auditing, optional chaining, and `force-dynamic` rendering. All database calls are wrapped in `try/catch` blocks with safe UI fallbacks to handle sparse initial data states gracefully.

---

## 👨‍💻 Evaluator Testing Guide

To test the full capability of the platform, please follow these steps:

1. **User Flow:** Sign up, select a charity, and complete a test Stripe checkout.
2. **Score Logic:** Enter 6 distinct golf scores to verify that the oldest score is automatically dropped.
3. **Admin Flow:** Log in with Admin credentials to access the hidden `/admin` dashboard.
Admin Email: "thefinaltest@gmail.com"
Admin Password: "123456789" 
4. **Draw Simulation:** In the Admin Panel, run a "Simulation Draw" to verify the prize pool math before officially publishing.
5. **Mobile Responsiveness:** View the user dashboard on a mobile viewport to verify the responsive sidebar and layout constraints.

## ⚙️ Local Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Shankha2005/impact-golf-app

2. Install dependencies: npm install
3. Set up Environment Variables. Create a .env.local file with the following keys:
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    STRIPE_SECRET_KEY=your_stripe_secret
    STRIPE_WEBHOOK_SECRET=your_webhook_secret
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
4. Run the development server: npm run dev

Developed by Shankhadeep Das