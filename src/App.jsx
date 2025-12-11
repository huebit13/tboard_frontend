// src/App.jsx
import { useState, useEffect } from 'react';
import {
  Share2, Users, Trophy, Gamepad2, Coins, Search, Clock, RefreshCw,
  ArrowLeft, Gift, Zap, Sparkles, Check, Lock, Unlock
} from 'lucide-react';

import { useTonWallet } from './hooks/useTonWallet';
import { useUserInit } from './hooks/useUserInit';
import { useWalletSync } from './hooks/useWalletSync';
import { useWebSocket } from './hooks/useWebSocket';
import { GAMES } from '../constants/games';

import WelcomeScreen from './components/WelcomeScreen';
import ModalWrapper from './components/ModalWrapper';
import GameButton from './components/GameButton';
import BetButton from './components/BetButton';

import RockPaperScissors from './games/RockPaperScissors';
import Checkers from './games/Checkers';
import Chess from './games/Chess';
import GameResultModal from './components/GameResultModal';
import ShareModal from './components/ShareModal';
import ProfileModal from './components/ProfileModal';
import LobbyList from './components/LobbyList';
import LobbyRoom from './components/LobbyRoom';
import PasswordModal from './components/PasswordModal';

const BET_AMOUNTS = [
  { value: 0.05, label: '0.05 TON' },
  { value: 0.1, label: '0.1 TON' },
  { value: 0.5, label: '0.5 TON' },
  { value: 1, label: '1 TON' },
  { value: 5, label: '5 TON' },
  { value: 10, label: '10 TON' }
];

const GameComponents = {
  rps: RockPaperScissors,
  checkers: Checkers,
  chess: Chess
};

const TBoardApp = () => {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

  // === Состояния ===
  const [gameFoundData, setGameFoundData] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [showGameSelect, setShowGameSelect] = useState(false);
  const [showBetSelect, setShowBetSelect] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // === Состояния для лобби ===
  const [lobbies, setLobbies] = useState([]);
  const [currentLobby, setCurrentLobby] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalLobby, setPasswordModalLobby] = useState(null);
  const [isCreatingLobby, setIsCreatingLobby] = useState(false);
  const [showCreateLobbyGameSelect, setShowCreateLobbyGameSelect] = useState(false);
  const [showCreateLobbyBetSelect, setShowCreateLobbyBetSelect] = useState(false);
  const [createLobbyPassword, setCreateLobbyPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const [userProfile] = useState({ name: 'CryptoPlayer', avatar: '👤' });
  const [referralStats] = useState({
    referrals: 12,
    earned: 24.5,
    link: 'https://t.me/tboard_bot?start=ref_USER123'
  });
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
  });

  const wallet = useTonWallet();
  const {
    address,
    formattedAddress,
    balance,
    loading: balanceLoading,
    isConnected,
    connect,
    disconnect,
    refreshBalance
  } = wallet;
  const { token, user, loading } = useUserInit();
  const { connectionStatus, sendMessage, addMessageHandler } = useWebSocket(token);

  useEffect(() => {
    if (tg) tg.ready();
  }, []);

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
            href="https://t.me/tboard_bot"
            style={{ color: '#0ea5e9', textDecoration: 'underline' }}
          >
            @tboard_bot
          </a>
        </p>
      </div>
    );
  }

  // === WebSocket обработчик ===
  useEffect(() => {
    const unsubscribe = addMessageHandler((data) => {
      console.log("App received WebSocket message:", data);

      switch (data.type) {
        case 'connected':
          console.log('✅ Connected to game server');
          // Запрашиваем список лобби при подключении
          sendMessage({ action: 'get_lobby_list' });
          break;

        case 'game_found':
          console.log('🎮 Game found:', data);
          setGameFoundData(data);
          setShowMatchmaking(false);
          setActiveGame({ 
            gameType: selectedGame?.id || data.game_type, 
            bet: selectedBet?.value || data.stake, 
            id: data.game_id 
          });
          break;

        case 'game_result':
          setActiveGame(null);
          setCurrentLobby(null);
          console.log('🏆 Game result:', data);
          setGameResult({ 
            winnerId: data.winner_id, 
            finalState: data.final_state 
          });
          refreshBalance();
          break;

        case 'lobby_list':
          setLobbies(data.lobbies || []);
          break;

        case 'lobby_created':
          setCurrentLobby({
            id: data.lobby_id,
            gameType: data.game_type,
            bet: data.stake,
            hasPassword: data.has_password,
            creatorId: user?.id,
            players: [{ id: user?.id, ready: false }],
            isOwner: true
          });
          setIsCreatingLobby(false);
          setShowCreateLobbyGameSelect(false);
          setShowCreateLobbyBetSelect(false);
          setCreateLobbyPassword('');
          break;

        case 'lobby_joined':
          setCurrentLobby({
            id: data.lobby_id,
            gameType: data.game_type,
            bet: data.stake,
            hasPassword: data.has_password,
            creatorId: data.creator_id,
            players: [
              { id: data.creator_id, ready: false },
              { id: user?.id, ready: false }
            ],
            isOwner: false
          });
          break;

        case 'lobby_updated':
          if (currentLobby && currentLobby.id === data.lobby_id) {
            const players = (data.players || []).filter(p => p);
            setCurrentLobby(prev => ({ ...prev, players }));
          }
          break;

        case 'kicked_from_obby':
          alert("You were kicked from the lobby.");
          setCurrentLobby(null);
          break;

        case 'error':
          console.error('❌ WebSocket Error:', data.message);
          alert(`Error: ${data.message}`);
          setShowMatchmaking(false);
          break;

        case 'round_result':
          break;

        case 'queue_joined':
          break;

        default:
          console.log("Unknown WebSocket message type:", data.type);
      }
    });

    return unsubscribe;
  }, [addMessageHandler, refreshBalance, selectedGame, selectedBet, user?.id, currentLobby]);


  // Автоматически покидать лобби при закрытии вкладки или размонтировании
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (currentLobby) {
        sendMessage({ action: 'leave_lobby', lobby_id: currentLobby.id });
      }
      // event.preventDefault(); // не работает в большинстве браузеров для TMA
      return null;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Также отправляем при размонтировании компонента (например, при выходе из игры)
      if (currentLobby) {
        sendMessage({ action: 'leave_lobby', lobby_id: currentLobby.id });
      }
    };
  }, [currentLobby, sendMessage]);
  
  if (loading) {
    return (
      <div className="bg-slate-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <div className="text-xl">Loading TBoard...</div>
        </div>
      </div>
    );
  }

  // === Обработчики Quick Play (старая очередь) ===
  const handleJoinQueue = () => {
    if (connectionStatus !== 'connected') {
      alert("WebSocket is not connected.");
      return;
    }
    if (!selectedGame || !selectedBet) {
      alert("Select game and bet.");
      return;
    }
    if (balance < selectedBet.value) {
      alert("Insufficient balance.");
      return;
    }
    const success = sendMessage({ 
      action: 'join_queue', 
      game_type: selectedGame.id, 
      stake: selectedBet.value 
    });
    if (success) {
      setShowGameSelect(false);
      setShowBetSelect(false);
      setShowMatchmaking(true);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setShowGameSelect(false);
    setShowBetSelect(true);
  };

  const handleBetSelect = (bet) => {
    setSelectedBet(bet);
    setShowBetSelect(false);
    handleJoinQueue();
  };

  // === Обработчики лобби ===
  const handleCreateLobbyGameSelect = (game) => {
    setSelectedGame(game);
    setShowCreateLobbyGameSelect(false);
    setShowCreateLobbyBetSelect(true);
  };

  const handleCreateLobbyBetSelect = (bet) => {
    setSelectedBet(bet);
    setShowCreateLobbyBetSelect(false);
    setShowPasswordPrompt(true);
  };

  
  const handlePasswordConfirm = () => {
    setIsCreatingLobby(true);
    sendMessage({
      action: 'create_lobby',
      game_type: selectedGame.id,
      stake: selectedBet.value,
      password: createLobbyPassword || undefined
    });
    setShowPasswordPrompt(false);
  };

  const handleJoinLobby = (lobby) => {
    if (lobby.has_password) {
      setPasswordModalLobby(lobby);
      setShowPasswordModal(true);
    } else {
      sendMessage({ action: 'join_lobby', lobby_id: lobby.id });
    }
  };

  const handlePasswordSubmit = (password) => {
    sendMessage({
      action: 'join_lobby',
      lobby_id: passwordModalLobby.id,
      password: password
    });
    setShowPasswordModal(false);
  };

  const handleLobbyLeave = () => {
    sendMessage({ action: 'leave_lobby', lobby_id: currentLobby.id });
    setCurrentLobby(null);
  };

  const handleLobbyKick = (targetId) => {
    sendMessage({
      action: 'kick_player',
      lobby_id: currentLobby.id,
      target_id: targetId
    });
  };

  const handleLobbyReadyToggle = (isReady) => {
    sendMessage({
      action: 'set_lobby_ready',
      lobby_id: currentLobby.id,
      is_ready: isReady
    });
  };

  const handleLobbyStart = () => {
    sendMessage({
      action: 'start_game',
      lobby_id: currentLobby.id
    });
  };

  // === Общие обработчики ===
  const handleMakeMove = (move) => {
    if (activeGame && connectionStatus === 'connected') {
      sendMessage({ 
        action: 'make_move', 
        game_id: activeGame.id, 
        move: move 
      });
    }
  };

  const handleExitGame = () => {
    if (window.confirm('Exit game? You will lose your bet.')) {
      setActiveGame(null);
      setSelectedGame(null);
      setSelectedBet(null);
    }
  };

  const handleCloseResult = () => {
    setGameResult(null);
    setSelectedGame(null);
    setSelectedBet(null);
    setActiveGame(null);
  };

  const handleShare = () => setShowShareModal(true);
  const handleProfileClick = () => setShowProfileModal(true);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralStats.link);
    alert('Referral link copied!');
  };
  const handleDisconnectWallet = async () => {
    await disconnect();
    setShowProfileModal(false);
  };
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    alert('Address copied!');
  };

  const getGameData = (gameId) => GAMES.find(g => g.id === gameId);

  if (!isConnected) {
    return <WelcomeScreen onConnect={connect} />;
  }

  // === Активная игра ===
  if (activeGame) {
    const GameComponent = GameComponents[activeGame.gameType];
    if (GameComponent) {
      return <GameComponent
        bet={activeGame.bet}
        gameId={activeGame.id}
        currentUserId={user?.id}
        opponentId={gameFoundData?.opponent_id}
        onExit={handleExitGame}
        onMakeMove={handleMakeMove}
        addMessageHandler={addMessageHandler}
      />;
    }
  }

  // === Комната лобби ===
  if (currentLobby) {
    return (
      <LobbyRoom
        lobby={currentLobby}
        currentUserId={user?.id}
        onLeave={handleLobbyLeave}
        onKick={handleLobbyKick}
        onReadyToggle={handleLobbyReadyToggle}
        onStartGame={handleLobbyStart}
        sendMessage={sendMessage}
      />
    );
  }

  // === Основной экран ===
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
        <div className="px-4 pb-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
            connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400'
            }`}></div>
            {connectionStatus === 'connected' ? 'Connected' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Disconnected'}
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

        {/* Quick Play */}
        <button
          onClick={() => setShowGameSelect(true)}
          disabled={connectionStatus !== 'connected'}
          className="w-full group relative px-6 py-4 rounded-xl font-bold overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
            <Gamepad2 className="w-6 h-6" />
            Quick Play
          </span>
        </button>

        {/* Create Game */}
        <button
          onClick={() => setShowCreateLobbyGameSelect(true)}
          disabled={connectionStatus !== 'connected'}
          className="w-full group relative px-6 py-4 rounded-xl font-bold overflow-hidden bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
            <Users className="w-6 h-6" />
            Create Game
          </span>
        </button>

        {/* Список лобби */}
        <LobbyList
          lobbies={lobbies}
          onJoin={handleJoinLobby}
          isCreating={isCreatingLobby}
        />
      </div>

      {/* === Модалы === */}
      
      {/* Quick Play: выбор игры */}
      {showGameSelect && (
        <ModalWrapper title="Choose Your Game" onClose={() => setShowGameSelect(false)}>
          <div className="grid grid-cols-2 gap-4">
            {GAMES.map((game) => (
              <GameButton key={game.id} game={game} onClick={() => handleGameSelect(game)} />
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* Quick Play: выбор ставки */}
      {showBetSelect && selectedGame && (
        <ModalWrapper title="" onClose={() => { setShowBetSelect(false); setSelectedGame(null); }}>
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

      {/* Create Game: выбор игры */}
      {showCreateLobbyGameSelect && (
        <ModalWrapper title="Choose Game" onClose={() => setShowCreateLobbyGameSelect(false)}>
          <div className="grid grid-cols-2 gap-4">
            {GAMES.map((game) => (
              <GameButton key={game.id} game={game} onClick={() => handleCreateLobbyGameSelect(game)} />
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* Create Game: выбор ставки */}
      {showCreateLobbyBetSelect && selectedGame && (
        <ModalWrapper title="" onClose={() => { setShowCreateLobbyBetSelect(false); setSelectedGame(null); }}>
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
                onClick={() => handleCreateLobbyBetSelect(bet)}
              />
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* Ввод пароля для лобби */}
      {showPasswordPrompt && selectedGame && selectedBet && (
        <ModalWrapper title="🔒 Set Password (Optional)" onClose={() => setShowPasswordPrompt(false)}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-4">Make your lobby private?</h2>
            <input
              type="password"
              value={createLobbyPassword}
              onChange={(e) => setCreateLobbyPassword(e.target.value)}
              placeholder="Leave empty for public"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500"
            />
          </div>
          <button
            onClick={handlePasswordConfirm}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-lg font-semibold"
          >
            Create Lobby
          </button>
        </ModalWrapper>
      )}

      {/* Матчмейкинг (Quick Play) */}
      {showMatchmaking && selectedGame && selectedBet && (
        <ModalWrapper
          title=""
          onClose={() => {
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

      {/* Результат игры */}
      {gameResult && (
        <GameResultModal
          winnerId={gameResult.winnerId}
          finalState={gameResult.finalState}
          currentUserId={user?.id}
          onClose={handleCloseResult}
        />
      )}

      {/* Пароль для присоединения */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        lobbyName={passwordModalLobby?.creator_name || 'Private Lobby'}
      />

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
  );
};

export default TBoardApp;