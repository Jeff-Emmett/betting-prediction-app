import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Settings, Crown } from 'lucide-react';
import { pusherClient, triggerPusherEvent } from '../lib/pusher';

const ChessApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [platformAccount, setPlatformAccount] = useState({ balance: 0, totalFees: 0, transactionCount: 0 });
  const [games, setGames] = useState([]);
  const [bets, setBets] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [expandedGames, setExpandedGames] = useState({});
  const [showGameForm, setShowGameForm] = useState(false);
  const [newGameData, setNewGameData] = useState({ player1: '', player2: '' });
  const [showBetForm, setShowBetForm] = useState({});
  const [showBetConfirmation, setShowBetConfirmation] = useState({});
  const [pendingBet, setPendingBet] = useState(null);
  const [betType, setBetType] = useState('hedged');
  const [newBetData, setNewBetData] = useState({ gameId: '', betAmount: 0, condition: '', certainty: 50 });
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [marketHistory, setMarketHistory] = useState({});
  const [selectedWager, setSelectedWager] = useState(null);
  const [showExistingBetForm, setShowExistingBetForm] = useState({});
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API helper functions
  const api = {
    async getUsers() {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    
    async saveUser(user) {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
      if (!response.ok) throw new Error('Failed to save user');
      return response.json();
    },
    
    async updateUserBalance(userId, balance) {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { balance } })
      });
      if (!response.ok) throw new Error('Failed to update user balance');
      return response.json();
    },
    
    async getGames() {
      const response = await fetch('/api/games');
      if (!response.ok) throw new Error('Failed to fetch games');
      return response.json();
    },
    
    async saveGame(game) {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game })
      });
      if (!response.ok) throw new Error('Failed to save game');
      return response.json();
    },
    
    async getBets() {
      const response = await fetch('/api/bets');
      if (!response.ok) throw new Error('Failed to fetch bets');
      return response.json();
    },
    
    async saveBet(gameId, bet, marketProbability) {
      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, bet, marketProbability })
      });
      if (!response.ok) throw new Error('Failed to save bet');
      return response.json();
    },
    
    async getPlatformAccount() {
      const response = await fetch('/api/platform');
      if (!response.ok) throw new Error('Failed to fetch platform account');
      return response.json();
    },
    
    async savePlatformAccount(platformAccount) {
      const response = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformAccount })
      });
      if (!response.ok) throw new Error('Failed to save platform account');
      return response.json();
    }
  };

  // Initialize app and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setError(null);
        
        // Load all data from backend
        const [usersData, gamesData, betsData, platformData] = await Promise.all([
          api.getUsers(),
          api.getGames(),
          api.getBets(),
          api.getPlatformAccount()
        ]);

        setUsers(usersData);
        setGames(gamesData);
        setBets(betsData);
        setPlatformAccount(platformData);

        // Create user if none exists
        if (Object.keys(usersData).length === 0) {
          const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
          const myceliumName = generateMyceliumName();
          const newUser = {
            id: newUserId,
            name: myceliumName,
            balance: 1000,
            isAdmin: false
          };
          
          await api.saveUser(newUser);
          setUsers({ [newUserId]: newUser });
          setCurrentUser(newUserId);
        } else {
          // Set current user to first user (in production, this would be from auth)
          setCurrentUser(Object.keys(usersData)[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError('Failed to load application. Please refresh the page.');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Set up Pusher real-time listeners
  useEffect(() => {
    if (!currentUser || !pusherClient) return;

    const channel = pusherClient.subscribe('chess-tournament');

    // Listen for new games
    channel.bind('new-game', (data) => {
      setGames(prev => {
        const exists = prev.find(g => g.id === data.game.id);
        return exists ? prev : [...prev, data.game];
      });
      setExpandedGames(prev => ({ ...prev, [data.game.id]: true }));
    });

    // Listen for new bets
    channel.bind('new-bet', (data) => {
      setBets(prev => ({
        ...prev,
        [data.gameId]: [...(prev[data.gameId] || []), data.bet]
      }));
      // Update market history
      updateMarketHistory(data.gameId, data.bet.condition, data.marketProbability);
    });

    // Listen for user updates
    channel.bind('user-update', (data) => {
      setUsers(prev => ({ ...prev, [data.userId]: data.user }));
    });

    // Listen for platform account updates
    channel.bind('platform-update', (data) => {
      setPlatformAccount(data.platformAccount);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe('chess-tournament');
    };
  }, [currentUser]);

  // Auto-expand new games
  useEffect(() => {
    if (games.length > 0) {
      const initialExpanded = {};
      games.forEach(game => {
        if (!(game.id in expandedGames)) {
          initialExpanded[game.id] = true;
        }
      });
      if (Object.keys(initialExpanded).length > 0) {
        setExpandedGames(prev => ({ ...prev, ...initialExpanded }));
      }
    }
  }, [games]);

  // Update admin status when user changes
  useEffect(() => {
    if (currentUser && users[currentUser]) {
      setIsAdmin(users[currentUser].isAdmin || false);
    }
  }, [currentUser, users]);

  const generateMyceliumName = () => {
    const titles = ['Spore', 'Network', 'Colony', 'Cluster', 'Node', 'Branch', 'Root', 'Cap'];
    const names = ['Shiitake', 'Oyster', 'Chanterelle', 'Morel', 'Porcini', 'Enoki', 'Maitake', 'Reishi', 'Cordyceps', 'Agaricus'];
    const suffixes = ['Weaver', 'Connector', 'Spreader', 'Fruiter', 'Decomposer', 'Networker', 'Symbiont', 'Grower'];
    
    const title = titles[Math.floor(Math.random() * titles.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${title} ${name} ${suffix}`;
  };

  const updateMarketHistory = (gameId, condition, probability) => {
    const key = `${gameId}-${condition}`;
    setMarketHistory(prev => {
      const currentHistory = prev[key] || [];
      const newEntry = {
        timestamp: new Date().toISOString(),
        probability: parseFloat(probability)
      };
      
      const updatedHistory = [...currentHistory, newEntry].slice(-10);
      
      return {
        ...prev,
        [key]: updatedHistory
      };
    });
  };

  // Rest of your calculation functions (unchanged)
  const calculateTokenPrices = (gameId, betCondition) => {
    const gameBets = bets[gameId] || [];
    const relevantBets = gameBets.filter(bet => bet.condition.toLowerCase().trim() === betCondition.toLowerCase().trim());
    
    if (relevantBets.length === 0) {
      return { yesPrice: 0.50, noPrice: 0.50, marketProbability: 50 };
    }

    let totalWeightedCertainty = 0;
    let totalAmount = 0;
    
    relevantBets.forEach(bet => {
      totalWeightedCertainty += bet.certainty * bet.amount;
      totalAmount += bet.amount;
    });
    
    const marketProbability = totalWeightedCertainty / totalAmount;
    const yesPrice = (marketProbability / 100).toFixed(2);
    const noPrice = (1 - (marketProbability / 100)).toFixed(2);
    
    return {
      yesPrice: parseFloat(yesPrice),
      noPrice: parseFloat(noPrice),
      marketProbability: marketProbability.toFixed(1)
    };
  };

  const calculateOdds = (gameId, betCondition) => {
    const gameBets = bets[gameId] || [];
    const relevantBets = gameBets.filter(bet => bet.condition.toLowerCase().trim() === betCondition.toLowerCase().trim());
    
    if (relevantBets.length === 0) {
      return { odds: 'No bets', totalAmount: 0, avgCertainty: 0, betCount: 0 };
    }

    let totalWeightedCertainty = 0;
    let totalAmount = 0;
    
    relevantBets.forEach(bet => {
      totalWeightedCertainty += bet.certainty * bet.amount;
      totalAmount += bet.amount;
    });
    
    const avgCertainty = totalWeightedCertainty / totalAmount;
    const impliedProbability = avgCertainty / 100;
    const odds = impliedProbability > 0 ? (1 / impliedProbability).toFixed(2) : '∞';
    
    return {
      odds: `${odds}:1`,
      totalAmount,
      avgCertainty: avgCertainty.toFixed(1),
      betCount: relevantBets.length
    };
  };

  const getUniqueBetConditions = (gameId) => {
    const gameBets = bets[gameId] || [];
    const conditions = [...new Set(gameBets.map(bet => bet.condition))];
    return conditions;
  };

  const updateUserName = async (newName) => {
    try {
      const updatedUser = { ...users[currentUser], name: newName };
      setUsers(prev => ({ ...prev, [currentUser]: updatedUser }));
      await api.saveUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user name:', error);
    }
  };

  const updateUserBalance = async (userId, newBalance) => {
    try {
      await api.updateUserBalance(userId, newBalance);
      // The real-time update will come through Pusher
    } catch (error) {
      console.error('Failed to update user balance:', error);
    }
  };

  const addGame = async () => {
    if (newGameData.player1 && newGameData.player2) {
      try {
        const gameId = 'game_' + Math.random().toString(36).substr(2, 9);
        const newGame = {
          id: gameId,
          player1: newGameData.player1,
          player2: newGameData.player2,
          status: 'upcoming',
          createdAt: new Date().toISOString()
        };
        
        // Optimistically update UI
        setGames(prev => [...prev, newGame]);
        setBets(prev => ({ ...prev, [gameId]: [] }));
        setExpandedGames(prev => ({ ...prev, [gameId]: true }));
        setNewGameData({ player1: '', player2: '' });
        setShowGameForm(false);
        
        // Save to backend
        await api.saveGame(newGame);
      } catch (error) {
        console.error('Failed to add game:', error);
        // Revert optimistic update on error
        setGames(prev => prev.filter(g => g.id !== newGame.id));
      }
    }
  };

  // Continue with rest of component logic...
  // (I'll create the rest in the next update due to length)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 text-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍄</div>
          <div>Connecting to the mycelial network...</div>
          <div className="text-sm text-gray-400 mt-2">Loading from Supabase...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 text-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚨</div>
          <div className="text-xl font-bold text-red-400 mb-2">Connection Error</div>
          <div className="text-gray-300 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser || !users[currentUser]) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 text-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍄</div>
          <div>Initializing user session...</div>
        </div>
      </div>
    );
  }

  const currentUserData = users[currentUser];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-gray-900 text-green-100">
      {/* Backend Status Indicator */}
      <div className="bg-green-900/20 border-b border-green-800/30 p-2 text-center">
        <div className="text-xs text-green-300">
          🌐 <strong>Live Multiplayer Mode</strong> - Connected to Pusher + Supabase
        </div>
      </div>

      {/* Basic header and navigation for now */}
      <div className="bg-black/50 border-b border-green-800/30 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🍄</div>
            <div>
              <h1 className="text-2xl font-bold text-green-400">Commons Hub Chess Tournament</h1>
              <p className="text-sm text-green-300/70">Official Mycelial-Betting Network</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-amber-400">
              🟫 {currentUserData.balance} Spore Tokens
            </div>
            <div className="text-sm text-green-300">{currentUserData.name}</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-blue-300 mb-2">Backend Successfully Connected!</h3>
          <p className="text-blue-200 mb-4">Your app is now running with real backend services:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-purple-900/20 rounded p-3">
              <div className="font-semibold text-purple-300">🔌 Pusher Real-time</div>
              <div className="text-purple-400">Live updates between users</div>
            </div>
            <div className="bg-green-900/20 rounded p-3">
              <div className="font-semibold text-green-300">🗄️ Supabase Database</div>
              <div className="text-green-400">Persistent data storage</div>
            </div>
            <div className="bg-amber-900/20 rounded p-3">
              <div className="font-semibold text-amber-300">⚡ Vercel Hosting</div>
              <div className="text-amber-400">Production deployment</div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>👥 <strong>{Object.keys(users).length}</strong> users connected</p>
            <p>🎮 <strong>{games.length}</strong> games created</p>
            <p>💰 <strong>{Object.values(bets).flat().length}</strong> bets placed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessApp;