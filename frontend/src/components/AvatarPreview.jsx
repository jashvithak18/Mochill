import React from 'react';

export const AvatarPreview = ({
  hairstyle = 'wavy',
  hairColor = '#8B5A2B',
  outfit = 'sweater',
  outfitColor = '#E6C594',
  skinTone = '#FCE3BA',
  accessory = 'none',
  pet = 'none',
  size = 64,
  animation = 'idle', // 'idle', 'walking', 'dancing', 'sleeping', 'waving'
  className = ''
}) => {
  // Translate animations into CSS scaling/rotations
  let animClass = 'transition-transform duration-300';
  if (animation === 'walking') {
    animClass += ' animate-bounce';
  } else if (animation === 'dancing') {
    animClass += ' animate-pulse origin-bottom rotate-3 duration-150';
  } else if (animation === 'sleeping') {
    animClass += ' opacity-80 scale-95 skew-x-2';
  } else if (animation === 'waving') {
    animClass += ' origin-center scale-105';
  }

  return (
    <div
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        className={`w-full h-full ${animClass}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow base */}
        <ellipse cx="60" cy="110" rx="28" ry="6" fill="#8D7B68" fillOpacity="0.25" />

        {/* 1. PET COMPANION (renders slightly floating on the left) */}
        {pet !== 'none' && (
          <g className="animate-bounce" style={{ animationDuration: '3s' }}>
            {pet === 'orange_cat' && (
              <g transform="translate(10, 35)">
                {/* Cat Body/Tail */}
                <ellipse cx="14" cy="20" rx="8" ry="10" fill="#E67E22" />
                <path d="M 6,24 C 6,20 2,24 2,28" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Cat Head */}
                <circle cx="14" cy="10" r="8" fill="#E67E22" />
                {/* Ears */}
                <polygon points="6,6 10,2 11,8" fill="#D35400" />
                <polygon points="22,6 18,2 17,8" fill="#D35400" />
                {/* Face details */}
                <circle cx="12" cy="9" r="1" fill="#2C3E50" />
                <circle cx="16" cy="9" r="1" fill="#2C3E50" />
                <polygon points="14,11 13,12 15,12" fill="#E74C3C" />
                <ellipse cx="14" cy="15" rx="5" ry="1" fill="#FCE4D6" fillOpacity="0.4" />
              </g>
            )}

            {pet === 'shiba' && (
              <g transform="translate(8, 32)">
                <ellipse cx="16" cy="22" rx="10" ry="11" fill="#D35400" />
                <ellipse cx="16" cy="22" rx="7" ry="9" fill="#FFF" />
                <circle cx="16" cy="11" r="9" fill="#D35400" />
                <circle cx="16" cy="12" r="7" fill="#FFF" />
                {/* Shiba Ears */}
                <polygon points="8,6 12,1 14,8" fill="#BA4A00" />
                <polygon points="24,6 20,1 18,8" fill="#BA4A00" />
                {/* Eyes & Nose */}
                <circle cx="13" cy="10" r="1" fill="#2C3E50" />
                <circle cx="19" cy="10" r="1" fill="#2C3E50" />
                <circle cx="16" cy="12" r="1.5" fill="#2C3E50" />
                <ellipse cx="16" cy="15" rx="4" ry="1" fill="#FFC0CB" />
              </g>
            )}

            {pet === 'cloud' && (
              <g transform="translate(6, 32)" className="opacity-90">
                <circle cx="12" cy="18" r="7" fill="#FFF" />
                <circle cx="20" cy="14" r="8" fill="#FFF" />
                <circle cx="28" cy="18" r="6" fill="#FFF" />
                <rect x="10" y="16" width="20" height="7" fill="#FFF" />
                {/* Blush & Smile */}
                <path d="M 18,17 Q 20,19 22,17" stroke="#95A5A6" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <circle cx="16" cy="16" r="1" fill="#FF8A8A" />
                <circle cx="24" cy="16" r="1" fill="#FF8A8A" />
              </g>
            )}
          </g>
        )}

        {/* 2. BODY (OUTFIT) */}
        <g id="body">
          {outfit === 'sweater' && (
            <>
              <path d="M 32,100 C 32,75 88,75 88,100 Z" fill={outfitColor} />
              {/* Cozy neck roll */}
              <ellipse cx="60" cy="78" rx="20" ry="6" fill={outfitColor} stroke="#4A3E3D" strokeWidth="1.5" />
            </>
          )}

          {outfit === 'hoodie' && (
            <>
              <path d="M 32,100 C 32,74 88,74 88,100 Z" fill={outfitColor} />
              {/* Hoodie strings & pouch */}
              <circle cx="54" cy="90" r="1.5" fill="#FFF" />
              <circle cx="66" cy="90" r="1.5" fill="#FFF" />
              <path d="M 54,90 L 54,102" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 66,90 L 66,102" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 45,78 Q 60,88 75,78" fill="none" stroke={outfitColor} strokeWidth="4.5" />
            </>
          )}

          {outfit === 'overall' && (
            <>
              {/* Under-shirt */}
              <path d="M 32,100 C 32,75 88,75 88,100 Z" fill="#FFF" />
              {/* Denim Overalls */}
              <path d="M 42,84 L 78,84 L 84,100 L 36,100 Z" fill={outfitColor} />
              {/* Straps */}
              <path d="M 42,84 L 46,76" stroke={outfitColor} strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 78,84 L 74,76" stroke={outfitColor} strokeWidth="4.5" strokeLinecap="round" />
              <rect x="52" y="88" width="16" height="10" rx="2" fill="#FAF6F0" fillOpacity="0.4" />
            </>
          )}
        </g>

        {/* 3. HEAD & SKIN */}
        <g id="head">
          <circle cx="60" cy="52" r="26" fill={skinTone} stroke="#4A3E3D" strokeWidth="2.5" />
          {/* Ghibli Cute Blush */}
          <ellipse cx="44" cy="58" rx="4" ry="2" fill="#FF8A8A" fillOpacity="0.7" />
          <ellipse cx="76" cy="58" rx="4" ry="2" fill="#FF8A8A" fillOpacity="0.7" />
        </g>

        {/* 4. EYES (Cozy smiling closed eyes) */}
        <g id="eyes">
          {animation === 'sleeping' ? (
            <>
              {/* Closed lines for sleeping */}
              <path d="M 44,51 Q 48,54 52,51" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 68,51 Q 72,54 76,51" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Floating 'Zzz' */}
              <text x="82" y="32" fill="#8D7B68" fontSize="9" fontWeight="bold" fontFamily="monospace" className="animate-pulse">Z</text>
              <text x="90" y="24" fill="#8D7B68" fontSize="12" fontWeight="bold" fontFamily="monospace" className="animate-pulse">Z</text>
            </>
          ) : (
            <>
              {/* Happy curves */}
              <path d="M 42,50 Q 48,44 54,50" stroke="#4A3E3D" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M 66,50 Q 72,44 78,50" stroke="#4A3E3D" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* Tiny shy mouth */}
              <path d="M 58,60 Q 60,62 62,60" stroke="#4A3E3D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}
        </g>

        {/* 5. HAIRSTYLE */}
        <g id="hair" fill={hairColor}>
          {hairstyle === 'wavy' && (
            <>
              {/* Back hair */}
              <path d="M 32,52 C 22,52 24,78 30,86 C 36,94 40,78 40,52 Z" />
              <path d="M 88,52 C 98,52 96,78 90,86 C 84,94 80,78 80,52 Z" />
              {/* Front Bangs */}
              <path d="M 34,44 C 34,26 86,26 86,44 C 86,48 76,38 72,42 C 68,46 62,38 58,42 C 54,46 44,38 34,44 Z" stroke="#4A3E3D" strokeWidth="1.5" />
            </>
          )}

          {hairstyle === 'messy' && (
            <>
              {/* Anime spikes top and side bangs */}
              <path d="M 34,48 C 30,22 90,22 86,48 C 84,54 78,42 75,48 C 72,52 68,44 64,48 C 60,52 56,44 52,48 C 48,52 44,44 34,48 Z" stroke="#4A3E3D" strokeWidth="1.5" />
              {/* Spikes */}
              <path d="M 45,28 L 50,18 L 56,24 L 62,14 L 69,20 L 76,16 L 79,28 Z" />
            </>
          )}

          {hairstyle === 'bun' && (
            <>
              {/* Space Buns */}
              <circle cx="36" cy="30" r="11" stroke="#4A3E3D" strokeWidth="2.5" />
              <circle cx="84" cy="30" r="11" stroke="#4A3E3D" strokeWidth="2.5" />
              {/* Neat hair crown */}
              <path d="M 34,48 C 34,26 86,26 86,48 C 86,48 72,36 60,40 C 48,36 34,48 34,48 Z" stroke="#4A3E3D" strokeWidth="2" />
            </>
          )}

          {hairstyle === 'cap' && (
            <>
              {/* Cozy wool beanie sitting on top */}
              <path d="M 36,44 C 36,20 84,20 84,44 Z" fill="#C87A53" stroke="#4A3E3D" strokeWidth="2" />
              <rect x="32" y="38" width="56" height="8" rx="4" fill="#E67E22" stroke="#4A3E3D" strokeWidth="2" />
              {/* Pom pom */}
              <circle cx="60" cy="18" r="6" fill="#FAF6F0" stroke="#4A3E3D" strokeWidth="2" />
            </>
          )}
        </g>

        {/* 6. ACCESSORIES */}
        {accessory !== 'none' && (
          <g id="accessory">
            {accessory === 'glasses' && (
              <g stroke="#F39C12" strokeWidth="3" fill="none">
                {/* Round frames */}
                <circle cx="48" cy="51" r="10" />
                <circle cx="72" cy="51" r="10" />
                {/* Bridge */}
                <path d="M 58,51 L 62,51" strokeLinecap="round" />
                {/* Temples */}
                <path d="M 38,51 L 34,48" strokeLinecap="round" />
                <path d="M 82,51 L 86,48" strokeLinecap="round" />
              </g>
            )}

            {accessory === 'headphones' && (
              <g>
                {/* Over-ear cups */}
                <rect x="30" y="42" width="6" height="20" rx="3" fill="#2C3E50" stroke="#FAF6F0" strokeWidth="1.5" />
                <rect x="84" y="42" width="6" height="20" rx="3" fill="#2C3E50" stroke="#FAF6F0" strokeWidth="1.5" />
                {/* Headband arch */}
                <path d="M 33,42 C 33,20 87,20 87,42" fill="none" stroke="#2C3E50" strokeWidth="4" />
              </g>
            )}

            {accessory === 'cat_ears' && (
              <g>
                {/* Cat ears headband */}
                <path d="M 40,32 C 40,24 48,22 48,22 L 44,14 L 38,24" fill="#C87A53" stroke="#4A3E3D" strokeWidth="2" />
                <path d="M 80,32 C 80,24 72,22 72,22 L 76,14 L 82,24" fill="#C87A53" stroke="#4A3E3D" strokeWidth="2" />
                {/* Inner ear pink */}
                <polygon points="41,21 44,17 45,21" fill="#FF8A8A" />
                <polygon points="79,21 76,17 75,21" fill="#FF8A8A" />
                {/* Headband wire */}
                <path d="M 42,32 C 48,28 72,28 78,32" fill="none" stroke="#4A3E3D" strokeWidth="2.5" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
export default AvatarPreview;
