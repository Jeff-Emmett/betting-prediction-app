import { db } from '../../lib/supabase'
import { triggerPusherEvent } from '../../lib/pusher'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const bets = await db.getBets()
        res.status(200).json(bets)
        break

      case 'POST':
        const { gameId, bet, marketProbability } = req.body
        if (!gameId || !bet || !bet.id) {
          return res.status(400).json({ error: 'Invalid bet data' })
        }

        const savedBet = await db.saveBet({
          id: bet.id,
          game_id: gameId,
          user_id: bet.userId,
          user_name: bet.userName,
          amount: bet.amount,
          condition: bet.condition,
          certainty: bet.certainty,
          yes_tokens: bet.yesTokens || 0,
          no_tokens: bet.noTokens || 0,
          bet_type: bet.betType || 'hedged',
          actual_cost: bet.actualCost,
          platform_fee: bet.platformFee,
          net_cost: bet.netCost,
          created_at: bet.createdAt || new Date().toISOString()
        })

        // Convert database format back to app format
        const appBet = {
          id: savedBet.id,
          userId: savedBet.user_id,
          userName: savedBet.user_name,
          amount: parseFloat(savedBet.amount),
          condition: savedBet.condition,
          certainty: savedBet.certainty,
          yesTokens: savedBet.yes_tokens,
          noTokens: savedBet.no_tokens,
          betType: savedBet.bet_type,
          actualCost: parseFloat(savedBet.actual_cost),
          platformFee: parseFloat(savedBet.platform_fee),
          netCost: parseFloat(savedBet.net_cost),
          createdAt: savedBet.created_at
        }

        // Trigger real-time update
        await triggerPusherEvent('chess-tournament', 'new-bet', {
          gameId: gameId,
          bet: appBet,
          marketProbability: marketProbability || 50
        })

        res.status(200).json(savedBet)
        break

      default:
        res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Bets API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}