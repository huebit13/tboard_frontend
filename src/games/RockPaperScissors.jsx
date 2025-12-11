import { useState, useEffect } from 'react';
import { X, Clock, Zap } from 'lucide-react';

const RockPaperScissors = ({ bet, gameId, onExit, onMakeMove, currentUserId, opponentId, addMessageHandler }) => {
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isChoosing, setIsChoosing] = useState(true);
  const [waitingForResult, setWaitingForResult] = useState(false);

  const choices = [
    { id: 'rock', emoji: '✊', name: 'Rock' },
    { id: 'paper', emoji: '✋', name: 'Paper' },
    { id: 'scissors', emoji: '✌️', name: 'Scissors' },
  ];

  // Слушаем WebSocket сообщения
  useEffect(() => {
    if (!addMessageHandler) return;

    const unsubscribe = addMessageHandler((data) => {
      console.log('RPS received message:', data);

      if (data.type === 'game_result' && data.game_id === gameId) {
        // Игра завершена - показываем финальный результат
        const moves = data.final_state?.moves || {};
        setMyChoice(moves.player1 || moves.player2); // Один из них точно есть
        setOpponentChoice(moves.player2 || moves.player1);
        setWaitingForResult(false);
        setIsChoosing(false);
      }
    });

    return unsubscribe;
  }, [addMessageHandler, gameId]);

  // Таймер раунда
  useEffect(() => {
    if (!isChoosing || myChoice || waitingForResult) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !myChoice) {
      // Автовыбор при истечении времени
      const randomChoice = choices[Math.floor(Math.random() * 3)].id;
      handleChoice(randomChoice);
    }
  }, [timeLeft, isChoosing, myChoice, waitingForResult]);

  const handleChoice = (choiceId) => {
    if (!isChoosing || myChoice || waitingForResult) return;

    console.log('📤 Making choice:', choiceId);
    setMyChoice(choiceId);
    setIsChoosing(false);
    setWaitingForResult(true);

    // Отправляем ход (без обёртки в объект action)
    onMakeMove(choiceId);
  };

  const getChoiceData = (choiceId) => {
    return choices.find((c) => c.id === choiceId);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-40 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Rock Paper Scissors
            </h2>
            <p className="text-xs text-gray-400">
              {bet} TON • Game ID: {gameId}
            </p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Timer */}
          <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center mb-6">
            <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-yellow-400">{timeLeft}s</div>
          </div>

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
                    <div className="text-lg text-gray-500">Choose...</div>
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
          {isChoosing && !myChoice && (
            <div className="grid grid-cols-3 gap-4">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  className="bg-slate-900 border-2 border-slate-700 hover:border-cyan-500 rounded-xl p-6 transition-all transform hover:scale-105 group"
                >
                  <div className="text-6xl mb-3">{choice.emoji}</div>
                  <div className="text-lg font-semibold group-hover:text-cyan-400 transition-colors">
                    {choice.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {waitingForResult && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-slate-900 px-6 py-3 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-gray-400">
                  Waiting for opponent's move...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RockPaperScissors;