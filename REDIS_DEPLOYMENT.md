# Redis Deployment Guide

## Redis Setup Options

### Option 1: Redis Cloud (Recommended for Production)
1. Go to [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a free account
3. Create a new database
4. Copy the connection string
5. Add to Vercel environment variables:
   \`\`\`
   REDIS_URL=redis://username:password@host:port
   \`\`\`

### Option 2: Upstash Redis
1. Go to [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy the Redis URL
4. Add to Vercel environment variables:
   \`\`\`
   REDIS_URL=redis://username:password@host:port
   \`\`\`

### Option 3: AWS ElastiCache
1. Create an ElastiCache Redis cluster in AWS
2. Configure security groups for access
3. Use the cluster endpoint:
   \`\`\`
   REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379
   \`\`\`

### Option 4: Local Development
For local development, install Redis:

**macOS:**
\`\`\`bash
brew install redis
brew services start redis
\`\`\`

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
\`\`\`

**Windows:**
Use Docker:
\`\`\`bash
docker run -d -p 6379:6379 redis:alpine
\`\`\`

## Environment Variables

Add these to your Vercel project:

\`\`\`env
REDIS_URL=redis://your-redis-url:6379
REDIS_PASSWORD=your-password-if-required
\`\`\`

## Vercel Deployment

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Features

- ✅ Persistent Redis storage
- ✅ Connection pooling and error handling
- ✅ JSON serialization for complex data
- ✅ User-specific data caching
- ✅ Bulk operations for performance
- ✅ Graceful error handling
- ✅ Production-ready configuration

## Redis Data Structure

\`\`\`
taskmanager:users -> JSON array of all users
taskmanager:tasks:${userId} -> JSON array of user's tasks
taskmanager:all_tasks -> JSON array of all tasks
taskmanager:data -> Complete data store backup
\`\`\`

## Performance Benefits

- Fast data retrieval with Redis caching
- User-specific task caching
- Reduced database queries
- Scalable architecture
- Real-time data updates
