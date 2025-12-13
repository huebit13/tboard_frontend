// src/components/ProfileModal.jsx
import { ArrowLeft, Wallet, Gamepad2, Trophy, Coins, Clock, Copy, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { useState } from 'react'

const ProfileModal = ({
  isOpen,
  onClose,
  userProfile,
  address,
  formattedAddress,
  balance,
  coinBalance = 0,
  balanceLoading,
  coinLoading = false,
  userStats,
  onCopyAddress,
  onDisconnectWallet,
  getGameData
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      <div className="min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 z-10">
          <div className="px-4 py-4 flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Profile
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 max-w-2xl mx-auto">
          {/* User Card */}
          <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-xl p-6 mb-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-4xl mx-auto mb-4">
              {userProfile.avatar}
            </div>
            <h3 className="text-2xl font-bold mb-2">{userProfile.name}</h3>
            {address ? (
              <div className="flex items-center justify-center gap-2 bg-slate-800 px-4 py-2 rounded-lg mb-4 max-w-xs mx-auto">
                <Wallet className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="text-sm text-gray-400 break-all">{formattedAddress}</span>
                <button
                  onClick={onCopyAddress}
                  className="p-1 hover:bg-slate-700 rounded transition-all flex-shrink-0"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            ) : null}
            
            {/* Балансы */}
            <div className="flex items-center justify-center gap-4">
              {/* TON Balance */}
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold">
                  {balanceLoading ? '...' : balance.toFixed(2)} TON
                </span>
              </div>
              
              {/* Coin Balance */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/50 to-fuchsia-900/50 px-4 py-2 rounded-lg border border-purple-500/30">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-lg font-bold text-purple-400">
                  {coinLoading ? '...' : coinBalance.toFixed(0)} Coins
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-xl font-bold">{userStats.gamesPlayed}</div>
              <div className="text-xs text-gray-400">Games</div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold">{userStats.winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center">
              <Coins className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold">{userStats.totalEarned}</div>
              <div className="text-xs text-gray-400">Earned</div>
            </div>
          </div>

          {/* Game History */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Recent Games
            </h3>
            <div className="space-y-3">
              {userStats.gameHistory.map((game) => {
                const gameData = getGameData(game.game) || { icon: '❓', name: 'Unknown' };
                return (
                  <div key={game.id} className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{gameData.icon}</div>
                      <div>
                        <div className="font-semibold text-sm">{gameData.name}</div>
                        <div className="text-xs text-gray-400">{game.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Bet: {game.bet} TON</div>
                      <div className={`font-bold flex items-center gap-1 justify-end ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                        {game.result === 'win' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {game.amount > 0 ? '+' : ''}{game.amount} TON
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={onDisconnectWallet}
            className="w-full px-6 py-3 bg-red-500/20 border-2 border-red-500 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal