
import React, { useMemo, useState } from 'react';
import { AppState, DailyProgress } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import Games from './Games';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [showGames, setShowGames] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const completedDaysCount = state.progress.filter(p => p.completed && !p.skipped).length;
  const skippedDaysCount = state.progress.filter(p => p.skipped).length;
  
  const lastEntry = useMemo(() => {
    if (state.progress.length === 0) return null;
    return [...state.progress].reduce((prev, current) => 
      (prev.dayNumber > current.dayNumber) ? prev : current
    );
  }, [state.progress]);

  const showSkipWarning = lastEntry?.skipped === true;

  const chartData = useMemo(() => {
    return state.progress
      .filter(p => p.completed && !p.skipped)
      .sort((a, b) => a.dayNumber - b.dayNumber)
      .map(p => {
        const scores = Object.values(p.scores) as number[];
        const total = scores.reduce((acc: number, curr: number) => acc + curr, 0);
        const avgScore = total / (scores.length || 1);
        
        return {
          day: `Д${p.dayNumber}`,
          score: parseFloat(avgScore.toFixed(1))
        };
      });
  }, [state.progress]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportTitle = `ОТЧЕТ О ПРОХОЖДЕНИИ КУРСА: ${state.user?.name?.toUpperCase()}`;
      const stats = `Завершено дней: ${completedDaysCount}\nПропущено дней: ${skippedDaysCount}\nОбщий прогресс курса: ${Math.round(((completedDaysCount + skippedDaysCount) / 60) * 100)}%\n\n`;
      
      let history = "ИСТОРИЯ ЗАНЯТИЙ И НАБЛЮДЕНИЙ:\n" + "=".repeat(30) + "\n\n";
      [...state.progress].sort((a: DailyProgress, b: DailyProgress) => a.dayNumber - b.dayNumber).forEach(p => {
        history += `ДЕНЬ ${p.dayNumber} (${new Date(p.date).toLocaleDateString('ru-RU')})\n`;
        
        if (p.skipped) {
          history += `СТАТУС: ПРОПУЩЕНО\n`;
          history += `Причина пропуска: ${p.skipReason || 'Не указана'}\n`;
        } else {
          const scoresArr = Object.values(p.scores) as number[];
          const total = scoresArr.reduce((acc: number, val: number) => acc + val, 0);
          const avg = scoresArr.length > 0 ? total / scoresArr.length : 0;
          
          history += `Средний балл: ${avg.toFixed(1)}/5\n`;
          history += `Комментарий родителя: ${p.comment || 'Нет записи'}\n`;
        }
        history += "-".repeat(20) + "\n\n";
      });

      const content = `${reportTitle}\n${stats}${history}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${state.user?.name}_day_${state.currentDay}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("Отчет сформирован и готов к отправке специалисту.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const resetAllData = () => {
    if (confirm("Внимание! Все данные о прогрессе будут удалены безвозвратно. Начать курс заново?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderCalendar = () => {
    const days = Array.from({ length: 60 }, (_, i) => i + 1);
    return (
      <div className="grid grid-cols-7 sm:grid-cols-10 gap-1 border border-black p-1 bg-gray-50">
        {days.map(d => {
          const entry = state.progress.find(p => p.dayNumber === d);
          const isDone = entry?.completed && !entry?.skipped;
          const isSkipped = entry?.skipped;
          const isCurrent = state.currentDay === d;
          
          return (
            <div 
              key={d} 
              className={`h-10 sm:h-12 border flex items-center justify-center text-[10px] font-black relative ${
                isDone ? 'bg-black text-white border-black shadow-sm' : 
                isSkipped ? 'bg-red-50 text-red-600 border-red-200' :
                isCurrent ? 'bg-white border-2 border-black z-10' : 'bg-white border-gray-100 text-gray-200'
              }`}
            >
              {d}
              {isDone && <span className="absolute bottom-0.5 right-0.5 text-[6px]">●</span>}
              {isSkipped && <span className="absolute inset-0 flex items-center justify-center text-lg opacity-30">✕</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-fade-in pb-16">
      {showGames && <Games onClose={() => setShowGames(false)} />}

      <section>
        {showSkipWarning && (
          <div className="mb-10 p-6 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
            <h3 className="text-xl font-black uppercase nyt-font mb-2 leading-tight tracking-tight">Важность регулярности</h3>
            <p className="font-serif italic text-base text-gray-900 leading-relaxed">
              Предыдущий сеанс был пропущен. В коррекционной педагогике регулярность является фундаментом прогресса. Каждое пропущенное занятие замедляет формирование новых нейронных связей.
            </p>
          </div>
        )}

        <div className="flex justify-between items-baseline border-b-4 border-black mb-10 pb-1">
          <h2 className="text-4xl font-black uppercase tracking-tighter nyt-font">Личный Кабинет</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Курс: {state.user?.name}</span>
        </div>
        
        <div className="mb-12">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full bg-[#121212] text-white p-5 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all border border-black active:translate-y-1"
          >
            <span className="text-lg">✉</span>
            {isExporting ? 'ОБРАБОТКА ДАННЫХ...' : 'ОТПРАВИТЬ ОТЧЕТ СПЕЦИАЛИСТУ'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-14">
          <div className="p-8 bg-white border border-black shadow-sm text-center">
            <p className="text-[10px] font-black uppercase mb-4 tracking-widest text-gray-400 border-b border-gray-50 pb-1">Пройдено дней</p>
            <p className="text-6xl font-black nyt-font leading-none">{completedDaysCount}</p>
          </div>
          <div className="p-8 bg-white border border-black shadow-sm text-center">
            <p className="text-[10px] font-black uppercase mb-4 tracking-widest text-gray-400 border-b border-gray-50 pb-1">Пропущено</p>
            <p className="text-6xl font-black nyt-font leading-none text-red-600">{skippedDaysCount}</p>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-xs font-black uppercase mb-6 border-b-2 border-black pb-1">Дополнительные занятия</h3>
          <button 
            onClick={() => setShowGames(true)}
            className="w-full border-2 border-black bg-white p-8 flex items-center justify-between group hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]"
          >
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-70 block mb-1">Интерактивная форма</span>
              <h4 className="text-2xl font-black uppercase nyt-font">Игровая Терапия</h4>
            </div>
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center group-hover:border-white text-2xl transition-colors">→</div>
          </button>
        </div>

        <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-black"></div>
          Календарь программы
        </h3>
        {renderCalendar()}
      </section>

      <section className="pt-10 border-t-2 border-black border-dashed">
        <h3 className="text-xs font-black uppercase mb-10 flex items-center gap-3">
          <div className="h-[2px] w-10 bg-black"></div>
          Показатели прогресса
        </h3>
        {chartData.length > 0 ? (
          <div className="h-72 w-full bg-white border-2 border-black p-6 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="day" axisLine={{ stroke: '#000' }} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis domain={[0, 5]} hide />
                <Tooltip 
                  contentStyle={{ border: '2px solid black', borderRadius: '0', fontFamily: 'serif', boxShadow: '4px 4px 0px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#000" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8, fill: '#000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 italic font-serif text-gray-400 bg-white">
            Здесь будет построен график ваших успехов.
          </div>
        )}
      </section>

      <section className="pb-20">
        <h3 className="text-xs font-black uppercase mb-12 border-b-2 border-black pb-2 flex justify-between items-center">
          <span className="text-2xl nyt-font normal-case font-black">Хроника программы</span>
          <span className="text-[10px] tracking-widest text-gray-300 uppercase">Archive</span>
        </h3>
        <div className="space-y-16">
          {state.progress.length === 0 && (
            <div className="text-center py-20 opacity-30 italic font-serif text-2xl">Записи не найдены</div>
          )}
          {[...state.progress].reverse().map(p => (
            <div key={p.dayNumber} className={`relative pl-10 border-l-2 ${p.skipped ? 'border-red-200' : 'border-black'}`}>
              <div className={`absolute -left-[7px] top-0 w-3.5 h-3.5 border-2 border-white ${p.skipped ? 'bg-red-500' : 'bg-black'}`}></div>
              
              <div className="flex justify-between items-baseline mb-5">
                <span className="text-2xl font-black uppercase nyt-font tracking-tight">
                  {p.skipped ? `Пропуск №${p.dayNumber}` : `День №${p.dayNumber}`}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {new Date(p.date).toLocaleDateString('ru-RU')}
                </span>
              </div>
              
              {p.skipped ? (
                <div className="p-6 bg-red-50 border border-red-100 italic font-serif text-red-900 shadow-sm">
                  <span className="font-black uppercase text-[8px] tracking-widest block mb-2 opacity-60">Зафиксированная причина:</span>
                  «{p.skipReason || "Причина не указана."}»
                </div>
              ) : (
                <div className="bg-white p-8 border-2 border-gray-50 shadow-sm">
                  <p className="font-serif text-xl text-gray-800 leading-relaxed mb-8 first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-none">
                    {p.comment || "Родитель оставил этот день без письменного наблюдения."}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-50">
                    {Object.values(p.scores).map((s, i) => (
                      <div key={i} className="text-[9px] font-black px-3 py-1.5 border border-black uppercase tracking-tighter bg-gray-50">
                        Задача {i+1}: {s}/5
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="pt-10 border-t-4 border-double border-gray-200 pb-12 text-center">
        <button 
          onClick={resetAllData}
          className="text-[10px] font-black uppercase text-gray-300 hover:text-red-500 transition-all border-b border-transparent hover:border-red-500"
        >
          Удалить историю развития и начать заново
        </button>
      </footer>
    </div>
  );
};

export default Dashboard;
