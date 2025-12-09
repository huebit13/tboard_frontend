import { useState } from 'react'
import { Wallet, Gamepad2, Zap, Coins, Trophy } from 'lucide-react'

export default function WelcomeScreen({ onConnect }) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans overflow-hidden relative flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center animate-pulse-glow">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
          TBoard
        </h1>

        <p className="text-xl text-gray-400 mb-8">
          Challenge players in exciting mini-games and win TON rewards
        </p>

        <div className="bg-slate-900/50 backdrop-blur border border-cyan-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4 text-left mb-4">
            <Gamepad2 className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-cyan-400 mb-1">Multiple Games</h3>
              <p className="text-sm text-gray-400">Choose from Dice, Coin Flip, RPS and more</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left mb-4">
            <Zap className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-400 mb-1">Instant Matches</h3>
              <p className="text-sm text-gray-400">Quick matchmaking with real players</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left">
            <Coins className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-400 mb-1">Real Rewards</h3>
              <p className="text-sm text-gray-400">Win TON crypto in every game</p>
            </div>
          </div>
        </div>

        <button
          onClick={onConnect}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="w-full group relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105 mb-4"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Wallet className="w-6 h-6" />
            Connect Wallet
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <p className="text-xs text-gray-500">
          Connect your TON wallet to start playing
        </p>
      </div>
    </div>
  )
}