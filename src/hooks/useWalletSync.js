// src/hooks/useWalletSync.js
import { useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useWalletSync = ({ isConnected, address, balance }) => {
  useEffect(() => {
    if (!isConnected || !address) return

    const syncWallet = async () => {
      try {
        const tg = window.Telegram?.WebApp
        if (!tg?.initDataUnsafe?.user) {
          console.log("No Telegram user data")
          return
        }

        console.log("Syncing wallet:", address, balance)
        
        const response = await fetch(`${API_URL}/api/wallet/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: tg.initDataUnsafe.user.id,
            ton_wallet_address: address,
            balance_ton: balance || 0
          })
        })
        
        const data = await response.json()
        console.log("Wallet sync response:", data)
        
        if (!response.ok) {
          console.error("Wallet sync failed:", data)
        }
      } catch (e) {
        console.error("Wallet sync error:", e)
      }
    }

    syncWallet()
  }, [isConnected, address, balance])
}