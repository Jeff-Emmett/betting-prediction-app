import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher (for API routes)
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true
})

// Client-side Pusher
export const pusherClient = typeof window !== 'undefined' ? new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    forceTLS: true
  }
) : null

// Helper function to trigger events
export const triggerPusherEvent = async (channel, event, data) => {
  try {
    await fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel,
        event,
        data
      })
    })
  } catch (error) {
    console.error('Failed to trigger Pusher event:', error)
  }
}