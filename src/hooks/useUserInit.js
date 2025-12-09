import { useEffect } from 'react'

export const useUserInit = () => {
  useEffect(() => {
    const tg = window.Telegram.WebApp
    if (!tg?.initDataUnsafe?.user) return

    const sendInit = async () => {
      try {
        await fetch("https://tboard.space/users/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegram_id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username
          })
        })
      } catch (e) {
        console.error("Init user error:", e)
      }
    }

    sendInit()
  }, [])
}