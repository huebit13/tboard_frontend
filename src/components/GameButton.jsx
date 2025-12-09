export default function GameButton({ game, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-cyan-500 rounded-xl p-6 transition-all transform hover:scale-105 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="text-5xl mb-3">{game.icon}</div>
      <h3 className="font-bold text-sm">{game.name}</h3>
    </button>
  )
}