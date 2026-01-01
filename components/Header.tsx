
import React from 'react';
import { UserInfo } from '../types';

interface HeaderProps {
  user: UserInfo;
  activeTab: 'today' | 'dashboard';
  setActiveTab: (tab: 'today' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ user, activeTab, setActiveTab }) => {
  const dateStr = new Intl.DateTimeFormat('ru-RU', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <header className="pt-10 border-b-4 border-black pb-1">
      <div className="text-center mb-6">
        <h1 className="text-5xl sm:text-7xl font-black nyt-font tracking-tighter uppercase leading-none mb-4">
          Дневник Развития
        </h1>
        <div className="flex justify-between items-center border-y-2 border-black py-3 px-1 text-[10px] sm:text-xs uppercase font-black tracking-[0.2em]">
          <span className="flex-1 text-left">Программа: 60 дней</span>
          <span className="flex-1 text-right italic font-serif normal-case font-normal text-sm">{dateStr}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;