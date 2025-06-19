import { db } from '../../lib/supabase'
import { triggerPusherEvent } from '../../lib/pusher'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const games = await db.getGames()
        res.status(200).json(games)
        break

      case 'POST':
        const { game } = req.body
        if (!game || !game.id || !game.player1 || !game.player2) {
          return res.status(400).json({ error: 'Invalid game data' })
        }

        const savedGame = await db.saveGame({
          id: game.id,
          player1: game.player1,
          player2: game.player2,
          status: game.status || 'upcoming',
          created_at: game.createdAt || new Date().toISOString()
        })

        // Trigger real-time update
        await triggerPusherEvent('chess-tournament', 'new-game', {
          game: {
            id: savedGame.id,
            player1: savedGame.player1,
            player2: savedGame.player2,
            status: savedGame.status,
            createdAt: savedGame.created_at
          }
        })

        res.status(200).json(savedGame)
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Games API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}