import React, { useState } from 'react';
import { Coffee, Flame, Zap, Award, Sparkles, Check } from 'lucide-react';
import { useCafeStore } from '../store/useCafeStore';
import { useSocket } from '../context/SocketContext';

export const CoffeeBar = ({ onClose }) => {
  const socket = useSocket();
  const { brewStatus, startBrewing, serveCoffee } = useCafeStore();
  const [selectedDrink, setSelectedDrink] = useState(null);

  const drinks = [
    {
      name: 'Double Shot Espresso',
      icon: '⚡',
      description: 'Provides physical energy. Speeds up avatar movement speed by 40%!',
      buffName: 'Energy Speed',
      price: 15,
      color: 'bg-amber-950 text-amber-200'
    },
    {
      name: 'Matcha Dream Latte',
      icon: '🍵',
      description: 'Provides focus. Triggers a glowing, focused golden ring around your avatar.',
      buffName: 'Matcha Focus',
      price: 20,
      color: 'bg-emerald-900 text-emerald-100'
    },
    {
      name: 'Ghibli Hot Chocolate',
      icon: '🍫',
      description: 'Provides comfort. Emits floating pink hearts from your character.',
      buffName: 'Cozy Chill',
      price: 10,
      color: 'bg-amber-800 text-amber-100'
    },
    {
      name: 'Sleepy chamomile Tea',
      icon: '🌼',
      description: 'Provides rest. Induces an immediate sleep animation and sleep bubbles.',
      buffName: 'Dream Sleep',
      price: 8,
      color: 'bg-yellow-900/40 text-yellow-100 border border-yellow-800'
    }
  ];

  const handleOrder = (drink) => {
    if (brewStatus === 'brewing') return;
    
    setSelectedDrink(drink);
    startBrewing();

    // Trigger Socket emission for real-time coffee brewing broadcasts
    if (socket) {
      socket.emit('coffee:order', {
        drinkType: drink.name,
        buffName: drink.buffName
      });
    }

    // Local state fallback serving in 3.5 seconds
    setTimeout(() => {
      serveCoffee(drink.name, drink.buffName);
    }, 3500);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-neutral-900 text-neutral-200 p-6 rounded-cozy border-4 border-amber-800 shadow-2xl relative overflow-hidden select-none">
      
      {/* Wood header framing */}
      <div className="absolute top-0 inset-x-0 h-4 bg-amber-950 shadow-inner" />

      {/* BREWING ANIMATION PANEL */}
      {brewStatus === 'brewing' && selectedDrink ? (
        <div className="flex flex-col items-center justify-center py-12 gap-5 text-center">
          <div className="relative w-24 h-24 flex items-center justify-center">
            
            {/* Pulsing steam ring */}
            <div className="absolute inset-0 bg-cozy-terracotta/20 rounded-full animate-ping" />
            <div className="w-16 h-16 rounded-full bg-amber-950 flex items-center justify-center text-4xl shadow-inner border border-amber-700 animate-spin" style={{ animationDuration: '4s' }}>
              ⚙️
            </div>
            
            <div className="absolute text-3xl animate-bounce">
              {selectedDrink.icon}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="text-xl font-bold font-display text-amber-500">Brewing your drink...</h3>
            <p className="text-xs text-neutral-400 font-medium">Grinding coffee beans, steaming milk, and infusing cozy buffs.</p>
          </div>

          {/* Steaming progress line */}
          <div className="w-48 bg-neutral-800 rounded-full h-2 overflow-hidden shadow-inner border border-neutral-700">
            <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full animate-pulse w-full origin-left" style={{ animationDuration: '3.5s' }} />
          </div>
        </div>
      ) : brewStatus === 'served' && selectedDrink ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center text-4xl shadow animate-bounce">
            <Check className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold font-display text-emerald-400">Coffee Served!</h3>
            <p className="text-xs text-neutral-300">Your {selectedDrink.name} is ready to enjoy.</p>
            <p className="text-xs text-amber-500 font-bold bg-amber-950/60 border border-amber-900/60 py-1 px-3.5 rounded-full mt-2 self-center flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buff [{selectedDrink.buffName}] Activated!</span>
            </p>
          </div>
        </div>
      ) : (
        /* MENU SELECTIONS */
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Coffee className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-bold font-display text-amber-100">Virtual Café Menu</h2>
            </div>
            <button
              onClick={onClose}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-700 transition-colors"
            >
              Close Menu
            </button>
          </div>

          <p className="text-xs text-neutral-400 font-medium">Order drinks to trigger cute visual buffs on your avatar!</p>

          <div className="flex flex-col gap-3">
            {drinks.map((d) => (
              <button
                key={d.name}
                onClick={() => handleOrder(d)}
                className="w-full flex items-center gap-4 p-3 rounded-cozy bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-left transition-all btn-bounce"
              >
                {/* Icon square */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${d.color} shadow-inner`}>
                  {d.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-sm font-bold text-neutral-100 truncate">{d.name}</h4>
                    <span className="text-[10px] bg-amber-950 text-amber-400 font-extrabold px-2 py-0.5 rounded-full">
                      💰 {d.price}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                    {d.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-[10px] text-center text-neutral-500 font-medium mt-1">
            ✨ Handcrafted by virtual barista. Buffs persist for 60 seconds.
          </div>
        </div>
      )}
    </div>
  );
};
export default CoffeeBar;
