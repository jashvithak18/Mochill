import React, { useState } from 'react';
import AvatarPreview from './AvatarPreview';

export const AvatarCreator = ({ initialAvatar = {}, onSave, buttonText = "Save Avatar & Enter Lounge" }) => {
  const [hairstyle, setHairstyle] = useState(initialAvatar.hairstyle || 'wavy');
  const [hairColor, setHairColor] = useState(initialAvatar.hairColor || '#8B5A2B');
  const [outfit, setOutfit] = useState(initialAvatar.outfit || 'sweater');
  const [outfitColor, setOutfitColor] = useState(initialAvatar.outfitColor || '#E6C594');
  const [skinTone, setSkinTone] = useState(initialAvatar.skinTone || '#FCE3BA');
  const [accessory, setAccessory] = useState(initialAvatar.accessory || 'none');
  const [pet, setPet] = useState(initialAvatar.pet || 'none');

  const hairColors = [
    { label: 'Chestnut', value: '#8B5A2B' },
    { label: 'Ember Red', value: '#C0392B' },
    { label: 'Gold', value: '#F1C40F' },
    { label: 'Charcoal', value: '#2C3E50' },
    { label: 'Silver Gray', value: '#BDC3C7' },
    { label: 'Lilac', value: '#9B59B6' }
  ];

  const outfitColors = [
    { label: 'Creamy Latte', value: '#E6C594' },
    { label: 'Sage Moss', value: '#A8B296' },
    { label: 'Cozy Terracotta', value: '#C87A53' },
    { label: 'Hot Cocoa', value: '#5C4033' },
    { label: 'Baby Blue', value: '#AED9E0' },
    { label: 'Soft Lavender', value: '#D5C3E5' }
  ];

  const skinTones = [
    { label: 'Fair Cream', value: '#FFF3E3' },
    { label: 'Cozy Beige', value: '#FCE3BA' },
    { label: 'Warm Honey', value: '#F5C29B' },
    { label: 'Soft Cinnamon', value: '#D8A07A' },
    { label: 'Deep Espresso', value: '#6F4E37' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      hairstyle,
      hairColor,
      outfit,
      outfitColor,
      skinTone,
      accessory,
      pet
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel p-8 rounded-cozy shadow-cozy flex flex-col md:flex-row gap-8 items-center border border-white/40">
      
      {/* LEFT: Live Avatar Projection Display */}
      <div className="flex flex-col items-center justify-center bg-cream-200/50 p-8 rounded-cozy w-full md:w-1/3 border border-cream-300/40 relative overflow-hidden group">
        <div className="absolute top-2 left-2 text-xs bg-cozy-terracotta/10 text-cozy-terracotta font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          Live Mirror
        </div>
        <div className="w-48 h-48 bg-white/60 rounded-full flex items-center justify-center shadow-inner relative border border-white">
          <AvatarPreview
            hairstyle={hairstyle}
            hairColor={hairColor}
            outfit={outfit}
            outfitColor={outfitColor}
            skinTone={skinTone}
            accessory={accessory}
            pet={pet}
            size={160}
            animation="walking"
          />
        </div>
        
        <h3 className="mt-4 text-lg font-bold text-cozy-darkWood font-display">Your Virtual Self</h3>
        <p className="text-xs text-cozy-brown/80 text-center mt-1">Stretching and walking, ready to explore the café space.</p>
      </div>

      {/* RIGHT: Visual Selector Panels */}
      <form onSubmit={handleSubmit} className="flex-1 w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2">
          
          {/* HAIRSTYLE TAB */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">✂️ Hairstyle</label>
            <div className="grid grid-cols-2 gap-2">
              {['wavy', 'messy', 'bun', 'cap'].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHairstyle(h)}
                  className={`py-2 px-3 text-xs capitalize rounded-lg border font-medium transition-all btn-bounce ${
                    hairstyle === h
                      ? 'bg-cozy-terracotta text-white border-cozy-terracotta shadow-md'
                      : 'bg-white text-cozy-darkWood border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  {h === 'cap' ? '🧶 Beanie Cap' : h}
                </button>
              ))}
            </div>
          </div>

          {/* HAIR COLOR */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">🎨 Hair Color</label>
            <div className="flex flex-wrap gap-1.5">
              {hairColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setHairColor(c.value)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform btn-bounce ${
                    hairColor === c.value ? 'border-cozy-darkWood scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* OUTFIT TAB */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">🧥 Cozy Outfit</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['sweater', 'hoodie', 'overall'].map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutfit(o)}
                  className={`py-2 px-1 text-[11px] capitalize rounded-lg border font-medium transition-all btn-bounce ${
                    outfit === o
                      ? 'bg-cozy-terracotta text-white border-cozy-terracotta shadow-md'
                      : 'bg-white text-cozy-darkWood border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* OUTFIT COLOR */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">🧶 Fabric Shade</label>
            <div className="flex flex-wrap gap-1.5">
              {outfitColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setOutfitColor(c.value)}
                  title={c.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform btn-bounce ${
                    outfitColor === c.value ? 'border-cozy-darkWood scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* SKIN TONE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">✨ Skin Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {skinTones.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSkinTone(s.value)}
                  title={s.label}
                  className={`w-6 h-6 rounded-full border-2 transition-transform btn-bounce ${
                    skinTone === s.value ? 'border-cozy-darkWood scale-110 shadow-sm' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: s.value }}
                />
              ))}
            </div>
          </div>

          {/* ACCESSORIES */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">👓 Accessory</label>
            <select
              value={accessory}
              onChange={(e) => setAccessory(e.target.value)}
              className="py-1.5 px-3 text-xs bg-white text-cozy-darkWood rounded-lg border border-cream-300 focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
            >
              <option value="none">None</option>
              <option value="glasses">🏷️ Wire Glasses</option>
              <option value="headphones">🎧 Cozy Headphones</option>
              <option value="cat_ears">🐱 Kitten Headband</option>
            </select>
          </div>

          {/* PET COMPANION */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label className="text-sm font-bold text-cozy-darkWood flex items-center gap-1">🐾 Cute Companion Pet</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'No Pet', icon: '❌' },
                { id: 'orange_cat', label: 'Orange Cat', icon: '🐱' },
                { id: 'shiba', label: 'Cozy Shiba', icon: '🐕' },
                { id: 'cloud', label: 'Fluffy Cloud', icon: '☁️' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPet(p.id)}
                  className={`py-2 px-1 text-[11px] rounded-lg border font-medium flex flex-col items-center gap-1 transition-all btn-bounce ${
                    pet === p.id
                      ? 'bg-cozy-moss text-white border-cozy-moss shadow-md'
                      : 'bg-white text-cozy-darkWood border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full mt-2 py-3 px-6 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-bold rounded-cozy shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          <span>🛋️</span>
          <span>{buttonText}</span>
        </button>
      </form>
    </div>
  );
};
export default AvatarCreator;
