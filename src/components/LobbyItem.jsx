import { Clock } from 'lucide-react'

export default function LobbyItem({ lobby, gameData, onJoin }) {
  return (
    <div className="group bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 rounded-xl p-4 transition-all transform hover:scale-102">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{gameData.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{gameData.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="text-xl">{lobby.avatar}</span>
                {lobby.player}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lobby.time}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">{lobby.bet}</div>
            <div className="text-xs text-gray-400">TON</div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all">
            Join
          </button>
        </div>
      </div>
    </div>
  )
}