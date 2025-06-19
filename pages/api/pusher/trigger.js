import { pusher } from '../../../lib/pusher'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { channel, event, data } = req.body

  if (!channel || !event || !data) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    await pusher.trigger(channel, event, data)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Pusher trigger error:', error)
    res.status(500).json({ error: 'Failed to trigger event' })
  }
}