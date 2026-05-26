import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Music, Users, Compass, ShieldAlert, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const particleCanvasRef = useRef(null);
  
  // Ambient Sound ref
  const ambientAudioRef = useRef(null);
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  // 1. Particle Canvas simulation (Warm sunlight dust motes)
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Build particle array
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 0.5,
      speedX: Math.random() * 0.4 - 0.2,
      speedY: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.5 + 0.1
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Warm sunbeam light rays overlay
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(244, 234, 224, 0.08)');
      gradient.addColorStop(0.5, 'rgba(200, 122, 83, 0.04)');
      gradient.addColorStop(1, 'rgba(168, 178, 150, 0.04)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 234, 224, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FAF6F0';
        ctx.fill();

        p.x += p.speedX;
        p.y -= p.speedY;

        // Reset if float off screen top/sides
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0 || p.x > canvas.width) {
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. GSAP Scroll storytelling animations
  useEffect(() => {
    // Fade in scroll sections
    gsap.utils.toArray('.story-section').forEach((section) => {
      gsap.fromTo(
        section.querySelector('.story-content'),
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none none'
          }
        }
      );
      
      gsap.fromTo(
        section.querySelector('.story-visual'),
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }, []);

  const handleAmbientPlay = () => {
    if (!ambientAudioRef.current) return;
    
    if (ambientPlaying) {
      ambientAudioRef.current.pause();
      setAmbientPlaying(false);
    } else {
      ambientAudioRef.current.play().catch(() => {});
      setAmbientPlaying(true);
    }
  };

  const handleEnter = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden select-none">
      
      {/* Background music controller HUD */}
      <div className="fixed top-5 right-5 z-50">
        <button
          onClick={handleAmbientPlay}
          className="flex items-center gap-2 py-2 px-4 rounded-full border border-white/40 glass-panel hover:bg-cream-200 transition-colors btn-bounce text-xs font-bold text-cozy-darkWood shadow-md"
        >
          {ambientPlaying ? (
            <>
              <Volume2 className="w-4 h-4 text-cozy-terracotta animate-pulse" />
              <span>Cozy Ambience: On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-cozy-brown" />
              <span>Play Cozy Ambience</span>
            </>
          )}
        </button>
        <audio
          ref={ambientAudioRef}
          src="https://assets.mixkit.co/active_storage/sfx/2438/2438-84.wav" // Relaxing nature bird soundscape loop
          loop
        />
      </div>

      {/* BACKGROUND PARTICLES LAYER */}
      <canvas
        ref={particleCanvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* HERO SECTION */}
      <header className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 z-10 gap-6 mt-[-40px]">
        {/* Soft Moving Cloud SVGs */}
        <div className="absolute top-20 left-0 w-full overflow-hidden pointer-events-none z-[-1] opacity-40">
          <svg className="w-[300px] h-[100px] text-white/50 fill-current animate-cloud-move" style={{ animationDuration: '90s' }} viewBox="0 0 100 40">
            <path d="M10,30 Q15,15 25,25 Q35,10 45,25 Q55,15 65,30 Z" />
          </svg>
          <svg className="w-[400px] h-[120px] text-white/40 fill-current animate-cloud-move" style={{ animationDuration: '140s', animationDelay: '-40s' }} viewBox="0 0 100 40">
            <path d="M20,25 Q30,5 45,20 Q60,0 75,20 Q85,10 95,25 Z" />
          </svg>
        </div>

        {/* Floating lanterns */}
        <div className="absolute top-36 left-[15%] w-8 h-12 bg-cozy-terracotta/20 rounded-full blur-md animate-float-lantern" style={{ animationDuration: '7s' }} />
        <div className="absolute top-48 right-[18%] w-6 h-10 bg-cozy-sand/30 rounded-full blur-sm animate-float-lantern" style={{ animationDuration: '9s', animationDelay: '2s' }} />

        {/* Steaming Coffee Logo animation */}
        <div className="relative group">
          <div className="w-24 h-24 bg-white/70 border border-white rounded-full flex items-center justify-center shadow-cozy relative btn-bounce">
            <div className="absolute -top-3 left-[32%] flex gap-1 animate-coffee-steam">
              <svg width="10" height="25" viewBox="0 0 10 25" fill="none"><path d="M 5,22 C 2,16 8,10 5,2" stroke="#8D7B68" strokeWidth="2" strokeLinecap="round" className="coffee-steam-path" /></svg>
              <svg width="10" height="25" viewBox="0 0 10 25" fill="none"><path d="M 5,22 C 2,16 8,10 5,2" stroke="#8D7B68" strokeWidth="2" strokeLinecap="round" className="coffee-steam-path" style={{ animationDelay: '0.8s' }} /></svg>
            </div>
            <Coffee className="w-12 h-12 text-cozy-terracotta" />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col gap-2.5 max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold font-display tracking-tight text-cozy-darkWood leading-tight">
            Mo<span className="text-cozy-terracotta">chill</span>
          </h1>
          <p className="text-sm md:text-base font-semibold text-cozy-brown/90 uppercase tracking-widest">
            mocha + chill
          </p>
          <h2 className="text-xl md:text-2xl font-bold font-display text-cozy-darkWood/85 mt-2 italic">
            “Your cozy Ghibli-themed virtual café metaverse”
          </h2>
          <p className="text-xs md:text-sm text-cozy-brown font-medium max-w-md mx-auto leading-relaxed mt-2">
            Step into a peaceful social sanctuary where you can chat, listen to synchronized lo-fi music, play board games, customize avatars, and study together.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center items-center mt-6">
          <button
            onClick={handleEnter}
            className="py-4 px-8 bg-cozy-terracotta hover:bg-cozy-terracotta/90 text-white font-extrabold rounded-cozy shadow-cozy hover:shadow-cozy-hover transition-all btn-bounce text-sm flex items-center gap-2 border border-cozy-terracotta/20"
          >
            <span>🛋️</span>
            <span>Enter Virtual Café</span>
          </button>
          
          <button
            onClick={handleEnter}
            className="py-4 px-8 bg-white hover:bg-cream-50 text-cozy-darkWood font-extrabold rounded-cozy shadow-cozy hover:shadow-cozy-hover transition-all btn-bounce text-sm flex items-center gap-2 border border-cream-300"
          >
            <span>🔑</span>
            <span>Create Guest Session</span>
          </button>
        </div>
      </header>

      {/* STORYTELLING SECTIONS */}
      <main className="z-10 w-full flex flex-col gap-24 py-16 bg-gradient-to-b from-transparent via-white/80 to-transparent">
        
        {/* SECTION 1: RELAX & STUDY */}
        <section className="story-section max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px]">
          <div className="story-visual w-full aspect-video md:aspect-[4/3] bg-cozy-beige/40 rounded-cozy border border-cream-300 shadow-cozy flex items-center justify-center text-8xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(#C87A53_1px,transparent_0)] bg-[size:16px_16px] opacity-10" />
            <div className="bg-white/80 p-8 rounded-full shadow-lg border border-cream-200 animate-bounce" style={{ animationDuration: '4s' }}>
              📝🍵
            </div>
          </div>
          <div className="story-content flex flex-col gap-4 text-left">
            <div className="w-10 h-10 bg-cozy-moss/10 text-cozy-moss rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-3xl font-extrabold font-display text-cozy-darkWood">Relax & Study Together</h3>
            <p className="text-sm text-cozy-brown leading-relaxed">
              Sit at quiet wooden tables, toggle focus-mode timers, and drink matcha lattes to boost your productivity. View other students' virtual timers and stay motivated together in a peaceful, noise-free sanctuary.
            </p>
          </div>
        </section>

        {/* SECTION 2: MEET NEW PEOPLE */}
        <section className="story-section max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px] md:flex-row-reverse">
          <div className="story-content flex flex-col gap-4 text-left md:order-2">
            <div className="w-10 h-10 bg-cozy-terracotta/10 text-cozy-terracotta rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-3xl font-extrabold font-display text-cozy-darkWood">Meet New Friends</h3>
            <p className="text-sm text-cozy-brown leading-relaxed">
              Equipped with WebRTC proximity spatial audio, you can automatically talk to players who walk near your avatar! Strike up a chat at coffee counters, leave sticky notes inside the community guestbook, or follow chilling peers.
            </p>
          </div>
          <div className="story-visual w-full aspect-video md:aspect-[4/3] bg-cozy-sand/20 rounded-cozy border border-cream-300 shadow-cozy flex items-center justify-center text-8xl md:order-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#A8B296_1px,transparent_0)] bg-[size:16px_16px] opacity-10" />
            <div className="bg-white/80 p-8 rounded-full shadow-lg border border-cream-200 animate-pulse">
              🤝🎙️
            </div>
          </div>
        </section>

        {/* SECTION 3: SYNC LO-FI */}
        <section className="story-section max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px]">
          <div className="story-visual w-full aspect-video md:aspect-[4/3] bg-cozy-lavender/30 rounded-cozy border border-cream-300 shadow-cozy flex items-center justify-center text-8xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#8D7B68_1px,transparent_0)] bg-[size:16px_16px] opacity-10" />
            <div className="bg-white/80 p-8 rounded-full shadow-lg border border-cream-200 animate-spin" style={{ animationDuration: '10s' }}>
              📻💿
            </div>
          </div>
          <div className="story-content flex flex-col gap-4 text-left">
            <div className="w-10 h-10 bg-cozy-terracotta/10 text-cozy-terracotta rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-3xl font-extrabold font-display text-cozy-darkWood">Listen To Live Lo-Fi</h3>
            <p className="text-sm text-cozy-brown leading-relaxed">
              Take control of a synchronized vinyl record player! Queue up your favorite chillhop tracks, vote-skip tracks, and enjoy high-fidelity nature ambient sounds like rainfall, windchimes, and crackling fireplaces that scale with your position.
            </p>
          </div>
        </section>

        {/* SECTION 4: CUSTOMIZE AVATARS */}
        <section className="story-section max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[400px] md:flex-row-reverse">
          <div className="story-content flex flex-col gap-4 text-left md:order-2">
            <div className="w-10 h-10 bg-cozy-moss/10 text-cozy-moss rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-3xl font-extrabold font-display text-cozy-darkWood">Customize Cozy Avatars</h3>
            <p className="text-sm text-cozy-brown leading-relaxed">
              Design a highly customizable vector avatar. Style hair colors, overalls, wool beanies, wireframe specs, or choose adorable pets (floating shiba, fuzzy cat, smiling cloud) that follow you through the lounge!
            </p>
          </div>
          <div className="story-visual w-full aspect-video md:aspect-[4/3] bg-cozy-beige/40 rounded-cozy border border-cream-300 shadow-cozy flex items-center justify-center text-8xl md:order-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#C87A53_1px,transparent_0)] bg-[size:16px_16px] opacity-10" />
            <div className="bg-white/80 p-8 rounded-full shadow-lg border border-cream-200 animate-bounce" style={{ animationDuration: '6s' }}>
              🧸👗
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-auto bg-cozy-darkWood text-cream-100 py-8 px-6 text-center z-10 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-display font-extrabold text-lg text-cream-50">Mochill</span>
          </div>
          <p className="text-xs text-neutral-400">
            © 2026 Mochill Lounge. Engineered for ultimate cozy metaverses.
          </p>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
