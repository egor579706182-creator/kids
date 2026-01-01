
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface GameProps {
  onClose: () => void;
}

const Games: React.FC<GameProps> = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState<'camera' | 'recognition' | 'math' | null>(null);

  return (
    <div className="fixed inset-0 bg-[#f9f7f2] z-[60] overflow-y-auto p-4 sm:p-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight nyt-font">Игровая площадка</h2>
          <button onClick={onClose} className="text-xs font-black uppercase border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
            Закрыть
          </button>
        </div>

        {!activeGame ? (
          <div className="grid grid-cols-1 gap-6">
            <button 
              onClick={() => setActiveGame('camera')}
              className="group border border-black bg-white p-8 text-left hover:shadow-xl transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Игра 1</span>
              <h3 className="text-2xl font-black uppercase mb-4 underline decoration-1 underline-offset-4">Повторяй за мной</h3>
              <p className="font-serif italic text-gray-600">Задания на имитацию с использованием фронтальной камеры. Развиваем схему тела и внимание.</p>
            </button>

            <button 
              onClick={() => setActiveGame('recognition')}
              className="group border border-black bg-white p-8 text-left hover:shadow-xl transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Игра 2</span>
              <h3 className="text-2xl font-black uppercase mb-4 underline decoration-1 underline-offset-4">Мир предметов</h3>
              <p className="font-serif italic text-gray-600">Распознавание цветов и категорий. Ищем нужные предметы среди множества других.</p>
            </button>

            <button 
              onClick={() => setActiveGame('math')}
              className="group border border-black bg-white p-8 text-left hover:shadow-xl transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Игра 3 (AI)</span>
              <h3 className="text-2xl font-black uppercase mb-4 underline decoration-1 underline-offset-4">Математика на пальцах</h3>
              <p className="font-serif italic text-gray-600">Решаем примеры и показываем ответ на пальцах. AI анализирует жесты через камеру.</p>
            </button>
          </div>
        ) : activeGame === 'camera' ? (
          <CameraGame onBack={() => setActiveGame(null)} />
        ) : activeGame === 'recognition' ? (
          <RecognitionGame onBack={() => setActiveGame(null)} />
        ) : (
          <FingerMathGame onBack={() => setActiveGame(null)} />
        )}
      </div>
    </div>
  );
};

const CameraGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTask, setCurrentTask] = useState(0);
  const [feedback, setFeedback] = useState<'success' | null>(null);
  const [facingMode, setFacingMode] = useState<VideoFacingModeEnum>('user');
  
  const tasks = [
    "Покажи нос",
    "Покажи глаза",
    "Подними одну руку",
    "Подними две руки",
    "Покажи ушки"
  ];

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const startStream = (mode: VideoFacingModeEnum) => {
    stopStream();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Camera error:", err));
  };

  useEffect(() => {
    startStream(facingMode);
    return () => stopStream();
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const triggerSuccess = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);

    setFeedback('success');
    setTimeout(() => {
      setFeedback(null);
      setCurrentTask((prev) => (prev + 1) % tasks.length);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[10px] font-black uppercase">← Назад</button>
        <button 
          onClick={toggleCamera}
          className="text-[10px] font-black uppercase border border-black px-2 py-1 bg-white hover:bg-black hover:text-white transition-all"
        >
          {facingMode === 'user' ? 'Основная' : 'Селфи'}
        </button>
      </div>
      
      <div className="relative aspect-video bg-black border-4 border-black overflow-hidden shadow-2xl rounded-sm">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover" 
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        {feedback === 'success' && (
          <div className="absolute inset-0 bg-green-500/30 animate-pulse border-8 border-green-500 z-10 pointer-events-none" />
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-white border-2 border-black p-6 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Задание для ребенка:</p>
          <p className="text-3xl font-black uppercase tracking-tight nyt-font leading-tight">{tasks[currentTask]}</p>
        </div>

        <div className="bg-white border border-black p-6 text-center shadow-sm">
          <p className="font-serif italic text-sm mb-4 text-gray-600">Родитель: подтвердите выполнение</p>
          <button 
            onClick={triggerSuccess}
            className="w-full bg-[#121212] text-white p-5 font-black uppercase tracking-[0.2em] text-lg hover:bg-black active:scale-[0.98] transition-all"
          >
            Верно выполнено!
          </button>
        </div>
      </div>
    </div>
  );
};

const RecognitionGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [level, setLevel] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const levels = [
    {
      task: "Выбери все синие предметы",
      items: [
        { id: 1, type: 'square', color: 'blue', label: 'Синий кубик' },
        { id: 2, type: 'square', color: 'red', label: 'Красный кубик' },
        { id: 3, type: 'circle', color: 'blue', label: 'Синий круг' },
        { id: 4, type: 'triangle', color: 'yellow', label: 'Желтый треугольник' },
      ],
      correctIds: [1, 3]
    },
    {
      task: "Найди лошадку",
      items: [
        { id: 1, type: 'animal', label: 'Котик', icon: '🐱' },
        { id: 2, type: 'animal', label: 'Лошадка', icon: '🐴' },
        { id: 3, type: 'animal', label: 'Собачка', icon: '🐶' },
        { id: 4, type: 'animal', label: 'Птичка', icon: '🐦' },
      ],
      correctIds: [2]
    },
    {
        task: "Выбери только круглые фигуры",
        items: [
          { id: 1, type: 'shape', label: 'Круг', icon: '⭕' },
          { id: 2, type: 'shape', label: 'Квадрат', icon: '⬜' },
          { id: 3, type: 'shape', label: 'Мячик', icon: '⚽' },
          { id: 4, type: 'shape', label: 'Книжка', icon: '📖' },
        ],
        correctIds: [1, 3]
      }
  ];

  const currentLevel = levels[level % levels.length];

  const toggleSelect = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
    setIsCorrect(null);
  };

  const checkResult = () => {
    const sortedSelected = [...selected].sort();
    const sortedCorrect = [...currentLevel.correctIds].sort();
    const correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    
    setIsCorrect(correct);
    if (correct) {
      setTimeout(() => {
        setLevel(prev => prev + 1);
        setSelected([]);
        setIsCorrect(null);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-[10px] font-black uppercase">← Назад</button>
        <div className="h-[1px] flex-grow bg-black"></div>
      </div>

      <div className="bg-white border-2 border-black p-8 text-center mb-8 relative">
        {isCorrect === true && <div className="absolute inset-0 bg-green-500/20 z-10 animate-pulse pointer-events-none" />}
        {isCorrect === false && <div className="absolute inset-0 bg-red-500/10 z-10 pointer-events-none" />}
        
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Задание:</p>
        <h3 className="text-3xl font-black uppercase nyt-font tracking-tight">{currentLevel.task}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {currentLevel.items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleSelect(item.id)}
            className={`aspect-square border-2 p-4 flex flex-col items-center justify-center transition-all ${
              selected.includes(item.id) 
              ? 'border-black bg-gray-50 scale-[0.98] shadow-inner' 
              : 'border-gray-100 bg-white hover:border-gray-300'
            }`}
          >
            {item.icon ? (
              <span className="text-6xl mb-2">{item.icon}</span>
            ) : (
              <div 
                className={`w-16 h-16 mb-4 ${item.type === 'circle' ? 'rounded-full' : ''}`} 
                style={{ backgroundColor: item.color }} 
              />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      <button 
        onClick={checkResult}
        className={`w-full p-4 font-black uppercase tracking-widest transition-all mt-8 ${
          selected.length > 0 ? 'bg-black text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        }`}
      >
        Проверить
      </button>
    </div>
  );
};

const FingerMathGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [problem, setProblem] = useState({ text: '1 + 1', answer: 2 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'fail' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<VideoFacingModeEnum>('user');

  useEffect(() => {
    generateProblem();
    startStream(facingMode);
    return () => stopStream();
  }, [facingMode]);

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const startStream = (mode: VideoFacingModeEnum) => {
    stopStream();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error("Camera error:", err);
        setErrorMessage("Ошибка доступа к камере.");
      });
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const generateProblem = () => {
    const isAddition = Math.random() > 0.5;
    let a, b, answer;
    if (isAddition) {
      answer = Math.floor(Math.random() * 5) + 1; 
      a = Math.floor(Math.random() * answer);
      b = answer - a;
    } else {
      a = Math.floor(Math.random() * 4) + 2; 
      b = Math.floor(Math.random() * (a - 1)) + 1;
      answer = a - b;
    }
    setProblem({ text: `${a} ${isAddition ? '+' : '-'} ${b} = ?`, answer });
    setFeedback(null);
    setErrorMessage(null);
  };

  const playFeedbackSound = (type: 'success' | 'fail') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1); 
      } else {
        osc.frequency.setValueAtTime(261.63, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(130.81, audioCtx.currentTime + 0.2); 
      }
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  };

  const analyzeGesture = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setFeedback(null);
    setErrorMessage(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        setIsAnalyzing(false);
        return;
    }
    
    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    try {
      // Прямая инициализация с использованием переменной окружения
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: [
          {
            parts: [
              { text: "Сколько пальцев поднято на руке? Рассматривай только одну руку. Ответь ТОЛЬКО одной цифрой (0-5). Если не видишь руку или пальцы, ответь 0." },
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
            ]
          }
        ]
      });

      const rawText = response.text || '0';
      const match = rawText.match(/\d/);
      const aiAnswer = match ? parseInt(match[0]) : 0;
      
      if (aiAnswer === problem.answer) {
        setFeedback('success');
        playFeedbackSound('success');
        setTimeout(() => generateProblem(), 2000);
      } else {
        setFeedback('fail');
        playFeedbackSound('fail');
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setErrorMessage(error.message || "Ошибка API. Проверьте правильность ключа в настройках.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[10px] font-black uppercase">← Назад</button>
        <button onClick={toggleCamera} className="text-[10px] font-black uppercase border border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-all">
          {facingMode === 'user' ? 'Основная' : 'Селфи'}
        </button>
      </div>
      
      <div className="relative aspect-video bg-black border-4 border-black overflow-hidden shadow-2xl rounded-sm">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
        <canvas ref={canvasRef} className="hidden" />
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-20">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-white text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Анализ...</div>
          </div>
        )}
        
        {feedback === 'success' && <div className="absolute inset-0 bg-green-500/30 animate-pulse border-8 border-green-500 z-10 pointer-events-none" />}
        {feedback === 'fail' && <div className="absolute inset-0 bg-red-500/20 border-8 border-red-500 z-10 pointer-events-none flex items-center justify-center"><span className="text-white font-black text-4xl">✕</span></div>}
      </div>

      <div className="space-y-4">
        <div className="bg-white border-2 border-black p-6 text-center shadow-sm relative">
          <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Задача дня</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Реши пример и покажи ответ:</p>
          <p className="text-5xl font-black uppercase tracking-tight nyt-font leading-tight">{problem.text}</p>
        </div>

        <div className="bg-white border border-black p-6 text-center shadow-sm">
          {errorMessage && (
             <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold uppercase leading-relaxed text-left">
               ⚠️ {errorMessage}
             </div>
          )}
          <p className="font-serif italic text-sm mb-4 text-gray-600">Направьте камеру на ладонь и нажмите:</p>
          <button 
            disabled={isAnalyzing}
            onClick={analyzeGesture}
            className={`w-full p-5 font-black uppercase tracking-[0.2em] text-lg transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
              isAnalyzing ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {isAnalyzing ? 'ДУМАЮ...' : 'ПРОВЕРИТЬ ОТВЕТ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Games;
