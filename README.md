# Shalom PG

A simple app for running paying-guest (PG) houses. The owner does everything:

- add houses and the people staying in them (photo, ID proof, phone, email, room, rent, deposit, due date)
- see whose rent is overdue, due today, or due soon
- send rent reminders on WhatsApp or email in one tap, or remind a whole group at once
- record payments (UPI, cash or bank) with the month and amount

Each owner signs in to their own account and only ever sees their own houses.

**Stack:** React + Vite (website, hosted free on GitHub Pages) · Supabase (database, logins, private document storage).

---

## 1. Put it on GitHub (one time)

1. Go to https://github.com/new
   - Repository name: `shalom-pg`
   - Visibility: **Public** (free GitHub Pages needs a public repo; your data is *not* in the repo, it lives in Supabase behind logins)
   - Don't add a README, .gitignore or licence (this folder already has them)
   - Click **Create repository**
2. In a terminal inside this `pg-manager` folder, run (replace `YOUR-USERNAME`):

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/shalom-pg.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" run takes about a minute. When it's green,
   the site is live at `https://YOUR-USERNAME.github.io/shalom-pg/`.

From then on, every `git push` to `main` updates the live site automatically.

## 2. Add your parents' logins (one time per person)

Accounts are created by you, not by a sign-up form:

1. Supabase dashboard → project **PG Manager** → **Authentication → Users → Add user → Create new user**
2. Enter their email and a starting password, and tick **Auto Confirm User**
3. They sign in on the website, then go to **Settings → Change password** to pick their own

Every account added this way automatically becomes an owner with their own private space.
Recommended: in **Authentication → Sign In / Providers**, turn **off "Allow new users to sign up"** so
nobody else can create an account.

## 3. Install it on a phone

Open the site in Chrome (Android) or Safari (iPhone) → menu/share → **Add to Home Screen**. It opens
full-screen like an app.

---

## Developing locally

```bash
npm install
npm run dev
```

- `.env.production` holds the Supabase URL + publishable key used for the live site (safe to commit).
- Create `.env.local` with the same two values to use the cloud while developing; without it the app
  runs in offline demo mode (data saved in the browser only, with a "demo data" button).
- `supabase/schema.sql` is the full database setup (tables, row-level security, storage).
- **Never** commit the Supabase `service_role` / secret key.
