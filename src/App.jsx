// src/App.jsx
import { useState, useEffect } from 'react'
import {
  Share2, Users, Trophy, Gamepad2, Coins, Search, Clock, RefreshCw,
  ArrowLeft, Gift, Zap, Sparkles, Check
} from 'lucide-react'

import { useTonWallet } from './hooks/useTonWallet'
import { useUserInit } from './hooks/useUserInit'
import { useWalletSync } from './hooks/useWalletSync'
import { useWebSocket } from './hooks/useWebSocket' // <-- Импортируем новый хук

import WelcomeScreen from './components/WelcomeScreen'
import ModalWrapper from './components/ModalWrapper'
import GameButton from './components/GameButton'
import BetButton from './components/BetButton'
import LobbyItem from './components/LobbyItem'

import RockPaperScissors from './games/RockPaperScissors' // <-- Пока используем как есть, но логика будет в App
import Checkers from './games/Checkers'
import Chess from './games/Chess'
import GameResultModal from './components/GameResultModal'
import ShareModal from './components/ShareModal'
import ProfileModal from './components/ProfileModal'

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

// Убираем INITIAL_LOBBY, так как лобби будет обновляться с бэкенда (в будущем)
// const INITIAL_LOBBY = [...];

const GameComponents = {
  rps: RockPaperScissors,
  checkers: Checkers,
  chess: Chess
}

