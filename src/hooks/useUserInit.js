// src/hooks/useUserInit.js
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tboard.space'; // Используем HTTPS

export const useUserInit = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Добавим состояние загрузки

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initData) {
      console.log("No Telegram initData available");
      setLoading(false); // Убираем загрузку, если нет данных
      return;
    }

    const sendInit = async () => {
      try {
        console.log("Sending init to backend...");
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            initData: tg.initData
          })
        });

        const data = await response.json();
        console.log("Init response:", data);

        if (!response.ok) {
          console.error("Init failed:", data);
          // Возможно, стоит обработать ошибку иначе, например, показать сообщение пользователю
          // и не устанавливать token/user
        } else {
          if (data.access_token) {
            setToken(data.access_token);
            console.log("Token received and set.");
          } else {
            console.error("No access_token in login response:", data);
          }

          if (data.user) {
            setUser(data.user); // Сохраняем данные пользователя
            console.log("User data received and set.");
          } else {
            console.error("No user data in login response:", data);
          }
        }
      } catch (e) {
        console.error("Init user error:", e);
        // Обработка ошибки сети
      } finally {
          setLoading(false); // Убираем загрузку в любом случае после завершения запроса
      }
    };

    sendInit();
  }, []);

  return { token, user, loading }; // Возвращаем token, user и состояние загрузки
};