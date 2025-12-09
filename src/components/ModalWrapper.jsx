import { X } from 'lucide-react'

export default function ModalWrapper({ children, onClose, title, className = '' }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-slate-900 border-2 border-cyan-500 rounded-2xl p-6 max-w-md w-full relative ${className}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        {title && (
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}