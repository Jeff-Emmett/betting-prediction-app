import { db } from '../../lib/supabase'
import { triggerPusherEvent } from '../../lib/pusher'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const users = await db.getUsers()
        res.status(200).json(users)
        break

      case 'POST':
        const { user } = req.body
        if (!user || !user.id) {
          return res.status(400).json({ error: 'Invalid user data' })
        }

        const savedUser = await db.saveUser({
          id: user.id,
          name: user.name,
          balance: user.balance,
          is_admin: user.isAdmin || false
        })

        // Trigger real-time update
        await triggerPusherEvent('chess-tournament', 'user-update', {
          userId: user.id,
          user: {
            id: savedUser.id,
            name: savedUser.name,
            balance: parseFloat(savedUser.balance),
            isAdmin: savedUser.is_admin
          }
        })

        res.status(200).json(savedUser)
        break

      case 'PUT':
        const { userId, updates } = req.body
        if (!userId || !updates) {
          return res.status(400).json({ error: 'Missing userId or updates' })
        }

        if (updates.balance !== undefined) {
          const updatedUser = await db.updateUserBalance(userId, updates.balance)
          
          // Trigger real-time update
          await triggerPusherEvent('chess-tournament', 'user-update', {
            userId: userId,
            user: {
              id: updatedUser.id,
              name: updatedUser.name,
              balance: parseFloat(updatedUser.balance),
              isAdmin: updatedUser.is_admin
            }
          })

          res.status(200).json(updatedUser)
        } else {
          res.status(400).json({ error: 'No valid updates provided' })
        }
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Users API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}