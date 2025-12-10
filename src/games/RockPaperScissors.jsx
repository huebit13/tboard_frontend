// src/games/RockPaperScissors.jsx
import { useState, useEffect } from 'react';
import { Trophy, X, Clock, Zap } from 'lucide-react';

const RockPaperScissors = ({ bet, gameId, onExit, onMakeMove }) => {
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundResult, setRoundResult] = useState(null);
  const [isChoosing, setIsChoosing] = useState(true);
  const [showResult, setShowResult] = useState(false); // <-- Не используется в новой логике, можно удалить
  const [gameOver, setGameOver] = useState(false); // <-- Новое состояние для отключения выбора

  const choices = [
    { id: 'rock', emoji: '✊', name: 'Rock' },
    { id: 'paper', emoji: '✋', name: 'Paper' },
    { id: 'scissors', emoji: '✌️', name: 'Scissors' },
  ];

  // Таймер раунда
  useEffect(() => {
    let timer;
    if (isChoosing && timeLeft > 0 && !gameOver) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !myChoice && isChoosing && !gameOver) {
      // Автоматический выбор, если время вышло
      // NOTE: В реальной игре, если вы не выберете, возможно, вы проиграете раунд или игру.
      // Для простоты, сделаем случайный выбор.
      const randomChoice = choices[Math.floor(Math.random() * 3)].id;
      handleChoice(randomChoice);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isChoosing, myChoice, gameOver]);

  const handleChoice = (choiceId) => {
    if (!isChoosing || gameOver) return; // Блокируем выбор после игры или если уже выбрали

    setMyChoice(choiceId);
    setIsChoosing(false);

    // Отправляем ход на бэкенд через App
    if (gameId) {
      onMakeMove({ action: 'make_move', game_id: gameId, move: choiceId });
    } else {
      console.error("No game ID available to send move.");
    }
    // NOTE: Мы НЕ вызываем onGameEnd здесь.
    // Результат игры будет получен от бэкенда через WebSocket в App.jsx.
  };

  // Представим, что бэкенд отправил результат раунда (не финальный)
  // Это не реализовано в бэкенде, но для UI можно добавить.
  // const handleRoundResult = (result) => {
  //   setRoundResult(result);
  //   if (result === 'win') {
  //     setMyScore(prev => prev + 1);
  //   } else if (result === 'lose') {
  //     setOpponentScore(prev => prev + 1);
  //   }
  //   // Сброс для следующего раунда (временно)
  //   setTimeout(() => {
  //     setMyChoice(null);
  //     setOpponentChoice(null);
  //     setRoundResult(null);
  //     setIsChoosing(true);
  //     setTimeLeft(30);
  //   }, 3000);
  // };

  const getChoiceData = (choiceId) => {
    return choices.find((c) => c.id === choiceId);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-hidden"> {/* Убедитесь, что z-index высокий, но не выше GameResultModal при его открытии */}
      {/* Header */}
      <div className="bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            disabled={gameOver} // Блокируем кнопку выхода после завершения игры?
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Rock Paper Scissors
            </h2>
            <p className="text-xs text-gray-400">
              First to 3 wins • {bet} TON • Game ID: {gameId}
            </p>
          </div>
          <div className="w-10"></div> {/* Заглушка для выравнивания */}
        </div>
      </div>

      {/* Score Board */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* My Score */}
            <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">You</div>
              <div className="text-4xl font-bold text-cyan-400">{myScore}</div>
            </div>

            {/* Timer */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-400">{timeLeft}s</div>
            </div>

            {/* Opponent Score */}
            <div className="bg-slate-900 border-2 border-red-500 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-400 mb-2">Opponent</div>
              <div className="text-4xl font-bold text-red-400">{opponentScore}</div>
            </div>
          </div>

          {/* Round Result */}
          {roundResult && (
            <div className="text-center mb-6">
              <div
                className={`text-2xl font-bold mb-2 ${
                  roundResult === 'win'
                    ? 'text-green-400'
                    : roundResult === 'lose'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {roundResult === 'win'
                  ? '🎉 You Win Round!'
                  : roundResult === 'lose'
                  ? '😢 You Lose Round!'
                  : '🤝 Draw Round!'}
              </div>
            </div>
          )}

          {/* Choices Display */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* My Choice */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-3">Your Choice</div>
              <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-8">
                {myChoice ? (
                  <div>
                    <div className="text-7xl mb-2">
                      {getChoiceData(myChoice).emoji}
                    </div>
                    <div className="text-lg font-semibold text-cyan-400">
                      {getChoiceData(myChoice).name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-7xl mb-2">❓</div>
                    <div className="text-lg text-gray-500">Waiting...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Opponent Choice */}
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-3">Opponent's Choice</div>
              <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl p-8">
                {opponentChoice ? (
                  <div>
                    <div className="text-7xl mb-2">
                      {getChoiceData(opponentChoice).emoji}
                    </div>
                    <div className="text-lg font-semibold text-red-400">
                      {getChoiceData(opponentChoice).name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-7xl mb-2">❓</div>
                    <div className="text-lg text-gray-500">Waiting...</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Choice Buttons */}
          {isChoosing && !myChoice && !gameOver && ( // Добавлено !gameOver
            <div className="grid grid-cols-3 gap-4">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  disabled={gameOver} // Блокируем кнопки после завершения игры
                  className="bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 rounded-xl p-6 transition-all transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-6xl mb-3">{choice.emoji}</div>
                  <div className="text-lg font-semibold group-hover:text-cyan-400 transition-colors">
                    {choice.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {myChoice && !roundResult && !gameOver && ( // Добавлено !gameOver
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-slate-900 px-6 py-3 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-gray-400">
                  Waiting for opponent's move...
                </span>
              </div>
            </div>
          )}

          {gameOver && ( // Отображаем сообщение после завершения игры
            <div className="text-center mt-4">
              <p className="text-gray-400">Game Over. Waiting for final result...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;