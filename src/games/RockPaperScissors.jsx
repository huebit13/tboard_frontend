import { useState, useEffect, useRef } from 'react';
import { X, Clock, Zap } from 'lucide-react';

const RockPaperScissors = ({ 
  bet, 
  gameId, 
  onExit, 
  onMakeMove, 
  currentUserId, 
  opponentId, 
  addMessageHandler 
}) => {
  const [myChoice, setMyChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isChoosing, setIsChoosing] = useState(true);
  const [waitingForResult, setWaitingForResult] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false); // 🔑 Ключевая переменная
  const [currentScore, setCurrentScore] = useState({ player1: 0, player2: 0 });
  const roundTimeoutRef = useRef(null);

  const choices = [
    { id: 'rock', emoji: '✊', name: 'Rock' },
    { id: 'paper', emoji: '✋', name: 'Paper' },
    { id: 'scissors', emoji: '✌️', name: 'Scissors' },
  ];

  const getPlayerRole = (userId) => {
    return userId < opponentId ? 'player1' : 'player2';
  };

  const myRole = getPlayerRole(currentUserId);
  const opponentRole = myRole === 'player1' ? 'player2' : 'player1';

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (roundTimeoutRef.current) {
        clearTimeout(roundTimeoutRef.current);
      }
    };
  }, []);

  // Слушаем WebSocket сообщения ТОЛЬКО для этой игры
  useEffect(() => {
    if (!addMessageHandler) return;

    const unsubscribe = addMessageHandler((data) => {
      if (data.game_id !== gameId) return;

      switch (data.type) {
        case 'round_result':
          console.log('🧮 RPS round result:', data);

          // Обновляем счёт немедленно
          setCurrentScore(data.score || { player1: 0, player2: 0 });

          const moves = data.moves || {};
          setMyChoice(moves[myRole] || null);
          setOpponentChoice(moves[opponentRole] || null);

          setWaitingForResult(false);
          setIsChoosing(false);
          setRoundFinished(true); // 🔒 Блокируем ходы

          const myScore = data.score?.[myRole] || 0;
          const opponentScore = data.score?.[opponentRole] || 0;

          // Если игра завершена — не запускаем новый раунд
          if (myScore >= 3 || opponentScore >= 3) {
            return;
          }

          // Начинаем новый раунд через 2 секунды
          if (roundTimeoutRef.current) {
            clearTimeout(roundTimeoutRef.current);
          }
          roundTimeoutRef.current = setTimeout(() => {
            setMyChoice(null);
            setOpponentChoice(null);
            setIsChoosing(true);
            setWaitingForResult(false);
            setRoundFinished(false); // ✅ Разблокируем
            setTimeLeft(30);
          }, 2000);
          break;

        case 'game_result':
          console.log('🏆 RPS game result:', data);
          const finalMoves = data.final_state?.moves || {};
          setMyChoice(finalMoves[myRole] || null);
          setOpponentChoice(finalMoves[opponentRole] || null);
          setWaitingForResult(false);
          setIsChoosing(false);
          setRoundFinished(true);
          break;

        default:
          break;
      }
    });

    return unsubscribe;
  }, [addMessageHandler, gameId, currentUserId, opponentId, myRole, opponentRole]);

  // Таймер для выбора хода
  useEffect(() => {
    if (!isChoosing || myChoice || waitingForResult || roundFinished) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      const randomChoice = choices[Math.floor(Math.random() * 3)].id;
      handleChoice(randomChoice);
    }
  }, [timeLeft, isChoosing, myChoice, waitingForResult, roundFinished]);

  const handleChoice = (choiceId) => {
    // 🔒 Главная защита от повторных ходов
    if (!isChoosing || myChoice || waitingForResult || roundFinished) {
      console.warn('Choice blocked: roundFinished=', roundFinished, 'myChoice=', myChoice);
      return;
    }

    setMyChoice(choiceId);
    setIsChoosing(false);
    setWaitingForResult(true);
    onMakeMove(choiceId);
  };

  const getChoiceData = (choiceId) => {
    return choices.find((c) => c.id === choiceId) || { emoji: '❓', name: 'Unknown' };
  };

  const myScore = currentScore[myRole] || 0;
  const opponentScore = currentScore[opponentRole] || 0;

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
            {/* Счёт — теперь всегда виден */}
            <div className="flex justify-center gap-4 mt-1 text-sm font-medium">
              <span className={myScore >= 3 ? 'text-green-400 font-bold' : 'text-white'}>
                You: {myScore}
              </span>
              <span>•</span>
              <span className={opponentScore >= 3 ? 'text-red-400 font-bold' : 'text-white'}>
                Opponent: {opponentScore}
              </span>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Timer — показываем только если раунд активен */}
          {isChoosing && !myChoice && !roundFinished && (
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-center mb-6">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-yellow-400">{timeLeft}s</div>
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
                    <div className="text-7xl mb-2">{getChoiceData(myChoice).emoji}</div>
                    <div className="text-lg font-semibold text-cyan-400">
                      {getChoiceData(myChoice).name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-7xl mb-2">❓</div>
                    <div className="text-lg text-gray-500">
                      {isChoosing ? 'Choose...' : 'Waiting...'}
                    </div>
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
                    <div className="text-7xl mb-2">{getChoiceData(opponentChoice).emoji}</div>
                    <div className="text-lg font-semibold text-red-400">
                      {getChoiceData(opponentChoice).name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-7xl mb-2">❓</div>
                    <div className="text-lg text-gray-500">
                      {waitingForResult ? 'Thinking...' : 'Waiting...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Choice Buttons — показываем ТОЛЬКО если раунд активен */}
          {isChoosing && !myChoice && !roundFinished && (
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

          {/* Показываем статус после раунда */}
          {roundFinished && !isChoosing && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-slate-900 px-6 py-3 rounded-lg border border-yellow-500/30">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">
                  {myScore >= 3 || opponentScore >= 3 
                    ? 'Game finished!' 
                    : 'Next round starts soon...'}
                </span>
              </div>
            </div>
          )}

          {waitingForResult && !roundFinished && (
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