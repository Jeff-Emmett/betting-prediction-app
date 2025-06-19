import { db } from '../../lib/supabase'
import { triggerPusherEvent } from '../../lib/pusher'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const account = await db.getPlatformAccount()
        res.status(200).json(account)
        break

      case 'POST':
        const { platformAccount } = req.body
        if (!platformAccount) {
          return res.status(400).json({ error: 'Invalid platform account data' })
        }

        const savedAccount = await db.savePlatformAccount(platformAccount)

        // Trigger real-time update
        await triggerPusherEvent('chess-tournament', 'platform-update', {
          platformAccount: {
            balance: parseFloat(savedAccount.balance),
            totalFees: parseFloat(savedAccount.total_fees),
            transactionCount: savedAccount.transaction_count
          }
        })

        res.status(200).json(savedAccount)
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Platform API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}