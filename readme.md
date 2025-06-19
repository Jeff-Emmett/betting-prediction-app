# Commons Hub Chess Tournament 🍄

Official Mycelial-Betting Network for Chess Tournaments with real-time multiplayer functionality.

## 🚀 Quick Deploy to Vercel

### 1. Clone Repository
```bash
git clone [your-repo-url]
cd chess-tournament-betting
```

### 2. Set Up Services

#### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to SQL Editor and run the schema from `database/schema.sql`
3. Get your project URL and anon key from Settings > API

#### Pusher Setup  
1. Go to [pusher.com](https://pusher.com) and create a new app
2. Choose your region (e.g., us-east-1)
3. Get your App ID, Key, Secret, and Cluster from App Keys

### 3. Environment Variables

Create `.env.local` file in your project root:
```bash
# Copy from .env.local.example and fill in your values
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=us2  
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy to Vercel

#### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repo
3. Add environment variables in Vercel dashboard
4. Deploy! 🚀

#### Option B: Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts and add environment variables
```

## 🏗️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
chess-tournament-betting/
├── components/
│   └── ChessApp.js          # Main React component
├── lib/
│   ├── supabase.js          # Database client & helpers
│   └── pusher.js            # Real-time client & helpers
├── pages/
│   ├── api/
│   │   ├── pusher/trigger.js # Pusher webhook endpoint
│   │   ├── users.js         # User management API
│   │   ├── games.js         # Game management API
│   │   ├── bets.js          # Betting system API
│   │   └── platform.js      # Platform account API
│   └── index.js             # Main page
├── database/
│   └── schema.sql           # Database schema
├── package.json
├── next.config.js
└── README.md
```

## 🎮 Features

- **Real-time Multiplayer**: Live updates via Pusher WebSockets
- **Prediction Markets**: YES/NO token betting with dynamic pricing
- **Advanced Analytics**: Market efficiency, contrarian analysis
- **Platform Economy**: 1% commons fee system
- **Admin Dashboard**: User management and platform controls
- **Mobile Responsive**: Works on all devices

## 🔧 Tech Stack

- **Frontend**: Next.js + React
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Pusher WebSockets
- **Hosting**: Vercel
- **Styling**: Tailwind CSS (CDN)

## 🚨 Important Notes

### Vercel Environment Variables
When deploying to Vercel, add these environment variables in your Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to Settings > Environment Variables
3. Add each variable from your `.env.local` file

### Database Schema
Make sure to run the SQL schema in Supabase **before** deploying:
1. Open Supabase dashboard
2. Go to SQL Editor
3. Copy and paste contents of `database/schema.sql`
4. Run the query

### Pusher Configuration
Ensure your Pusher app is configured for your deployment domain:
1. Go to Pusher dashboard
2. Navigate to App Settings
3. Add your Vercel domain to allowed origins

## 🐛 Troubleshooting

### Common Issues

**"Failed to connect to Pusher"**
- Check your Pusher environment variables
- Ensure cluster matches your Pusher app region

**"Database connection failed"**
- Verify Supabase URL and anon key
- Check if database schema has been applied

**"Build failed on Vercel"**
- Ensure all environment variables are set
- Check that dependencies are correctly specified in package.json

### Testing Locally

```bash
# Test API endpoints
curl http://localhost:3000/api/users
curl http://localhost:3000/api/games
curl http://localhost:3000/api/platform

# Check environment variables
echo $NEXT_PUBLIC_PUSHER_APP_KEY
echo $NEXT_PUBLIC_SUPABASE_URL
```

## 📝 License

MIT License - Feel free to use for your chess tournaments!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🍄 Happy Betting!

Your mycelial network awaits. May the spores be with you! 🕸️
│