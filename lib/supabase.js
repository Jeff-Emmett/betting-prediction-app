import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for database operations
export const db = {
  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) throw error
    
    // Convert array to object with id as key
    const usersObj = {}
    data.forEach(user => {
      usersObj[user.id] = user
    })
    return usersObj
  },

  async saveUser(user) {
    const { data, error } = await supabase
      .from('users')
      .upsert(user)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateUserBalance(userId, balance) {
    const { data, error } = await supabase
      .from('users')
      .update({ balance })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Games
  async getGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async saveGame(game) {
    const { data, error } = await supabase
      .from('games')
      .insert(game)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Bets
  async getBets() {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // Group bets by game_id
    const betsObj = {}
    data.forEach(bet => {
      if (!betsObj[bet.game_id]) {
        betsObj[bet.game_id] = []
      }
      betsObj[bet.game_id].push(bet)
    })
    return betsObj
  },

  async saveBet(bet) {
    const { data, error } = await supabase
      .from('bets')
      .insert(bet)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Platform Account
  async getPlatformAccount() {
    const { data, error } = await supabase
      .from('platform_account')
      .select('*')
      .eq('id', 1)
      .single()
    
    if (error) {
      // If no platform account exists, create one
      if (error.code === 'PGRST116') {
        return { balance: 0, total_fees: 0, transaction_count: 0 }
      }
      throw error
    }
    
    return {
      balance: parseFloat(data.balance),
      totalFees: parseFloat(data.total_fees),
      transactionCount: data.transaction_count
    }
  },

  async savePlatformAccount(account) {
    const { data, error } = await supabase
      .from('platform_account')
      .upsert({
        id: 1,
        balance: account.balance,
        total_fees: account.totalFees,
        transaction_count: account.transactionCount,
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data[0]
  }
}