const TBoardApp = () => {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null

  if (!tg) {
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
            href="https://t.me/tboard_bot    "
            style={{ color: '#0ea5e9', textDecoration: 'underline' }}
          >
            @tboard_bot
          </a>
        </p>
      </div>
    )
  }

  useEffect(() => {
    if (tg) tg.ready()
  }, [])

  const wallet = useTonWallet()
  const {
    address,
    formattedAddress,
    balance,
    loading: balanceLoading,
    isConnected,
    connect,
    disconnect,
    refreshBalance
  } = wallet

  // --- ВСЕ ХУКИ СНАЧАЛА ---
  const { token, user, loading } = useUserInit()

  // --- Состояния ---
  // Состояния WebSocket и игры
  const [gameFoundData, setGameFoundData] = useState(null); // Информация о найденной игре
  const [gameResult, setGameResult] = useState(null); // Результат игры от бэкенда
  const [activeGame, setActiveGame] = useState(null); // Информация об активной игре (id, тип, ставка)
  const [showWaitingOpponent, setShowWaitingOpponent] = useState(false); // Новый экран ожидания

  // Состояния UI (старые)
  const [showGameSelect, setShowGameSelect] = useState(false)
  const [showBetSelect, setShowBetSelect] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [selectedBet, setSelectedBet] = useState(null)
  const [showMatchmaking, setShowMatchmaking] = useState(false) // <-- Теперь это "поиск оппонента"
  const [showShareModal, setShowShareModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Состояния с фиксированными значениями (можно оставить, но useState не нужен)
  const [userProfile] = useState({ name: 'CryptoPlayer', avatar: '👤' })
  const [referralStats] = useState({
    referrals: 12,
    earned: 24.5,
    link: 'https://t.me/tboard_bot?start=ref_USER123    '
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

  // --- Хук WebSocket ---
  const { connectionStatus, sendMessage } = useWebSocket(
    token, // Передаём токен
    (data) => { // onMessage
      console.log("App received WebSocket message:", data);
      switch (data.type) {
        case 'game_found':
          // Найден оппонент
          setGameFoundData(data);
          setShowWaitingOpponent(false);
          setActiveGame({ gameType: data.game_type, bet: data.stake, id: data.game_id });
          break;
        case 'game_result':
          // Игра завершена
          setGameResult({ winnerId: data.winner_id, finalState: data.final_state });
          refreshBalance(); // Обновляем баланс после игры
          break;
        case 'error':
          alert(`WebSocket Error: ${data.message}`);
          break;
        default:
          console.log("Unknown WebSocket message type:", data.type);
      }
    },
    (event) => { // onOpen
      console.log("App: WebSocket opened.");
    },
    (event) => { // onClose
      console.log("App: WebSocket closed.");
      // Попытаться переподключиться или сбросить состояние игры?
      setActiveGame(null);
      setGameFoundData(null);
      setGameResult(null);
      // setShowMatchmaking(false); // Если было открыто
    },
    (event) => { // onError
      console.error("App: WebSocket error:", event);
      // setShowMatchmaking(false); // Если было открыто
    }
  );

  // --- Проверка загрузки ПОСЛЕ всех хуков ---
  if (loading) {
      return <div className="bg-slate-950 text-white min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // --- Обработчики ---
  // --- Новые обработчики для WebSocket ---
  const handleJoinQueue = () => {
    if (connectionStatus !== 'connected') {
      alert("WebSocket is not connected. Please wait or refresh.");
      return;
    }
    if (!selectedGame || !selectedBet) {
      alert("Please select a game and a bet first.");
      return;
    }
    if (balance < selectedBet.value) {
      alert("Insufficient balance for this bet.");
      return;
    }
    console.log("Joining queue for game:", selectedGame.id, "with bet:", selectedBet.value);
    sendMessage({ action: 'join_queue', game_type: selectedGame.id, stake: selectedBet.value });
    setShowGameSelect(false); // Закрываем модалы выбора
    setShowBetSelect(false);
    setShowMatchmaking(true); // Показываем экран поиска
  };

  const handleMakeMove = (move) => {
    if (activeGame && connectionStatus === 'connected') {
      sendMessage({ action: 'make_move', game_id: activeGame.id, move: move });
    } else {
      console.warn("Cannot send move: game not active or WebSocket not connected.");
    }
  };
  // --- /Новые обработчики ---

  // Handlers (обновлённые)
  const handleCreateGame = () => setShowGameSelect(true)

  const handleGameSelect = (game) => {
    setSelectedGame(game)
    setShowGameSelect(false)
    setShowBetSelect(true)
  }

  const handleBetSelect = (bet) => {
    setSelectedBet(bet)
    setShowBetSelect(false)
    // setShowMatchmaking(true) // Перенесено в handleJoinQueue
    // setTimeout(() => { // Убираем таймаут, бэкенд сам найдёт оппонента
    //   setShowMatchmaking(false)
    //   setActiveGame({ gameType: selectedGame.id, bet: bet.value })
    // }, 2000)
    handleJoinQueue(); // Вызываем сразу после выбора ставки
  }

  // const handleGameEnd = (result, amount) => { // <-- Убираем старый обработчик
  //   setGameResult({ result, amount })
  //   setActiveGame(null)
  //   refreshBalance() // обновляем баланс после игры
  // }

  const handleCloseResult = () => {
    setGameResult(null)
    setSelectedGame(null)
    setSelectedBet(null)
    setActiveGame(null); // Закрываем активную игру
  }

  const handleExitGame = () => {
    if (window.confirm('Are you sure you want to exit the game? You will lose your bet.')) {
      setActiveGame(null) // Просто сбрасываем локальное состояние игры
      setSelectedGame(null)
      setSelectedBet(null)
      // TODO: Отправить сообщение на бэкенд о выходе?
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

  const getGameData = (gameId) => GAMES.find(g => g.id === gameId);

  // Non-connected view
  if (!isConnected) {
    return <WelcomeScreen onConnect={connect} />
  }

  // --- Активная игра через WebSocket ---
  if (activeGame) {
    const GameComponent = GameComponents[activeGame.gameType]
    if (GameComponent) {
      // Передаём game_id и функцию отправки хода в компонент игры
      return <GameComponent
        bet={activeGame.bet}
        gameId={activeGame.id} // <-- Передаём ID игры
        onExit={handleExitGame}
        onMakeMove={handleMakeMove} // <-- Передаём функцию отправки хода
        // onGameEnd={handleGameEnd} // <-- Убираем старый обработчик
      />
    }
  }
  // --- /Активная игра через WebSocket ---


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
            <div
              onClick={handleProfileClick}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl cursor-pointer hover:scale-110 transition-transform"
            >
              {userProfile.avatar}
            </div>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Share</span>
            </button>
          </div>

          <div
            className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg group cursor-pointer"
            onClick={refreshBalance}
          >
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

        {/* Заглушка для лобби, пока не подключено к бэкенду */}
        <div className="space-y-4">
          <p className="text-center text-gray-500">Looking for active games...</p>
        </div>

        {/* {activeLobby.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No active games</p>
            <p className="text-gray-500 text-sm">Be the first to create a challenge!</p>
          </div>
        )} */}
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
                onClick={() => handleBetSelect(bet)} // Теперь вызывает handleJoinQueue
              />
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* --- Новый модал поиска оппонента (заменяет старый matchmaking) --- */}
      {showMatchmaking && selectedGame && selectedBet && (
        <ModalWrapper
          title=""
          onClose={() => {
            // sendMessage({ action: 'leave_queue' }); // TODO: Реализовать на бэкенде
            setShowMatchmaking(false);
            setSelectedGame(null);
            setSelectedBet(null);
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
              // sendMessage({ action: 'leave_queue' }); // TODO: Реализовать на бэкенде
              setShowMatchmaking(false);
              setSelectedGame(null);
              setSelectedBet(null);
            }}
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        </ModalWrapper>
      )}

      {gameResult && user && ( // Показываем только если gameResult и user не null
        <GameResultModal
          // result={gameResult?.result} // <-- Старое свойство
          // amount={gameResult?.amount} // <-- Старое свойство
          // Передаём данные из бэкенда
          winnerId={gameResult.winnerId}
          finalState={gameResult.finalState}
          currentUserId={user.id} // <-- ПЕРЕДАТЬ currentUserId ИЗ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
          onClose={handleCloseResult}
        />
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        referralStats={referralStats}
        onCopyLink={handleCopyLink}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userProfile={userProfile}
        address={address}
        formattedAddress={formattedAddress}
        balance={balance}
        balanceLoading={balanceLoading}
        userStats={userStats}
        onCopyAddress={handleCopyAddress}
        onDisconnectWallet={handleDisconnectWallet}
        getGameData={getGameData}
      />
    </div>
  )
}

export default TBoardApp