// src/components/CurrencySelector.jsx
import { Coins, Sparkles } from 'lucide-react';

const CurrencySelector = ({ selected, onSelect, tonBalance, coinBalance }) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-400 mb-2 text-center">Select Currency</p>
      <div className="grid grid-cols-2 gap-3">
        {/* TON */}
        <button
          onClick={() => onSelect('TON')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selected === 'TON'
              ? 'border-yellow-500 bg-yellow-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coins className={`w-5 h-5 ${selected === 'TON' ? 'text-yellow-400' : 'text-gray-400'}`} />
            <span className={`font-bold ${selected === 'TON' ? 'text-yellow-400' : 'text-gray-300'}`}>
              TON
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Balance: {tonBalance.toFixed(2)}
          </div>
        </button>

        {/* COINS */}
        <button
          onClick={() => onSelect('COINS')}
          className={`p-4 rounded-xl border-2 transition-all ${
            selected === 'COINS'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-slate-700 bg-slate-800 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className={`w-5 h-5 ${selected === 'COINS' ? 'text-purple-400' : 'text-gray-400'}`} />
            <span className={`font-bold ${selected === 'COINS' ? 'text-purple-400' : 'text-gray-300'}`}>
              Coins
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Balance: {coinBalance.toFixed(0)}
          </div>
        </button>
      </div>
    </div>
  );
};

export default CurrencySelector;