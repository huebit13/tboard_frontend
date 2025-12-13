// src/components/DailyBonusModal.jsx
import { useState, useEffect } from 'react';
import { Gift, X, Sparkles, Calendar, TrendingUp, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tboard.space';

const DailyBonusModal = ({ isOpen, onClose, token, onClaimed }) => {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && token) {
      fetchStatus();
    }
  }, [isOpen, token]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/coins/daily-reward/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching daily reward status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/coins/daily-reward`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to claim reward');
      }

      setRewardData(data);
      setClaimed(true);
      
      // Обновляем баланс коинов в родительском компоненте
      if (onClaimed) {
        onClaimed();
      }

      // Автозакрытие через 3 секунды после успешного получения
      setTimeout(() => {
        onClose();
        setClaimed(false);
        setRewardData(null);
      }, 3000);
    } catch (err) {
      console.error('Error claiming daily reward:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-2xl w-full max-w-md p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Daily Bonus
            </h2>
            <p className="text-gray-400 mt-2">
              Claim your daily reward and build your streak!
            </p>
          </div>

          {/* Loading */}
          {loading && !claimed && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-gray-400 mt-3">Loading...</p>
            </div>
          )}

          {/* Error */}
          {error && !claimed && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Status - можно забрать */}
          {!loading && !claimed && status && status.can_claim_today && (
            <>
              {/* Streak Info */}
              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-gray-400">Current Streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-cyan-400">
                      {status.current_streak}
                    </span>
                    <span className="text-sm text-gray-400">days</span>
                  </div>
                </div>
                
                {/* Reward Preview */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-lg p-3">
                  <span className="text-sm text-gray-300">Today's Reward</span>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-xl font-bold text-purple-400">
                      +{status.next_reward.toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-400">Coins</span>
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-xl font-bold text-white text-lg shadow-lg shadow-yellow-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <Gift className="w-6 h-6" />
                  Claim Reward
                </span>
              </button>

              {/* Bonus Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Keep your streak to earn bonus coins! 🔥
                </p>
              </div>
            </>
          )}

          {/* Already Claimed Today */}
          {!loading && !claimed && status && !status.can_claim_today && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">
                Already Claimed!
              </h3>
              <p className="text-gray-400 mb-4">
                You've already claimed your reward today.
              </p>
              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm text-gray-400">Current Streak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-cyan-400">
                      {status.current_streak}
                    </span>
                    <span className="text-sm text-gray-400">days</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Come back tomorrow for your next reward! 🎁
              </p>
            </div>
          )}

          {/* Success State */}
          {claimed && rewardData && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                Reward Claimed!
              </h3>
              <div className="bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-xl p-6 mb-4">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  +{rewardData.coins_earned.toFixed(0)}
                </div>
                <div className="text-sm text-gray-400">Coins Added</div>
              </div>
              <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">
                  {rewardData.streak_days} Day Streak! 🔥
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Keep it up to earn even more!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyBonusModal;