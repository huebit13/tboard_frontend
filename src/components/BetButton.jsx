import { Coins } from 'lucide-react'

export default function BetButton({ bet, canAfford, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!canAfford}
      className={`group border-2 rounded-xl p-4 transition-all transform ${
        canAfford
          ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 hover:border-yellow-500 hover:scale-105 cursor-pointer'
          : 'bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className={`text-2xl font-bold mb-1 ${canAfford ? 'text-yellow-400' : 'text-gray-600'}`}>
        {bet.value}
      </div>
      <div className="text-xs text-gray-400">TON</div>
    </button>
  )
}