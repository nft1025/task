# Vercel Deployment Setup

## Required Environment Variables

To deploy this Task Manager on Vercel, you need to set up Vercel KV (Redis) for data storage.

### Step 1: Create Vercel KV Database

1. Go to your Vercel dashboard
2. Navigate to the "Storage" tab
3. Click "Create Database"
4. Select "KV" (Key-Value store)
5. Choose a name for your database (e.g., "taskmanager-db")
6. Select your region
7. Click "Create"

### Step 2: Connect to Your Project

1. In your Vercel project settings, go to "Storage"
2. Click "Connect Store" 
3. Select your KV database
4. This will automatically add the required environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`

### Step 3: Deploy

Your app should now work correctly on Vercel with persistent data storage!

## Local Development

For local development, you can either:

1. Use Vercel KV locally by running `vercel env pull` to get the environment variables
2. Or temporarily use the file-based storage for local development only

## Features

- ✅ User registration and authentication
- ✅ Create, edit, delete tasks
- ✅ Mark tasks as complete
- ✅ Set task deadlines
- ✅ Filter tasks by status
- ✅ Persistent data storage with Vercel KV
- ✅ Responsive design with dark/light themes
