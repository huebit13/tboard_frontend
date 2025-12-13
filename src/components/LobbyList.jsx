// src/components/LobbyList.jsx
import { Lock, Unlock, Users, Coins, Sparkles } from 'lucide-react';
import { GAMES } from '../../constants/games';

const LobbyList = ({ lobbies, onJoin, isCreating }) => {
  const getGameIcon = (gameType) => {
    const game = GAMES.find(g => g.id === gameType);
    return game ? game.icon : '❓';
  };

  if (isCreating) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-gray-400">Creating your lobby...</p>
      </div>
    );
  }

  if (!lobbies || lobbies.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500">No active lobbies yet</p>
        <p className="text-sm text-gray-400 mt-1">Create one or wait for others!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {lobbies.map((lobby) => {
        const CurrencyIcon = lobby.currency === 'COINS' ? Sparkles : Coins;
        const currencyColor = lobby.currency === 'COINS' ? 'text-purple-400' : 'text-yellow-400';
        const currencyLabel = lobby.currency === 'COINS' ? 'Coins' : 'TON';

        return (
          <div
            key={lobby.id}
            className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700 transition-all cursor-pointer"
            onClick={() => onJoin(lobby)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getGameIcon(lobby.game_type)}</div>
                <div>
                  <div className="font-semibold text-white">{lobby.creator_name || 'Player'}</div>
                  <div className={`text-sm flex items-center gap-1 mt-1 ${currencyColor}`}>
                    <CurrencyIcon className="w-3 h-3" />
                    {lobby.stake} {currencyLabel}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs bg-slate-700 px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  {lobby.players_count}/2
                </div>
                {lobby.has_password ? (
                  <Lock className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LobbyList;