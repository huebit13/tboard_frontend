import { useState, useEffect } from 'react'
import { Share2, Users, Trophy, Gamepad2, Coins, X, Check, Zap, Sparkles, Search, Clock, Copy, TrendingUp, TrendingDown, ArrowLeft, Gift, RefreshCw } from 'lucide-react'

import { useTonWallet } from './hooks/useTonWallet'
import { useUserInit } from './hooks/useUserInit'
import { useWalletSync } from './hooks/useWalletSync'

import WelcomeScreen from './components/WelcomeScreen'
import ModalWrapper from './components/ModalWrapper'
import GameButton from './components/GameButton'
import BetButton from './components/BetButton'
import LobbyItem from './components/LobbyItem'

import RockPaperScissors from './RockPaperScissors'
import Checkers from './Checkers'
import Chess from './Chess'
import GameResultModal from './GameResultModal'

// СТАТИЧЕСКИЕ ДАННЫЕ
const GAMES = [
  { id: 'rps', name: 'Rock Paper Scissors', icon: '✊', color: 'cyan' },
  { id: 'checkers', name: 'Checkers', icon: '🎯', color: 'purple' },
  { id: 'chess', name: 'Chess', icon: '♟️', color: 'blue' },
  { id: 'dice', name: 'Dice Battle', icon: '🎲', color: 'green' }
]

const BET_AMOUNTS = [
  { value: 0.05, label: '0.05 TON' },
  { value: 0.1, label: '0.1 TON' },
  { value: 0.5, label: '0.5 TON' },
  { value: 1, label: '1 TON' },
  { value: 5, label: '5 TON' },
  { value: 10, label: '10 TON' }
]

const INITIAL_LOBBY = [
  { id: 1, game: 'rps', bet: 5, player: 'CryptoKing', avatar: '👑', time: '2m' },
  { id: 2, game: 'chess', bet: 10, player: 'MoonBoy', avatar: '🌙', time: '5m' },
  { id: 3, game: 'checkers', bet: 1, player: 'DiamondHands', avatar: '💎', time: '1m' },
  { id: 4, game: 'dice', bet: 25, player: 'WhaleAlert', avatar: '🐋', time: '3m' }
]

const GameComponents = {
  rps: RockPaperScissors,
  checkers: Checkers,
  chess: Chess
}

const TBoardApp = () => {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  if (!tg) {
    // Показываем понятное сообщение вместо белого экрана
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#0f172a',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>⚠️ Launch Required</h2>
        <p style={{ marginBottom: '8px' }}>
          This app works only inside Telegram as a Mini App.
        </p>
        <p>
          Open via: <a 
            href="https://t.me/tboard_bot" 
            style={{ color: '#0ea5e9', textDecoration: 'underline' }}
          >
            @tboard_bot
          </a>
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (tg) tg.ready()
  }, [])

  const wallet = useTonWallet()
  const { address, formattedAddress, balance, loading: balanceLoading, isConnected, connect, disconnect, refreshBalance } = wallet

  useUserInit()
  useWalletSync(wallet)

  // State
  const [showGameSelect, setShowGameSelect] = useState(false)
  const [showBetSelect, setShowBetSelect] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedBet, setSelectedBet] = useState(null)
  const [showMatchmaking, setShowMatchmaking] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeGame, setActiveGame] = useState(null)
  const [gameResult, setGameResult] = useState(null)
  const [userProfile] = useState({ name: 'CryptoPlayer', avatar: '👤' })
  const [referralStats] = useState({
    referrals: 12,
    earned: 24.5,
    link: 't.me/tboard_bot?start=ref_USER123'
  })
  const [userStats] = useState({
    gamesPlayed: 47,
    winRate: 68,
    totalEarned: 156.8,
    gameHistory: [
      { id: 1, game: 'dice', bet: 10, result: 'win', amount: 20, date: '2 hours ago' },
      { id: 2, game: 'coin', bet: 5, result: 'loss', amount: -5, date: '5 hours ago' },
      { id: 3, game: 'rps', bet: 25, result: 'win', amount: 50, date: '1 day ago' },
      { id: 4, game: 'roulette', bet: 50, result: 'win', amount: 100, date: '1 day ago' },
      { id: 5, game: 'dice', bet: 10, result: 'loss', amount: -10, date: '2 days ago' }
    ]
  })
  const [activeLobby] = useState(INITIAL_LOBBY)

  // Helpers
  const getGameData = (gameId) => GAMES.find(g => g.id === gameId)

  // Handlers
  const handleCreateGame = () => setShowGameSelect(true)

  const handleGameSelect = (game) => {
    setSelectedGame(game)
    setShowGameSelect(false)
    setShowBetSelect(true)
  }

  const handleBetSelect = (bet) => {
    setSelectedBet(bet)
    setShowBetSelect(false)
    setShowMatchmaking(true)
    setTimeout(() => {
      setShowMatchmaking(false)
      setActiveGame({ gameType: selectedGame.id, bet: bet.value })
    }, 2000)
  }

  const handleGameEnd = (result, amount) => {
    setGameResult({ result, amount })
    setActiveGame(null)
    // ⚠️ wallet.balance не обновится! Используйте refreshBalance или обновите хук useTonWallet
  }

  const handleCloseResult = () => {
    setGameResult(null)
    setSelectedGame(null)
    setSelectedBet(null)
  }

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit the game? You will lose your bet.')) {
      setActiveGame(null)
      setSelectedGame(null)
      setSelectedBet(null)
    }
  }

  const handleShare = () => setShowShareModal(true)
  const handleProfileClick = () => setShowProfileModal(true)
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralStats.link)
    alert('Referral link copied!')
  }
  const handleDisconnectWallet = async () => {
    await disconnect()
    setShowProfileModal(false)
  }
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
    alert('Address copied!')
  }

  // Non-connected view
  if (!isConnected) {
    return <WelcomeScreen onConnect={connect} />
  }

  // Active game view
  if (activeGame) {
    const GameComponent = GameComponents[activeGame.gameType]
    if (GameComponent) {
      return <GameComponent bet={activeGame.bet} onExit={handleExitGame} onGameEnd={handleGameEnd} />
    }
  }

  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans overflow-x-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div onClick={handleProfileClick} className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform">
              {userProfile.avatar}
            </div>
            <button onClick={handleShare} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Share</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg group cursor-pointer" onClick={refreshBalance}>
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-lg">
              {balanceLoading ? '...' : balance.toFixed(2)}
            </span>
            <span className="text-gray-400 text-sm">TON</span>
            <RefreshCw className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 group-hover:rotate-180 transition-all" />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Active Lobby
          </h2>
          <p className="text-gray-400">Join a game or create your own challenge</p>
        </div>

        <button
          onClick={handleCreateGame}
          className="w-full group relative px-6 py-4 rounded-xl font-bold overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 mb-6"
        >
          <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
            <Gamepad2 className="w-6 h-6" />
            Create Game
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <div className="space-y-4">
          {activeLobby.map((lobby) => (
            <LobbyItem key={lobby.id} lobby={lobby} gameData={getGameData(lobby.game)} />
          ))}
        </div>

        {activeLobby.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No active games</p>
            <p className="text-gray-500 text-sm">Be the first to create a challenge!</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showGameSelect && (
        <ModalWrapper title="Choose Your Game" onClose={() => setShowGameSelect(false)}>
          <div className="grid grid-cols-2 gap-4">
            {GAMES.map((game) => (
              <GameButton key={game.id} game={game} onClick={() => handleGameSelect(game)} />
            ))}
          </div>
        </ModalWrapper>
      )}

      {showBetSelect && selectedGame && (
        <ModalWrapper
          title=""
          onClose={() => {
            setShowBetSelect(false)
            setSelectedGame(null)
          }}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{selectedGame.icon}</div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {selectedGame.name}
            </h2>
            <p className="text-gray-400 mt-2">Select your bet amount</p>
            <div className="mt-3 bg-slate-800 rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <span className="text-sm text-gray-400">Your balance:</span>
              <span className="font-bold text-yellow-400">{balance.toFixed(2)} TON</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {BET_AMOUNTS.map((bet) => (
              <BetButton
                key={bet.value}
                bet={bet}
                canAfford={balance >= bet.value}
                onClick={() => handleBetSelect(bet)}
              />
            ))}
          </div>
        </ModalWrapper>
      )}

      {showMatchmaking && selectedGame && selectedBet && (
        <ModalWrapper
          title=""
          onClose={() => {
            setShowMatchmaking(false)
            setSelectedGame(null)
            setSelectedBet(null)
          }}
        >
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-pulse">{selectedGame.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{selectedGame.name}</h2>
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-bold text-yellow-400">{selectedBet.value} TON</span>
            </div>
          </div>

          <div className="mb-6">
            <Search className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Searching for opponent...
            </h3>
            <p className="text-gray-400">Finding a worthy challenger</p>
          </div>

          <button
            onClick={() => {
              setShowMatchmaking(false)
              setSelectedGame(null)
              setSelectedBet(null)
            }}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        </ModalWrapper>
      )}

      {/* ShareModal и ProfileModal — можно тоже вынести, но для краткости оставим в основном файле или сделайте по аналогии */}

      {gameResult && (
        <GameResultModal result={gameResult.result} amount={gameResult.amount} onClose={handleCloseResult} />
      )}

      {/* === Здесь можно вставить ShareModal и ProfileModal как отдельные компоненты (аналогично) === */}
    </div>
  )
}

export default TBoardApp