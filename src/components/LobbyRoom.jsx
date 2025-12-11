// src/components/LobbyRoom.jsx
import { useState, useEffect } from 'react';
import { Users, Lock, Unlock, Check, X, UserMinus, Play, Gamepad2, Coins } from 'lucide-react';
import { GAMES } from '../../constants/games';

const LobbyRoom = ({ 
  lobby, 
  currentUserId, 
  onLeave, 
  onKick, 
  onReadyToggle, 
  onStartGame,
  sendMessage 
}) => {
  const [copied, setCopied] = useState(false);
  const isOwner = lobby.creatorId === currentUserId;
  const amIReady = lobby.players.find(p => p.id === currentUserId)?.ready || false;
  const opponent = lobby.players.find(p => p.id !== currentUserId);
  const bothReady = lobby.players.every(p => p.ready);

  const game = GAMES.find(g => g.id === lobby.gameType);

  const copyInvite = () => {
    const url = `https://t.me/tboard_bot?start=lobby_${lobby.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      sendMessage({ action: 'leave_lobby', lobby_id: lobby.id });
    };
  }, [lobby.id, sendMessage]);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={onLeave}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {game?.name || lobby.gameType}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">{lobby.bet} TON</span>
              {lobby.hasPassword ? (
                <Lock className="w-4 h-4 text-yellow-500" />
              ) : (
                <Unlock className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          {isOwner && (
            <button
              onClick={copyInvite}
              className="text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg"
            >
              {copied ? 'Copied!' : 'Invite'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Players */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5" /> Players ({lobby.players.length}/2)
            </h3>
            {isOwner && opponent && (
              <button
                onClick={() => onKick(opponent.id)}
                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
              >
                <UserMinus className="w-4 h-4" /> Kick
              </button>
            )}
          </div>

          <div className="space-y-3">
            {lobby.players.map((player) => (
              <div
                key={player.id}
                className="bg-slate-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {player.id === currentUserId ? 'You' : 'Opponent'}
                    </div>
                    <div className="text-xs text-gray-400">ID: {player.id}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 ${player.ready ? 'text-green-400' : 'text-gray-500'}`}>
                  {player.ready && <Check className="w-5 h-5" />}
                  <span className="text-sm">{player.ready ? 'Ready' : 'Not Ready'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready / Start */}
        <div className="space-y-4">
          {!amIReady ? (
            <button
              onClick={() => onReadyToggle(true)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 rounded-xl font-semibold"
            >
              ✅ Ready
            </button>
          ) : (
            <button
              onClick={() => onReadyToggle(false)}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-gray-300"
            >
              ❌ Not Ready
            </button>
          )}

          {isOwner && bothReady && (
            <button
              onClick={onStartGame}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:shadow-lg hover:shadow-purple-500/30 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Start Game
            </button>
          )}

          <button
            onClick={onLeave}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-gray-400"
          >
            Leave Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyRoom;