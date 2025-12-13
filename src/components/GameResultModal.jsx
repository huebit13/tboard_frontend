// src/components/GameResultModal.jsx
import { Trophy, TrendingDown, Coins, Sparkles } from 'lucide-react';

const GameResultModal = ({ winnerId, finalState, currency = 'TON', currentUserId, onClose }) => {
  const isWin = winnerId != null && currentUserId != null && String(winnerId) === String(currentUserId);
  const isDraw = winnerId == null;

  let resultText = "Draw";
  let amount = 0;

  if (isDraw) {
    resultText = "🤝 Draw!";
  } else if (isWin) {
    resultText = "🎉 Victory!";
  } else {
    resultText = "💔 Defeat";
  }

  // Временный расчет (должен приходить с бэка)
  if (finalState && finalState.game_stake) {
    if (isWin) {
      amount = finalState.game_stake * 2;
    } else if (isDraw) {
      amount = finalState.game_stake;
    } else {
      amount = 0;
    }
  }

  const safeAmount = typeof amount === 'number' ? amount : 0;

  // Иконка валюты
  const CurrencyIcon = currency === 'COINS' ? Sparkles : Coins;
  const currencyColor = currency === 'COINS' ? 'text-purple-400' : 'text-yellow-400';
  const currencyLabel = currency === 'COINS' ? 'Coins' : 'TON';

  if (!winnerId && winnerId !== null) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden">
        {/* Background effects */}
        <div
          className={`absolute inset-0 opacity-10 ${
            isWin
              ? 'bg-gradient-to-br from-green-500 to-emerald-500'
              : isDraw
              ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
              : 'bg-gradient-to-br from-red-500 to-rose-500'
          }`}
        ></div>

        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
              isWin
                ? 'bg-green-500/20'
                : isDraw
                ? 'bg-yellow-500/20'
                : 'bg-red-500/20'
            }`}
          >
            {isWin ? (
              <Trophy className="w-12 h-12 text-green-400" />
            ) : isDraw ? (
              <TrendingDown className="w-12 h-12 text-yellow-400" />
            ) : (
              <TrendingDown className="w-12 h-12 text-red-400" />
            )}
          </div>

          {/* Title */}
          <h2
            className={`text-4xl font-bold mb-4 ${
              isWin
                ? 'text-green-400'
                : isDraw
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {resultText}
          </h2>

          {/* Message */}
          <p className="text-gray-400 text-lg mb-6">
            {isDraw
              ? 'The game ended in a draw!'
              : isWin
              ? 'Congratulations! You won the game!'
              : 'Better luck next time!'}
          </p>

          {/* Amount */}
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-3">
              <CurrencyIcon
                className={`w-8 h-8 ${
                  isWin ? currencyColor : 'text-gray-400'
                }`}
              />
              <div>
                <div
                  className={`text-3xl font-bold ${
                    isWin ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {isWin || isDraw ? '+' : ''}
                  {currency === 'COINS' ? safeAmount.toFixed(0) : safeAmount.toFixed(2)} {currencyLabel}
                </div>
                <div className="text-sm text-gray-400">
                  {isWin
                    ? 'Added to your balance'
                    : isDraw
                    ? 'Bet returned'
                    : 'Lost in this game'}
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                isWin
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/50'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {isWin ? 'Claim Reward' : 'Back to Lobby'}
            </button>
          </div>

          {isWin && (
            <div className="mt-4 text-sm text-gray-400">
              Keep the winning streak going! 🔥
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameResultModal;