# Meme Generator — Next.js + InstantDB

A full-stack meme generator with real-time community feed, magic link auth, and upvoting.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Push schema to InstantDB**
   ```bash
   npx instant-cli@latest push schema
   ```
   Log in to InstantDB when prompted, then this syncs `instant.schema.ts` with your app (ID: `6b74caca-fef9-43c9-998f-5aae624d4e24`).

3. **Configure InstantDB**
   - Enable **Magic Code** auth in the [InstantDB Dashboard](https://instantdb.com/dash)
   - Set Storage permissions to allow authenticated uploads
   - Set DB permissions: memes and upvotes readable by all; create/update/delete require auth

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Features

- **Create** — Pick a template or upload an image, add text, drag to position, download
- **Share** — Sign in with magic link (email), then post memes to the community
- **Community** — Browse all posted memes, upvote (requires sign-in), download

## Tech Stack

- Next.js 14 (App Router)
- InstantDB (real-time DB, storage, auth)
- Tailwind CSS
