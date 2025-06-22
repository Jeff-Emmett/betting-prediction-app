import Head from 'next/head'
import dynamic from 'next/dynamic'

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
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello World!</h1>
      <p>If you can see this, Next.js routing is working.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  )
}