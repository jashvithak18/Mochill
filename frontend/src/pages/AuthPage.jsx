import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Coffee, User, Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guest'); // guest, login, register
  
  // Input fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Zustand Store operations
  const { login, register, guestLogin, isLoading, error, clearError } = useAuthStore();
  const [localError, setLocalError] = useState(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLocalError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all details.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!username || !email || !password) {
      setLocalError('Please fill in all details.');
      return;
    }

    const res = await register(username, email, password);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const res = await guestLogin(username);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6 relative">
      
      {/* Decorative sunbeam overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cozy-sand/10 via-transparent to-cozy-terracotta/5 pointer-events-none" />

      {/* Floating lanterns */}
      <div className="absolute top-12 left-12 w-6 h-10 bg-cozy-terracotta/10 rounded-full blur-sm animate-pulse" />
      <div className="absolute bottom-16 right-16 w-8 h-12 bg-cozy-sand/20 rounded-full blur-md animate-pulse" style={{ animationDuration: '4s' }} />

      <div className="w-full max-w-md glass-panel p-8 rounded-cozy shadow-cozy border border-white/50 relative z-10 flex flex-col gap-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-cozy-brown hover:text-cozy-darkWood transition-colors self-start btn-bounce"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        {/* Coffee Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full bg-cozy-terracotta/10 flex items-center justify-center border border-cozy-terracotta/20 animate-bounce" style={{ animationDuration: '3s' }}>
            <Coffee className="w-7 h-7 text-cozy-terracotta" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-cozy-darkWood mt-1">Join Mochill Lounge</h2>
          <p className="text-xs text-cozy-brown font-medium max-w-[280px]">
            Choose how you wish to enter our warm virtual café space.
          </p>
        </div>

        {/* TAB NAVIGATION ROW */}
        <div className="flex bg-cream-200/60 p-1 rounded-xl border border-cream-300/40 select-none">
          {[
            { id: 'guest', label: '☕ Guest' },
            { id: 'login', label: '🔑 Login' },
            { id: 'register', label: '📝 Join' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-cozy-darkWood shadow-sm'
                  : 'text-cozy-brown hover:text-cozy-darkWood'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ERROR BOX */}
        {(localError || error) && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">
            ⚠️ {localError || error}
          </div>
        )}

        {/* ONBOARDING FORMS */}
        {activeTab === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-cozy-darkWood flex items-center gap-1">🛋️ Pick a Nickname</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-cozy-brown/80" />
                <input
                  type="text"
                  placeholder="e.g. SleepyPanda (or leave blank to randomise)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  maxLength={15}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-5 bg-cozy-moss hover:bg-cozy-moss/90 text-white font-bold rounded-lg shadow transition-all btn-bounce text-xs flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>{isLoading ? 'Entering...' : 'Chill as Guest'}</span>
            </button>
            <p className="text-[10px] text-center text-cozy-brown/80 font-medium">
              Guest credentials are stored temporarily. You can upgrade to a full account later!
            </p>
          </form>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-cozy-darkWood flex items-center gap-1">📧 Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-cozy-brown/80" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-cozy-darkWood flex items-center gap-1">🔒 Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-cozy-brown/80" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-5 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-bold rounded-lg shadow transition-all btn-bounce text-xs flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-cozy-darkWood flex items-center gap-1">👤 Unique Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-cozy-brown/80" />
                <input
                  type="text"
                  placeholder="e.g. CozyMug"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  required
                  maxLength={14}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-cozy-darkWood flex items-center gap-1">📧 Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-cozy-brown/80" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-cozy-darkWood flex items-center gap-1">🔒 Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-cozy-brown/80" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-5 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-bold rounded-lg shadow transition-all btn-bounce text-xs flex items-center justify-center gap-2"
            >
              <span>📝</span>
              <span>{isLoading ? 'Creating...' : 'Register Account'}</span>
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-cozy-brown/80 font-bold self-center border-t border-cream-300/40 w-full pt-4">
          <ShieldCheck className="w-3.5 h-3.5 text-cozy-moss" />
          <span>Safe, kid-friendly social sandbox.</span>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
