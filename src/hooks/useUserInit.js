import { useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const useUserInit = () => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg?.initData) {
      console.log("No Telegram initData available")
      return
    }

    const sendInit = async () => {
      try {
        console.log("Sending init to backend...")
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData: tg.initData  // ← Отправляем весь initData
          })
        })
        
        const data = await response.json()
        console.log("Init response:", data)
        
        if (!response.ok) {
          console.error("Init failed:", data)
        }
      } catch (e) {
        console.error("Init user error:", e)
      }
    }

    sendInit()
  }, [])
}