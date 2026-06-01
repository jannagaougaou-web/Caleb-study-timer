# Study Timer — Setup Guide

## 1. Create a Notion Integration
1. Go to https://www.notion.so/my-integrations
2. Click **+ New integration**
3. Name it "Study Timer", submit
4. Copy the **Internal Integration Token** (starts with `secret_...`)

## 2. Share your database with the integration
1. Open your **Study Sessions** database in Notion
2. Click the **...** menu (top right) → **Connections** → find your integration → **Confirm**

## 3. Get your Database ID
Your database URL looks like:
`https://notion.so/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
The database ID is the part **before** `?v=` (32 characters).

## 4. Make sure your Notion database has these properties:
| Property Name | Type   |
|---------------|--------|
| Course        | Select |
| Date          | Date   |
| Duration      | Number |

⚠️ Names must match exactly (capital letters matter)

## 5. Deploy to Vercel
1. Push this folder to a GitHub repo
2. Go to vercel.com → Import that repo
3. In **Environment Variables**, add:
   - `NOTION_TOKEN` = your integration token (`secret_...`)
   - `NOTION_STUDY_DB_ID` = your database ID
4. Click **Deploy**

## 6. Embed in Notion
In Notion, type `/embed` and paste your Vercel URL.
