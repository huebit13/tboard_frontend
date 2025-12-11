// src/hooks/useWebSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tboard.space';

export const useWebSocket = (token) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlersRef = useRef([]);
  const shouldReconnectRef = useRef(true);

  // Функция для добавления обработчиков сообщений
  const addMessageHandler = useCallback((handler) => {
    messageHandlersRef.current.push(handler);
    return () => {
      messageHandlersRef.current = messageHandlersRef.current.filter(h => h !== handler);
    };
  }, []);

  // Функция подключения
  const connect = useCallback(() => {
    if (!token) {
      console.log("No token provided, cannot connect WebSocket.");
      setConnectionStatus('disconnected');
      return;
    }

    // Закрываем существующее соединение если есть
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `${API_URL.replace('http', 'ws')}/ws/game?token=${token}`;
    console.log("Attempting to connect to WebSocket:", wsUrl);

    setConnectionStatus('connecting');
    const ws = new WebSocket(wsUrl);

    ws.onopen = (event) => {
      console.log("✅ WebSocket connected successfully");
      setConnectionStatus('connected');
      
      // Очищаем таймаут переподключения
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket message received:", data);
        
        // Вызываем все зарегистрированные обработчики
        messageHandlersRef.current.forEach(handler => {
          try {
            handler(data);
          } catch (err) {
            console.error("Error in message handler:", err);
          }
        });
      } catch (e) {
        console.error("❌ Error parsing WebSocket message:", e, event.data);
      }
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket disconnected: ${event.code} ${event.reason || '(no reason)'}`);
      setConnectionStatus('disconnected');
      wsRef.current = null;

      // Автоматическое переподключение через 3 секунды, если это не намеренное закрытие
      if (shouldReconnectRef.current && event.code !== 1000) {
        console.log("⏱️  Attempting to reconnect in 3 seconds...");
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = (event) => {
      console.error("❌ WebSocket error:", event);
      setConnectionStatus('disconnected');
    };

    wsRef.current = ws;
  }, [token]);

  // Подключаемся при монтировании или изменении токена
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      console.log("🧹 Cleaning up WebSocket connection.");
      shouldReconnectRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  }, [connect]);

  // Функция отправки сообщений
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("📤 Sending WebSocket message:", message);
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn("⚠️  WebSocket is not connected, cannot send message:", message);
      return false;
    }
  }, []);

  // Функция ручного переподключения
  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnect triggered");
    connect();
  }, [connect]);

  return { 
    connectionStatus, 
    sendMessage, 
    addMessageHandler,
    reconnect 
  };
};