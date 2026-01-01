
import React, { useState, useEffect, useCallback } from 'react';
import { UserInfo, DailyProgress, AppState } from './types';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import DailyView from './components/DailyView';
import Dashboard from './components/Dashboard';

const STORAGE_KEY = 'nyt_communication_app_data';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      user: null,
      progress: [],
      currentDay: 1
    };
  });

  const [activeTab, setActiveTab] = useState<'today' | 'dashboard'>('today');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleOnboarding = (userInfo: UserInfo) => {
    setState(prev => ({ ...prev, user: userInfo }));
  };

  const handleDayComplete = (progress: DailyProgress) => {
    setState(prev => {
      const existingIdx = prev.progress.findIndex(p => p.dayNumber === progress.dayNumber);
      const newProgress = [...prev.progress];
      if (existingIdx >= 0) {
        newProgress[existingIdx] = progress;
      } else {
        newProgress.push(progress);
      }
      
      // Move to next day if this one was just completed
      const nextDay = progress.completed ? Math.min(60, prev.currentDay + 1) : prev.currentDay;
      
      return {
        ...prev,
        progress: newProgress,
        currentDay: Math.max(prev.currentDay, nextDay)
      };
    });
  };

  if (!state.user) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <div className="min-h-screen pb-20 max-w-2xl mx-auto px-4 sm:px-6">
      <Header user={state.user} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mt-8">
        {activeTab === 'today' ? (
          <DailyView 
            dayNumber={state.currentDay} 
            progress={state.progress.find(p => p.dayNumber === state.currentDay)}
            onSave={handleDayComplete}
          />
        ) : (
          <Dashboard state={state} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-black flex justify-around p-3 z-50 max-w-2xl mx-auto">
        <button 
          onClick={() => setActiveTab('today')}
          className={`text-sm font-bold uppercase tracking-widest ${activeTab === 'today' ? 'underline' : 'opacity-50'}`}
        >
          Занятие
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`text-sm font-bold uppercase tracking-widest ${activeTab === 'dashboard' ? 'underline' : 'opacity-50'}`}
        >
          Кабинет
        </button>
      </nav>
    </div>
  );
};

export default App;
