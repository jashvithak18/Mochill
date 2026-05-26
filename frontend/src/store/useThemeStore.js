import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDay: true,
  weather: 'clear', // 'clear', 'rain', 'snow', 'windy', 'sunset'
  fireplaceOn: true,
  fireplaceIntensity: 2, // 1 (ember), 2 (warm), 3 (blazing)
  catMood: 'sleeping', // 'sleeping', 'wandering', 'purring'
  showSubtitles: false,
  soundVolume: 0.5,
  ambienceVolume: 0.4,

  toggleDayNight: () => set((state) => ({ isDay: !state.isDay })),
  
  setWeather: (weather) => set({ weather }),
  
  toggleFireplace: () => set((state) => ({ fireplaceOn: !state.fireplaceOn })),
  
  setFireplaceIntensity: (intensity) => set({ fireplaceIntensity: intensity }),
  
  setCatMood: (catMood) => set({ catMood }),
  
  toggleSubtitles: () => set((state) => ({ showSubtitles: !state.showSubtitles })),
  
  setSoundVolume: (soundVolume) => set({ soundVolume }),
  
  setAmbienceVolume: (ambienceVolume) => set({ ambienceVolume })
}));
