import { useEffect } from 'react'

export const useWalletSync = ({ isConnected, address, balance }) => {
  useEffect(() => {
    if (!isConnected || !address) return

    const syncWallet = async () => {
      try {
        const tg = window.Telegram.WebApp
        await fetch("https://tboard.space/users/wallet/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: tg.initDataUnsafe.user.id,
            ton_wallet_address: address,
            balance_ton: balance || 0
          })
        })
        console.log("Wallet synced:", address)
      } catch (e) {
        console.error("Wallet sync error:", e)
      }
    }

    syncWallet()
  }, [isConnected, address, balance])
}