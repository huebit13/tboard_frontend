// src/components/PasswordModal.jsx
import { Key, X } from 'lucide-react';

const PasswordModal = ({ isOpen, onClose, onSubmit, lobbyName }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    if (password.trim()) {
      onSubmit(password);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Private Lobby</h3>
          <p className="text-gray-400 text-sm mt-1">
            Enter password to join <span className="text-cyan-400">{lobbyName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Lobby password"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            autoFocus
            required
          />
          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 py-3 rounded-xl font-semibold transition-all"
          >
            Join Lobby
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;