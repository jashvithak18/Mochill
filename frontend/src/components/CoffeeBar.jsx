import React, { useState } from 'react';
import { Coffee, Flame, Zap, Award, Sparkles, Check } from 'lucide-react';
import { useCafeStore } from '../store/useCafeStore';
import { useSocket } from '../context/SocketContext';

const THEME_DRINKS = {
  tokyo_rain: [
    {
      name: '⚡ Tokyo Volt Espresso',
      icon: '⚡',
      description: 'Provides high Tokyo volt energy. Speed boost 40%!',
      buffName: 'Energy Speed',
      price: 15,
      color: 'bg-amber-950 text-amber-200'
    },
    {
      name: '🍵 Uji Matcha Latte',
      icon: '🍵',
      description: 'Provides intense focus. Triggers a glowing, focused matcha halo.',
      buffName: 'Matcha Focus',
      price: 20,
      color: 'bg-emerald-900 text-emerald-100'
    },
    {
      name: '🍫 Ghibli Cocoa Dream',
      icon: '🍫',
      description: 'Warm comfort. Emits cozy pink Ghibli floating hearts.',
      buffName: 'Cozy Chill',
      price: 10,
      color: 'bg-amber-800 text-amber-100'
    },
    {
      name: '🌼 Lavender Sleep Tea',
      icon: '🌼',
      description: 'Provides deep rest. Triggers an immediate sleep state.',
      buffName: 'Dream Sleep',
      price: 8,
      color: 'bg-yellow-900/40 text-yellow-100 border border-yellow-800'
    }
  ],
  beach_sunset: [
    {
      name: '🥥 Coconut Fuel Shot',
      icon: '🥥',
      description: 'Fresh coconut caffeine fuel. Speed boost 40%!',
      buffName: 'Energy Speed',
      price: 15,
      color: 'bg-amber-950 text-amber-200'
    },
    {
      name: '🍹 Mango Sunset Blend',
      icon: '🍹',
      description: 'Sweet mango puree focus. Triggers a golden focused ring.',
      buffName: 'Matcha Focus',
      price: 20,
      color: 'bg-orange-900 text-orange-100'
    },
    {
      name: '🍍 Pineapple Piña Colada',
      icon: '🍍',
      description: 'Alcohol-free cozy paradise. Emits floating beach hearts.',
      buffName: 'Cozy Chill',
      price: 10,
      color: 'bg-amber-800 text-amber-100'
    },
    {
      name: '🌺 Hibiscus Lagoon Tea',
      icon: '🌺',
      description: 'Soothing sunset breeze rest. Triggers an immediate sleep state.',
      buffName: 'Dream Sleep',
      price: 8,
      color: 'bg-rose-900/40 text-rose-100 border border-rose-800'
    }
  ],
  mountain_cabin: [
    {
      name: '🪵 Lumberjack Dark Roast',
      icon: '🪵',
      description: 'Strong cedar-wood brew. Speed boost 40%!',
      buffName: 'Energy Speed',
      price: 15,
      color: 'bg-amber-950 text-amber-200'
    },
    {
      name: '🍯 Golden Honey Latte',
      icon: '🍯',
      description: 'Wild cabin honey focus. Triggers a golden focused halo.',
      buffName: 'Matcha Focus',
      price: 20,
      color: 'bg-amber-900 text-amber-100'
    },
    {
      name: '🍎 Spiced Hot Cider',
      icon: '🍎',
      description: 'Warm cinnamon comfort. Emits warm cozy hearts.',
      buffName: 'Cozy Chill',
      price: 10,
      color: 'bg-amber-800 text-amber-100'
    },
    {
      name: '🌲 Alpine Pinecone Tea',
      icon: '🌲',
      description: 'Relaxing forest herbal rest. Triggers an immediate sleep state.',
      buffName: 'Dream Sleep',
      price: 8,
      color: 'bg-emerald-900/40 text-emerald-100 border border-emerald-800'
    }
  ],
  library_study: [
    {
      name: '✒️ Midnight Ink Espresso',
      icon: '✒️',
      description: 'Midnight exam studying fuel. Speed boost 40%!',
      buffName: 'Energy Speed',
      price: 15,
      color: 'bg-stone-950 text-stone-200'
    },
    {
      name: '☕ Professor’s Black Tea',
      icon: '☕',
      description: 'Philosopher’s high focus. Triggers a glowing focus ring.',
      buffName: 'Matcha Focus',
      price: 20,
      color: 'bg-stone-900 text-stone-100'
    },
    {
      name: '🍫 Gutenberg Cocoa',
      icon: '🍫',
      description: 'Classic ancient chocolate. Emits classical cozy hearts.',
      buffName: 'Cozy Chill',
      price: 10,
      color: 'bg-amber-950/60 text-amber-100 border border-amber-800'
    },
    {
      name: '🌼 Sleepy Archives Herbal',
      icon: '🌼',
      description: 'Late-night library rest tea. Triggers an immediate sleep state.',
      buffName: 'Dream Sleep',
      price: 8,
      color: 'bg-yellow-900/40 text-yellow-100 border border-yellow-800'
    }
  ],
  fantasy_garden: [
    {
      name: '⚡ Lightning Sprite Elixir',
      icon: '⚡',
      description: 'Infused with lightning sprites. Speed boost 40%!',
      buffName: 'Energy Speed',
      price: 15,
      color: 'bg-purple-950 text-purple-200'
    },
    {
      name: '🌸 Pixie Petal Latte',
      icon: '🌸',
      description: 'Formed from magical fairy petals. Triggers a neon focus ring.',
      buffName: 'Matcha Focus',
      price: 20,
      color: 'bg-violet-900 text-violet-100'
    },
    {
      name: '🔮 Starry Night Cocoa',
      icon: '🔮',
      description: 'Starlight and cosmos comfort. Emits magical glowing hearts.',
      buffName: 'Cozy Chill',
      price: 10,
      color: 'bg-indigo-950 text-indigo-200'
    },
    {
      name: '🍄 Moonlit Spore Tea',
      icon: '🍄',
      description: 'Hypnotic woodland glowing rest. Triggers an immediate sleep state.',
      buffName: 'Dream Sleep',
      price: 8,
      color: 'bg-fuchsia-950/40 text-fuchsia-100 border border-fuchsia-800'
    }
  ]
};

export const CoffeeBar = ({ onClose }) => {
  const socket = useSocket();
  const { brewStatus, startBrewing, serveCoffee, activeRoom } = useCafeStore();
  const [selectedDrink, setSelectedDrink] = useState(null);

  const theme = activeRoom?.theme || 'tokyo_rain';
  const drinks = THEME_DRINKS[theme] || THEME_DRINKS['tokyo_rain'];

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
