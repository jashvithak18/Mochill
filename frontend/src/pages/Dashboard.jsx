import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCafeStore } from '../store/useCafeStore';
import { Coffee, Compass, Plus, LogOut, Lock, Edit3, Award, Flame, Coins, Sparkles, Smile } from 'lucide-react';
import AvatarPreview from '../components/AvatarPreview';
import AvatarCreator from '../components/AvatarCreator';

export const Dashboard = () => {
  const navigate = useNavigate();

  // Load Zustand stores
  const { user, logout, updateProfile, awardCoins } = useAuthStore();
  const { rooms, fetchRooms, setActiveRoom } = useCafeStore();

  const [showCreator, setShowCreator] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  // New Room fields
  const [roomName, setRoomName] = useState('');
  const [roomDesc, setRoomDesc] = useState('');
  const [roomTheme, setRoomTheme] = useState('tokyo_rain');
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPass, setRoomPass] = useState('');
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Save customized avatar
  const handleSaveAvatar = async (avatarData) => {
    const res = await updateProfile({ avatar: avatarData });
    if (res.success) {
      setShowCreator(false);
      awardCoins(10); // Reward cute coins for customizing!
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setRoomError(null);

    if (!roomName) {
      setRoomError('Please specify a cozy room name.');
      return;
    }

    setLoadingRoom(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({
          name: roomName,
          description: roomDesc,
          theme: roomTheme,
          isPrivate,
          password: roomPass
        })
      });
      const data = await response.json();

      if (data.success) {
        setShowRoomModal(false);
        setRoomName('');
        setRoomDesc('');
        setRoomTheme('tokyo_rain');
        setIsPrivate(false);
        setRoomPass('');
        
        // Refresh room list
        await fetchRooms();
        
        // Enter the newly created room!
        handleEnterRoom(data.room);
      } else {
        setRoomError(data.message);
      }
    } catch (err) {
      setRoomError('Connection error creating room.');
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleEnterRoom = (room) => {
    if (room.isPrivate) {
      const enteredPass = prompt('This café room is private. Please enter the password:');
      if (enteredPass !== room.password) {
        alert('Invalid password! Entering aborted.');
        return;
      }
    }
    setActiveRoom(room);
    navigate(`/room/${room._id}`);
  };

  const getThemeEmoji = (theme) => {
    switch (theme) {
      case 'tokyo_rain': return '☔';
      case 'beach_sunset': return '🌅';
      case 'mountain_cabin': return '🔥';
      case 'library_study': return '📚';
      case 'fantasy_garden': return '🧚';
      default: return '☕';
    }
  };

  const getThemeTitle = (theme) => {
    switch (theme) {
      case 'tokyo_rain': return 'Rainy Tokyo Café';
      case 'beach_sunset': return 'Beach Sunset Café';
      case 'mountain_cabin': return 'Mountain Cabin Café';
      case 'library_study': return 'Library Study Lounge';
      case 'fantasy_garden': return 'Fantasy Garden Spot';
      default: return 'Cozy Corner';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-100 p-6 flex flex-col gap-6 relative select-none">
      
      {/* Dynamic light effects */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(200,122,83,0.04)_1px,transparent_0)] bg-[size:32px_32px] pointer-events-none" />

      {/* TOP HEADER NAVIGATION */}
      <header className="flex justify-between items-center bg-white/70 py-3.5 px-6 rounded-cozy border border-cream-300 shadow-glass relative z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-2xl animate-bounce">☕</span>
          <span className="font-display font-extrabold text-xl text-cozy-darkWood tracking-tight">Mochill</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-cream-200 hover:bg-red-50 hover:text-red-600 text-xs font-bold text-cozy-brown rounded-lg transition-colors border border-cream-300 btn-bounce"
            title="Leave Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* DUAL CONTAINER LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* LEFT PANEL: PROFILE DASHBOARD & AVATAR MIRROR */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {showCreator ? (
            /* AVATAR BUILDER VIEW */
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-extrabold font-display text-cozy-darkWood">Tailor Your Outfit</h3>
                <button
                  onClick={() => setShowCreator(false)}
                  className="text-xs bg-white border border-cream-300 py-1 px-3 rounded-lg hover:bg-cream-50 font-bold"
                >
                  Cancel
                </button>
              </div>
              <AvatarCreator initialAvatar={user.avatar} onSave={handleSaveAvatar} buttonText="Update Avatar Style" />
            </div>
          ) : (
            /* PROFILE CARD */
            <div className="glass-panel p-6 rounded-cozy shadow-cozy border border-white/50 flex flex-col gap-5 items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cozy-sand/5 to-cozy-terracotta/5 pointer-events-none" />

              {/* Edit button */}
              <button
                onClick={() => setShowCreator(true)}
                className="absolute top-4 right-4 p-1.5 bg-white hover:bg-cream-50 rounded-full border border-cream-300 transition-all btn-bounce shadow-sm text-cozy-brown hover:text-cozy-darkWood"
                title="Edit Outfit"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Avatar visualization */}
              <div className="w-32 h-32 bg-white/60 rounded-full flex items-center justify-center shadow-inner relative border border-white mt-2">
                <AvatarPreview
                  hairstyle={user.avatar.hairstyle}
                  hairColor={user.avatar.hairColor}
                  outfit={user.avatar.outfit}
                  outfitColor={user.avatar.outfitColor}
                  skinTone={user.avatar.skinTone}
                  accessory={user.avatar.accessory}
                  pet={user.avatar.pet}
                  size={105}
                  animation="dancing"
                />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-extrabold font-display text-cozy-darkWood flex items-center justify-center gap-1">
                  <span>{user.username}</span>
                  <Smile className="w-4 h-4 text-cozy-terracotta" />
                </h2>
                <div className="text-[10px] text-cozy-terracotta font-extrabold uppercase bg-cozy-terracotta/10 py-0.5 px-3 rounded-full mt-1.5 w-fit mx-auto border border-cozy-terracotta/20">
                  Level {user.stats.level || 1} Chiller
                </div>
              </div>

              {/* COZY STATS ROW */}
              <div className="grid grid-cols-3 gap-2.5 w-full border-t border-cream-300/40 pt-4 text-center">
                <div className="flex flex-col items-center">
                  <Coins className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-cozy-darkWood mt-1">{user.stats.coins || 100}</span>
                  <span className="text-[9px] text-cozy-brown/80 font-bold uppercase tracking-wider mt-0.5">Coins</span>
                </div>
                <div className="flex flex-col items-center border-x border-cream-300/40">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-cozy-darkWood mt-1">{user.stats.streak || 0} Days</span>
                  <span className="text-[9px] text-cozy-brown/80 font-bold uppercase tracking-wider mt-0.5">Streak</span>
                </div>
                <div className="flex flex-col items-center">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-extrabold text-cozy-darkWood mt-1">{user.stats.xp || 0} XP</span>
                  <span className="text-[9px] text-cozy-brown/80 font-bold uppercase tracking-wider mt-0.5">Progress</span>
                </div>
              </div>

              {/* STATUS TEXT ROW */}
              <div className="w-full bg-cream-200/50 border border-cream-300/30 p-3 rounded-xl text-center text-xs font-bold text-cozy-brown italic">
                “{user.status || 'Chilling ☕'}”
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CAFÉ ROOM SELECTOR */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-cozy-terracotta animate-spin" style={{ animationDuration: '8s' }} />
              <h2 className="text-lg font-extrabold font-display text-cozy-darkWood">Discover Café Rooms</h2>
            </div>
            
            <button
              onClick={() => setShowRoomModal(true)}
              className="py-2 px-4 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-extrabold rounded-xl shadow text-xs flex items-center gap-1.5 btn-bounce"
            >
              <Plus className="w-4 h-4" />
              <span>Host Café Room</span>
            </button>
          </div>

          {/* ROOM CARD LIST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rooms.length === 0 ? (
              <div className="col-span-full bg-white/70 p-12 rounded-cozy text-center border border-cream-300 shadow-glass flex flex-col items-center justify-center gap-3">
                <span className="text-5xl">🌾</span>
                <h3 className="text-base font-bold text-cozy-darkWood">Quiet lounges right now.</h3>
                <p className="text-xs text-cozy-brown max-w-xs">Be the first to host a cozy café room and invite other chillers!</p>
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="py-2 px-5 bg-cozy-moss hover:bg-cozy-moss/90 text-white font-bold rounded-lg shadow text-xs mt-1 btn-bounce"
                >
                  Create Room
                </button>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleEnterRoom(room)}
                  className="bg-white/95 hover:bg-white p-5 rounded-cozy border border-cream-300 shadow-glass hover:shadow-cozy hover:border-cozy-terracotta/30 transition-all cursor-pointer btn-bounce flex flex-col gap-4 relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start">
                    {/* Theme visual badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl bg-cream-200 w-10 h-10 rounded-lg flex items-center justify-center shadow-inner select-none shrink-0">
                        {getThemeEmoji(room.theme)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-cozy-darkWood truncate group-hover:text-cozy-terracotta transition-colors pr-2">
                          {room.name}
                        </h3>
                        <p className="text-[9px] text-cozy-terracotta font-extrabold uppercase mt-0.5">
                          {getThemeTitle(room.theme)}
                        </p>
                      </div>
                    </div>

                    {/* Private lock badge */}
                    {room.isPrivate && (
                      <span className="p-1 bg-amber-50 text-amber-600 rounded-md border border-amber-200">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-cozy-brown/95 font-medium line-clamp-2 leading-relaxed flex-1">
                    {room.description}
                  </p>

                  <div className="border-t border-cream-300/40 pt-3 flex justify-between items-center text-[10px] text-cozy-brown/80 font-bold uppercase tracking-wider select-none">
                    <span className="flex items-center gap-1 text-cozy-moss">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Cozy spot active</span>
                    </span>
                    <span className="bg-cream-200 px-2.5 py-0.5 rounded-full text-cozy-darkWood">
                      Enter Lounge 🛋️
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CREATE COZY ROOM DIALOG MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-6 select-none">
          <div className="w-full max-w-md bg-white border-2 border-cream-300 rounded-cozy p-6 shadow-2xl relative flex flex-col gap-5">
            <div className="flex justify-between items-center pb-2 border-b border-cream-200">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🛎️</span>
                <h2 className="text-base font-extrabold font-display text-cozy-darkWood">Configure Café Room</h2>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-xs bg-cream-200 hover:bg-cream-300 px-3 py-1.5 rounded-lg border border-cream-300 font-bold transition-all"
              >
                Cancel
              </button>
            </div>

            {roomError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg">
                ⚠️ {roomError}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
              {/* Room name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-cozy-darkWood">🏷️ Room Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rainy Lo-Fi Study Spot"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  required
                  maxLength={24}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-cozy-darkWood">📝 Description</label>
                <input
                  type="text"
                  placeholder="What is this lounge about?"
                  value={roomDesc}
                  onChange={(e) => setRoomDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                  maxLength={60}
                />
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-cozy-darkWood">⛅ Café Decor Theme</label>
                <select
                  value={roomTheme}
                  onChange={(e) => setRoomTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-cozy-terracotta text-cozy-darkWood"
                >
                  <option value="tokyo_rain">☔ Rainy Tokyo Café</option>
                  <option value="beach_sunset">🌅 Beach Sunset Café</option>
                  <option value="mountain_cabin">🔥 Mountain Cabin Cabin</option>
                  <option value="library_study">📚 Library Study Lounge</option>
                  <option value="fantasy_garden">🧚 Fantasy Garden Spot</option>
                </select>
              </div>

              {/* Privacy flag */}
              <div className="flex justify-between items-center bg-cream-200/40 p-3 rounded-lg border border-cream-300/30">
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="text-xs font-bold text-cozy-darkWood">🔒 Private Lounge</span>
                  <span className="text-[10px] text-cozy-brown">Requires friends to enter a password</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 rounded border-cream-300 text-cozy-terracotta focus:ring-cozy-terracotta cursor-pointer"
                />
              </div>

              {/* Password field */}
              {isPrivate && (
                <div className="flex flex-col gap-1.5 animate-pulse">
                  <label className="text-xs font-bold text-cozy-darkWood">🔑 Set Password</label>
                  <input
                    type="password"
                    placeholder="Enter custom room key"
                    value={roomPass}
                    onChange={(e) => setRoomPass(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cozy-terracotta"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loadingRoom}
                className="w-full mt-2 py-3 px-5 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-bold rounded-lg shadow text-xs flex items-center justify-center gap-2"
              >
                <span>🛎️</span>
                <span>{loadingRoom ? 'Hosting...' : 'Host Café'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
