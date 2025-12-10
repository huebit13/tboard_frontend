// src/hooks/useWebSocket.js
import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tboard.space'; // Используем HTTPS

export const useWebSocket = (token, onMessage, onOpen, onClose, onError) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const wsRef = useRef(null);

  useEffect(() => {
    if (!token) {
      console.log("No token provided, cannot connect WebSocket.");
      setConnectionStatus('disconnected');
      return;
    }

    const wsUrl = `${API_URL.replace('http', 'ws')}/ws/game?token=${token}`;
    console.log("Attempting to connect to WebSocket:", wsUrl);

    setConnectionStatus('connecting');
    const ws = new WebSocket(wsUrl);

    ws.onopen = (event) => {
      console.log("WebSocket connected.");
      setConnectionStatus('connected');
      if (onOpen) onOpen(event);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error("Error parsing WebSocket message:", e, event.data);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      setConnectionStatus('disconnected');
      if (onClose) onClose(event);
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      setConnectionStatus('disconnected');
      if (onError) onError(event);
    };

    wsRef.current = ws;

    return () => {
      console.log("Cleaning up WebSocket connection.");
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [token, onMessage, onOpen, onClose, onError]);

  const sendMessage = (message) => {
    if (wsRef.current && connectionStatus === 'connected') {
      console.log("Sending WebSocket message:", message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected, cannot send message:", message);
    }
  };

  return { connectionStatus, sendMessage };
};
