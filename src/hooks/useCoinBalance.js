// src/hooks/useCoinBalance.js
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.tboard.space';

export const useCoinBalance = (token) => {
  const [coinBalance, setCoinBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async () => {
    if (!token) {
      setCoinBalance(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/coins/balance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.balance !== undefined) {
        setCoinBalance(parseFloat(data.balance));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching coin balance:', err);
      setError(err.message);
      setCoinBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBalance();
      
      // Автообновление каждые 10 секунд
      const interval = setInterval(() => {
        fetchBalance();
      }, 10000);

      return () => clearInterval(interval);
    } else {
      setCoinBalance(0);
      setError(null);
    }
  }, [token]);

  return {
    coinBalance,
    loading,
    error,
    refreshCoinBalance: fetchBalance
  };
};