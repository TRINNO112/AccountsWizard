
import React, { useState, useEffect, useRef } from 'react';
import Book3D from './components/Book3D';
import { YEARBOOK_DATA } from './constants';

const App: React.FC = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#020202] relative selection:bg-amber-500/30 overflow-y-auto overflow-x-hidden text-white font-sans" ref={containerRef}>
      
      {/* 
          CINEMATIC ATMOSPHERIC BACKGROUND 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Base Deep Gradient */}
         <div className="absolute inset-0 bg-[#050505]" />
         
         {/* Interactive Spotlight */}
         <div 
           className="absolute inset-0 opacity-40 transition-opacity duration-1000"
           style={{
             background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(212,175,55,0.15) 0%, transparent 50%)`
           }}
         />

         {/* Light Leaks */}
         <div className={`absolute top-[-10%] left-[-10%] w-[100%] h-[100%] bg-amber-900/10 rounded-full blur-[180px] animate-pulse-slow transition-opacity duration-[3s] ${isOpened ? 'opacity-100' : 'opacity-60'}`} />
         <div className={`absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-amber-700/5 rounded-full blur-[140px] transition-opacity duration-[3s] ${isOpened ? 'opacity-100' : 'opacity-40'}`} />
         
         {/* Grain & Texture */}
         <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
         <div className="absolute inset-0 backdrop-blur-[1px] bg-black/20" />

         {/* Floating Gold Dust Particles */}
         <div className="particles-container absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="particle absolute w-1 h-1 bg-amber-500/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${10 + Math.random() * 20}s linear infinite`,
                  animationDelay: `${-Math.random() * 20}s`
                }}
              />
            ))}
         </div>
      </div>

      {/* Hero Section - The Landing Page */}
      <div className={`relative flex-shrink-0 min-h-screen flex flex-col items-center justify-center p-8 z-20 text-center transition-all duration-[1.5s] ease-[cubic-bezier(0.2, 1, 0.2, 1)] ${isOpened ? 'opacity-0 pointer-events-none absolute w-full h-full scale-95 -translate-y-32' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className={`max-w-5xl space-y-12 transition-all duration-[1.2s] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-4 px-8 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_15px_#f59e0b]" />
            <span className="text-amber-500/80 text-[12px] font-black tracking-[0.8em] uppercase">The Celestial Archive</span>
          </div>
          
          {/* Main Title with Layered Design */}
          <div className="relative py-4">
            <h1 className="relative font-serif text-7xl md:text-[11rem] tracking-tighter leading-none select-none">
              <span className="block text-white/90 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">The Legacy</span>
              <span className="relative text-[#d4af37] italic font-cursive block md:mt-[-2rem] drop-shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:text-amber-400 transition-colors duration-500">
                Edition
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              </span>
            </h1>
          </div>
          
          {/* Subtitle */}
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-gray-400 font-light text-lg md:text-2xl leading-relaxed font-serif italic opacity-70 tracking-wide">
              "Honoring the collective journey, shared milestones, and the enduring spirit of the OSEM Class of 2025."
            </p>
            <div className="flex items-center justify-center gap-4 opacity-30">
              <div className="h-[1px] w-12 bg-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">Established MCMXCVII</span>
              <div className="h-[1px] w-12 bg-amber-500" />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-20">
            <button 
              onClick={() => setIsOpened(true)}
              className="group relative px-24 py-7 bg-transparent border-[1.5px] border-amber-500/30 overflow-hidden rounded-full transition-all hover:border-amber-500 hover:shadow-[0_0_60px_rgba(212,175,55,0.25)] active:scale-95"
            >
              <div className="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.2,1)]" />
              <div className="relative flex items-center gap-3">
                <span className="text-white group-hover:text-black font-black text-[14px] tracking-[0.6em] uppercase transition-colors duration-500">Relive the Story</span>
                <svg className="w-5 h-5 text-amber-500 group-hover:text-black transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
            <div className="mt-8 text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold animate-bounce-slow">
              Click to Enter
            </div>
          </div>
        </div>
      </div>

      {/* 3D Book Stage */}
      <main className={`fixed inset-0 z-50 transition-all duration-[1.5s] ease-[cubic-bezier(0.2, 1, 0.2, 1)] pointer-events-none ${isOpened ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-60 scale-75'}`}>
         {isOpened && (
           <div className="w-full h-full flex items-center justify-center p-6 md:p-12 pointer-events-auto overflow-hidden">
             <div className="relative">
               <Book3D isOpened={isOpened} onToggle={() => setIsOpened(false)} />
             </div>
           </div>
         )}
      </main>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(20px) scale(0.5); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        * { 
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .font-cursive {
           font-family: 'Great Vibes', cursive;
        }
      `}</style>
    </div>
  );
};

export default App;
