# How to put the site online (no terminal needed)

You need a free GitHub account and a free Vercel account. Allow about 20 minutes the first time.

## Part 1: Upload the files to GitHub

1. Unzip `leanlight-solar.zip` on your computer. You get a folder called `leanlight-solar`.
2. Go to **github.com** and sign in. Click the **+** at the top right, then **New repository**.
3. Name it `leanlight-solar`. Choose **Private**. Leave every other box unticked. Click **Create repository**.
4. On the next screen, click the link **uploading an existing file**.
5. Open the `leanlight-solar` folder on your computer. Select **everything inside it** (not the folder itself) and drag it into the GitHub page.
   - `package.json` must sit at the top level of the repository, not inside another folder.
   - Use Chrome or Edge: they keep the folder structure when you drag.
   - If the `.gitignore` file is hidden on your computer and does not upload, that is fine.
6. Wait until the file list stops growing (about 70 files), then click **Commit changes**.
7. Check: the repository's main page should show the folders `app`, `components`, `content`, `lib`, `public` and files such as `package.json` and `siteConfig.js`.

## Part 2: Deploy on Vercel

1. Go to **vercel.com** and choose **Sign Up → Continue with GitHub**. Approve access.
2. Click **Add New… → Project**.
3. Find `leanlight-solar` in the list and click **Import**. If it is not listed, click **Adjust GitHub App Permissions** and give Vercel access to that repository.
4. Vercel detects **Next.js** automatically. Do not change any setting. Click **Deploy**.
5. After 1 to 3 minutes you see a preview image and a link ending in `.vercel.app`. Open it and click through the site.

## Part 3: Connect the domain

1. In the Vercel project, open **Settings → Domains** and add `leanlightsolar.com` and `www.leanlightsolar.com`.
2. Vercel shows one or two DNS records. Add them at the company where the domain was bought (GoDaddy, Hostinger, etc.), in its DNS settings.
3. Wait until Vercel shows **Valid Configuration** (minutes to a few hours). HTTPS is set up automatically.
4. Make sure `siteUrl` in `siteConfig.js` matches the main domain exactly, for example `https://www.leanlightsolar.com`. Canonicals, schema and the sitemap all use it.

## Part 4: After launch

1. Open `siteConfig.js` on GitHub, click the pencil, paste your Google Search Console and Bing verification codes, and commit.
2. In Search Console, submit `https://www.leanlightsolar.com/sitemap.xml`.
3. Add your GA4 measurement ID in `siteConfig.js` if you want analytics.

## How updates work from now on

Every time you click **Commit changes** on GitHub, Vercel rebuilds the site automatically in 1 to 2 minutes.
If a build fails, the previous version stays live, so visitors never see a broken site. Open the **Deployments** tab in Vercel to see the error, undo your last edit on GitHub, and commit again.

## Before go-live: one developer task

The quote forms currently show a "design preview" message instead of sending leads. Connecting them to Supabase and a sales alert is a short job for a developer, in `public/assets/site.js`, at the line marked `LIVE SITE`.
