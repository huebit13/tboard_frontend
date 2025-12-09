// src/components/ShareModal.jsx
import { ArrowLeft, Users, Gift, Sparkles, Check, Copy } from 'lucide-react'

const ShareModal = ({
  isOpen,
  onClose,
  referralStats,
  onCopyLink
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
              Invite Friends
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 max-w-2xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-xl p-4">
              <Users className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold text-cyan-400">{referralStats.referrals}</div>
              <div className="text-sm text-gray-400">Friends Invited</div>
            </div>
            <div className="bg-slate-900 border-2 border-yellow-500/30 rounded-xl p-4">
              <Gift className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{referralStats.earned} TON</div>
              <div className="text-sm text-gray-400">Total Earned</div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-2">Your Referral Link</h3>
            <p className="text-sm text-gray-400 mb-4">
              Share this link with friends to earn rewards
            </p>

            <div className="bg-slate-800 rounded-lg p-4 mb-4 break-all">
              <code className="text-cyan-400 text-sm">{referralStats.link}</code>
            </div>

            <button
              onClick={onCopyLink}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copy Link
            </button>
          </div>

          {/* Rewards Info */}
          <div className="bg-slate-900 border-2 border-purple-500/30 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Referral Rewards
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="font-semibold text-cyan-400">Friend joins</div>
                  <div className="text-sm text-gray-400">Get 2 TON bonus instantly</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-blue-400">Friend plays first game</div>
                  <div className="text-sm text-gray-400">Get 10% of their bet amount</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div className="font-semibold text-purple-400">Lifetime earnings</div>
                  <div className="text-sm text-gray-400">Get 5% from all friend's games forever</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal