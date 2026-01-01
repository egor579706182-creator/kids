
import React, { useState, useEffect, useMemo } from 'react';
import { Exercise, DailyProgress } from '../types';
import { getExercisesForDay } from '../constants';

interface DailyViewProps {
  dayNumber: number;
  progress?: DailyProgress;
  onSave: (progress: DailyProgress) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ dayNumber, progress, onSave }) => {
  const exercises = useMemo(() => getExercisesForDay(dayNumber), [dayNumber]);
  const [scores, setScores] = useState<Record<string, number>>(progress?.scores || {});
  const [comment, setComment] = useState(progress?.comment || '');
  const [isCompleted, setIsCompleted] = useState(progress?.completed || false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    if (progress) {
      setScores(progress.scores);
      setComment(progress.comment);
      setIsCompleted(progress.completed);
      setIsSkipping(false);
    } else {
      setScores({});
      setComment('');
      setIsCompleted(false);
      setIsSkipping(false);
    }
  }, [progress, dayNumber]);

  const handleScoreChange = (id: string, val: number) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const handleComplete = () => {
    const newProgress: DailyProgress = {
      date: new Date().toISOString(),
      dayNumber,
      scores,
      comment,
      completed: true,
      skipped: false
    };
    onSave(newProgress);
    setIsCompleted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipSubmit = () => {
    if (!skipReason.trim()) return;
    const newProgress: DailyProgress = {
      date: new Date().toISOString(),
      dayNumber,
      scores: {},
      comment: '',
      completed: true,
      skipped: true,
      skipReason
    };
    onSave(newProgress);
    setIsCompleted(true);
    setIsSkipping(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDailyNote = () => {
    const categories = Array.from(new Set(exercises.map(ex => ex.category)));
    const catText = categories.join(', ').toLowerCase();
    
    const variations = [
      `Сегодняшний план сфокусирован на следующих аспектах: ${catText}. Эти упражнения подобраны таким образом, чтобы плавно переходить от физической разминки к когнитивным задачам.`,
      `В этой сессии мы уделим особое внимание направлениям: ${catText}. Помните, что мозг ребенка пластичен, но требует регулярной и спокойной стимуляции.`,
      `Программа дня включает в себя работу над такими навыками как ${catText}. Ваша задача — создать доверительную атмосферу, где ошибка не является провалом, а лишь частью пути.`,
      `Сегодня мы объединяем ${catText}. Такое сочетание позволяет задействовать разные отделы коры головного мозга, способствуя комплексному развитию коммуникации.`
    ];
    
    const baseText = variations[dayNumber % variations.length];
    const showWeeklyReminder = dayNumber % 7 === 1;
    const reminder = showWeeklyReminder 
      ? " Главное — быть терпеливым и последовательным. Важно уделять упражнениям время каждый день, создавая ритуал, который дисциплинирует и ребенка, и взрослого."
      : "";
    
    return baseText + reminder;
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="mb-8 flex justify-between items-end border-b-2 border-black pb-2">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Сессия {dayNumber}</h2>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Курс: 60 дней</span>
      </div>

      {isSkipping ? (
        <div className="bg-white border-2 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in my-8">
          <h3 className="text-2xl font-black uppercase mb-4 nyt-font border-b border-gray-100 pb-2">Причина пропуска</h3>
          <p className="font-serif italic text-gray-700 mb-6 leading-relaxed">
            Пожалуйста, укажите причину, по которой сегодня не удалось провести занятия. Это поможет специалисту скорректировать программу.
          </p>
          <textarea 
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            className="w-full min-h-[140px] border border-black p-4 font-serif text-lg focus:ring-2 focus:ring-black outline-none mb-6 bg-[#fdfdfd] text-black"
            placeholder="Например: плохое самочувствие, отъезд или высокая нагрузка..."
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleSkipSubmit}
              disabled={!skipReason.trim()}
              className="flex-grow bg-black text-white p-4 font-black uppercase tracking-widest disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Подтвердить пропуск
            </button>
            <button 
              onClick={() => setIsSkipping(false)}
              className="px-6 py-4 border-2 border-black font-black uppercase tracking-widest bg-white hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="text-center py-20 border-2 border-black bg-white shadow-lg">
          <div className={`w-12 h-12 ${progress?.skipped ? 'bg-red-600' : 'bg-black'} text-white flex items-center justify-center mx-auto mb-6 text-2xl font-black`}>
            {progress?.skipped ? '✕' : '✓'}
          </div>
          <h3 className="text-3xl font-black uppercase mb-4 tracking-tight">
            {progress?.skipped ? 'День пропущен' : 'Отчет Принят'}
          </h3>
          <p className="italic font-serif mb-8 text-gray-600 px-8 max-w-md mx-auto leading-relaxed">
            {progress?.skipped 
              ? `Запись о пропуске сохранена для истории. Причина: «${progress.skipReason}»`
              : 'Ваши данные обработаны и добавлены в историю развития ребенка.'}
          </p>
          <button 
            onClick={() => setIsCompleted(false)}
            className="text-[10px] font-black uppercase border-b-2 border-black tracking-widest hover:text-gray-500 transition-colors"
          >
            {progress?.skipped ? 'Заполнить занятие заново' : 'Редактировать сессию'}
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          <div className="mb-10 p-5 bg-white border border-black text-sm font-serif italic leading-relaxed shadow-sm">
            <p className="font-black uppercase text-[9px] mb-2 tracking-widest text-black border-b border-gray-100 pb-1">ЗАПИСКА ДЛЯ РОДИТЕЛЯ:</p>
            <div className="text-gray-800">{getDailyNote()}</div>
          </div>

          {exercises.map((ex, idx) => (
            <section key={ex.id} className="relative group">
              <div className="absolute -left-4 -top-6 text-[100px] font-black opacity-[0.03] select-none group-hover:opacity-[0.07] transition-opacity">
                {idx + 1}
              </div>
              <div className="pl-4 relative">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">
                  {ex.category} • {ex.duration}
                </span>
                <h3 className="text-2xl font-black nyt-font mb-4 leading-tight uppercase group-hover:text-gray-800">
                  {ex.title}
                </h3>
                <p className="font-serif text-lg mb-6 text-gray-800 leading-relaxed italic border-l-2 border-gray-100 pl-4">
                  {ex.description}
                </p>
                <div className="bg-[#fcfcfc] border border-gray-200 p-5 mb-6 text-sm leading-relaxed shadow-sm">
                  <p className="font-black uppercase text-[9px] mb-3 tracking-widest text-gray-500 border-b border-gray-100 pb-1">Как проводить занятие:</p>
                  <div className="font-serif text-gray-700">{ex.instruction}</div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase mb-3 tracking-widest text-gray-500">Оценка успеха (1-5):</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        onClick={() => handleScoreChange(ex.id, v)}
                        className={`w-12 h-12 border-2 flex items-center justify-center font-black transition-all ${
                          scores[ex.id] === v 
                          ? 'bg-black text-white border-black scale-110 z-10' 
                          : 'bg-white text-black border-gray-200 hover:border-black active:scale-90'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}

          <section className="border-t-4 border-double border-black pt-12">
            <h4 className="text-xs font-black uppercase mb-4 tracking-widest">Дневник наблюдений за сегодня</h4>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full min-h-[180px] border-2 border-gray-100 p-6 font-serif text-xl focus:border-black outline-none transition-colors bg-white shadow-inner"
              placeholder="Опишите, какие звуки или реакции вы заметили сегодня..."
            />
            
            <button 
              onClick={handleComplete}
              disabled={Object.keys(scores).length < 4}
              className={`mt-10 w-full p-5 font-black uppercase tracking-[0.3em] text-lg transition-all shadow-md ${
                Object.keys(scores).length >= 4 
                ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              Завершить день
            </button>
            {Object.keys(scores).length < 4 && (
              <p className="text-center text-[10px] font-black uppercase mt-4 text-gray-400 tracking-widest">
                Оцените все упражнения сессии
              </p>
            )}

            <div className="mt-16 flex justify-center border-t border-gray-100 pt-8 pb-8">
              <button 
                onClick={() => {
                  setIsSkipping(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[10px] font-black uppercase border border-red-200 text-red-300 px-6 py-3 hover:bg-red-50 hover:text-red-500 hover:border-red-500 transition-all flex items-center gap-2"
              >
                <span>✕</span> Пропустить этот день
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DailyView;
