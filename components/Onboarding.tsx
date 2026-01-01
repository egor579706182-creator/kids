
import React, { useState } from 'react';
import { UserInfo } from '../types';

interface OnboardingProps {
  onComplete: (info: UserInfo) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<Omit<UserInfo, 'onboarded'>>({
    name: '',
    age: 3,
    gender: 'male'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onComplete({ ...formData, onboarded: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f9f7f2]">
      <div className="max-w-md w-full border border-black p-8 bg-white shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black nyt-font mb-2 uppercase tracking-tight">
            Персональный План
          </h2>
          <div className="h-1 w-20 bg-black mx-auto mb-4"></div>
          <p className="italic text-gray-600 font-serif leading-relaxed">
            Пожалуйста, укажите данные вашего ребенка для формирования индивидуальной программы упражнений.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase mb-2 tracking-widest text-gray-500">Имя ребенка</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border-b-2 border-gray-200 p-2 outline-none font-serif text-xl focus:border-black transition-colors bg-transparent"
              placeholder="Введите имя..."
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black uppercase mb-2 tracking-widest text-gray-500">Возраст (лет)</label>
              <input 
                required
                type="number" 
                min="1" max="18"
                value={formData.age}
                onChange={e => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                className="w-full border-b-2 border-gray-200 p-2 outline-none font-serif text-xl focus:border-black transition-colors bg-transparent"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase mb-3 tracking-widest text-gray-500">Пол</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-xs font-bold uppercase group-hover:underline">Мальчик</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-xs font-bold uppercase group-hover:underline">Девочка</span>
                </label>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full border-2 border-black bg-white text-black p-4 font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all active:scale-[0.98]"
          >
            Начать программу
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
