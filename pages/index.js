import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Dynamically import the chess app to avoid SSR issues with Pusher
const ChessApp = dynamic(() => import('../components/ChessApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 text-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🍄</div>
        <div>Connecting to the mycelial network...</div>
        <div className="text-sm text-gray-400 mt-2">Loading application...</div>
      </div>
    </div>
  )
})

export default function Home() {
  const [healthStatus, setHealthStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check API health on mount
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealthStatus(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Health check failed:', error)
        setHealthStatus({ status: 'error', error: error.message })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 text-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍄</div>
          <div>Checking system health...</div>
        </div>
      </div>
    )
  }

  if (healthStatus?.status === 'unhealthy') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-gray-900 text-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">System Error</h1>
          <div className="bg-red-800 p-4 rounded mb-4 text-left">
            <p className="text-sm mb-2"><strong>Error:</strong> {healthStatus.error}</p>
            <p className="text-sm mb-2"><strong>Environment Check:</strong></p>
            <ul className="text-xs space-y-1">
              <li>Supabase URL: {healthStatus.environment?.hasSupabaseUrl ? '✅' : '❌'}</li>
              <li>Supabase Key: {healthStatus.environment?.hasSupabaseKey ? '✅' : '❌'}</li>
              <li>Pusher Key: {healthStatus.environment?.hasPusherKey ? '✅' : '❌'}</li>
              <li>Pusher Cluster: {healthStatus.environment?.hasPusherCluster ? '✅' : '❌'}</li>
            </ul>
          </div>
          <p className="text-sm text-gray-300">
            Please check your environment variables and database setup.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Commons Hub Chess Tournament</title>
        <meta name="description" content="Official Mycelial-Betting Network for Chess Tournaments" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ChessApp />
    </>
  )
}