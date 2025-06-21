import { db } from '../../lib/supabase'

export default async function handler(req, res) {
  try {
    // Test database connection
    const users = await db.getUsers()
    
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      usersCount: Object.keys(users).length,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasPusherKey: !!process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        hasPusherCluster: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER
      }
    })
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasPusherKey: !!process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        hasPusherCluster: !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER
      }
    })
  }
} 