import React, { useState, useRef, useEffect, useMemo } from 'react';
import { YEARBOOK_DATA } from '../constants';

interface Book3DProps {
  isOpened: boolean;
  onToggle: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

const Book3D: React.FC<Book3DProps> = ({ isOpened, onToggle }) => {
  const [currentPage, setCurrentPage] = useState(-1);
  const [isCoverOpened, setIsCoverOpened] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pageFlipProgress, setPageFlipProgress] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const totalPages = YEARBOOK_DATA.pages.length;
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bookGlow, setBookGlow] = useState(false);
  const animationFrameRef = useRef<number>();
  const particleIdCounter = useRef(0);

  // Enhanced audio initialization with reverb
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Advanced page flip sound with layered tones
  const playFlipSound = (isClosing = false) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // Main flip sound
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(isClosing ? 150 : 250, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.4);
    gain1.gain.setValueAtTime(0.04, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Harmonic layer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(isClosing ? 300 : 450, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain2.gain.setValueAtTime(0.02, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.3);

    // Paper rustle noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.008, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + 0.2);
  };

  // Particle system for magical effects
  const createParticles = (count: number, sourceX: number, sourceY: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#d4af37', '#ffd700', '#ffed4e', '#fff8dc', '#f0e68c'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 2 + 1;
      newParticles.push({
        id: particleIdCounter.current++,
        x: sourceX,
        y: sourceY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1, // gravity
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length > 0]);

  // Enhanced mouse tracking for 3D parallax
  useEffect(() => {
    if (!isOpened) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpened]);

  // Advanced page navigation with animation
  const handleNextPage = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (currentPage < totalPages - 1 && !isFlipping) {
      setIsFlipping(true);
      setPageFlipProgress(0);

      // Animate flip progress
      const duration = 1200;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out cubic
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setPageFlipProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCurrentPage(prev => prev + 1);
          setIsFlipping(false);
          setPageFlipProgress(0);
        }
      };

      requestAnimationFrame(animate);
      playFlipSound();
      createParticles(15, window.innerWidth / 2 + 100, window.innerHeight / 2);
    }
  };

  const handlePrevPage = (e?: React.MouseEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    if (currentPage >= 0 && !isFlipping) {
      setIsFlipping(true);
      setCurrentPage(prev => prev - 1);
      playFlipSound(true);
      createParticles(15, window.innerWidth / 2 - 100, window.innerHeight / 2);

      setTimeout(() => setIsFlipping(false), 1200);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpened) return;

      if (isCoverOpened) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          handleNextPage(e);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          handlePrevPage(e);
        }
      }

      if (e.key === 'Escape') {
        handleCloseBook();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpened, isCoverOpened, currentPage, isFlipping]);

  const handleOpenCover = () => {
    initAudio();
    setIsCoverOpened(true);
    setCurrentPage(-1);
    setBookGlow(true);
    playFlipSound();
    createParticles(30, window.innerWidth / 2, window.innerHeight / 2);

    setTimeout(() => setBookGlow(false), 2000);
  };

  const handleCloseBook = () => {
    setIsCoverOpened(false);
    setCurrentPage(-1);
    createParticles(20, window.innerWidth / 2, window.innerHeight / 2);

    setTimeout(() => {
      onToggle();
    }, 800);
  };

  // Advanced 3D transformations with parallax
  const getContainerStyle = (): React.CSSProperties => {
    const baseRotY = isCoverOpened ? -5 : (isHovered ? -12 : -18);
    const baseRotX = isCoverOpened ? 2 : 10;

    // Add subtle parallax based on mouse position
    const parallaxRotY = mousePosition.x * 3;
    const parallaxRotX = mousePosition.y * -2;

    const rotY = baseRotY + parallaxRotY;
    const rotX = baseRotX + parallaxRotX;

    // Move book 25 pixels to the right
    const translateX = isCoverOpened ? 'calc(15% + 25px)' : '25px';

    return {
      transformStyle: 'preserve-3d',
      perspective: '3000px',
      transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateX(${translateX})`,
      transition: 'transform 1.5s cubic-bezier(0.2, 1, 0.2, 1)',
      margin: '0 auto',
      filter: bookGlow ? 'drop-shadow(0 0 40px rgba(212, 175, 55, 0.8))' : 'none'
    };
  };

  const pageTransition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';

  // Enhanced page rendering with dynamic effects
  const renderPage = (page: any, index: number) => {
    const isFlipped = index <= currentPage;
    const zPos = isFlipped ? (index * 0.5) : ((totalPages - index) * 0.5);
    const isCurrentlyFlipping = isFlipping && index === currentPage + 1;

    // Calculate page curl effect
    const curlIntensity = isCurrentlyFlipping ? pageFlipProgress * 15 : 0;

    return (
      <div
        key={index}
        className="absolute inset-0 origin-left"
        style={{
          transformStyle: 'preserve-3d',
          transition: isCurrentlyFlipping ? 'none' : pageTransition,
          transform: `rotateY(${isFlipped ? -178 : 0}deg) translateZ(${zPos}px)`,
          zIndex: isFlipped ? index + 10 : (totalPages - index) + 10,
        }}
      >
        {/* Page Front with enhanced styling */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#fffefb] via-[#fefdf8] to-[#faf9f5] rounded-r-sm border-l border-gray-200 overflow-hidden shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: '0 0 20px rgba(0,0,0,0.1), inset -2px 0 8px rgba(0,0,0,0.05)'
          }}
        >
          <div className="h-full flex flex-col relative p-10 md:p-14 text-black">
            {/* Left shadow gradient (spine shadow) */}
            <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-r from-black/[0.15] via-black/[0.05] to-transparent pointer-events-none z-20" />

            {/* Decorative corner flourishes */}
            <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-amber-200/40 rounded-tr-2xl" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-amber-200/40 rounded-br-2xl" />
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-amber-200/30 rounded-tl-2xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-amber-200/30 rounded-bl-2xl" />

            {/* Page header with decorative elements */}
            <div className="flex items-center justify-between mb-10 border-b-2 border-amber-100/50 pb-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="text-[10px] text-amber-700/70 font-black uppercase tracking-[0.3em]">
                  Memoir {index + 1}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-300/40" />
                <span className="text-[10px] text-gray-400 font-serif italic tracking-widest">OSEM 2025</span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-amber-300/40" />
              </div>
            </div>

            {/* Decorative drop cap effect */}
            <div className="mb-6">
              <h2 className="font-serif text-4xl md:text-5xl text-amber-950 leading-tight font-bold relative">
                <span className="absolute -left-2 -top-1 text-6xl md:text-7xl text-amber-500/10 font-cursive -z-10">
                  {page.title[0]}
                </span>
                {page.title}
              </h2>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-[2px] w-16 bg-gradient-to-r from-amber-500 to-transparent" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
              </div>
            </div>

            {/* Content with enhanced typography */}
            <div className="text-gray-800 text-base md:text-lg leading-relaxed font-light space-y-4">
              {typeof page.content === 'string' ? (
                <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-900/70 first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                  {page.content}
                </p>
              ) : (
                page.content
              )}
            </div>

            {/* Decorative divider */}
            <div className="mt-8 flex items-center justify-center gap-4 opacity-20">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
              <div className="w-2 h-2 rotate-45 border border-amber-600" />
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            </div>

            {/* Page number with ornamental design */}
            <div className="mt-auto pt-10 flex items-center justify-center">
              <div className="flex items-center gap-4 opacity-40">
                <div className="h-[1px] w-12 bg-amber-900" />
                <div className="flex flex-col items-center">
                  <div className="w-8 h-[1px] bg-amber-900 mb-2" />
                  <span className="font-serif italic text-base text-amber-900 px-3">{index + 1}</span>
                  <div className="w-8 h-[1px] bg-amber-900 mt-2" />
                </div>
                <div className="h-[1px] w-12 bg-amber-900" />
              </div>
            </div>

            {/* Paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`
              }}
            />
          </div>
        </div>

        {/* Page Back with texture */}
        <div
          className="absolute inset-0 bg-gradient-to-l from-[#f5f5f0] via-[#fafaf8] to-[#ececec] rounded-l-sm shadow-inner"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="h-full w-full flex items-center justify-center relative overflow-hidden">
            {/* Right shadow gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-black/[0.12] via-black/[0.04] to-transparent" />

            {/* Watermark */}
            <div className="text-amber-900/[0.03] text-[10rem] md:text-[14rem] font-cursive -rotate-12 select-none absolute">
              OSEM
            </div>

            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'radial-gradient(circle, #d4af37 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative w-[310px] h-[460px] md:w-[500px] md:h-[680px] select-none z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getContainerStyle()}
    >
      {/* Particle System Rendering */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transform: 'translate(-50%, -50%)',
            zIndex: 9999
          }}
        />
      ))}

      {/* Exit Button */}
      {isOpened && (
        <button
          onClick={handleCloseBook}
          className="fixed top-8 right-8 z-[1000] group flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 pointer-events-auto shadow-xl"
        >
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/50 group-hover:text-white transition-colors">
            Exit Archive
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </div>
        </button>
      )}

      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>

        {/* Enhanced Physical Spine with details */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[44px] bg-gradient-to-r from-[#1a1403] via-[#221a05] to-[#1a1403] shadow-inner"
          style={{
            transform: 'translateX(-22px) rotateY(-90deg)',
            transformOrigin: 'left',
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), inset 4px 0 8px rgba(0,0,0,0.6)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/30" />

          {/* Spine texture lines */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-[2px] bg-black/20"
              style={{ top: `${(i + 1) * 8}%` }}
            />
          ))}

          {/* Spine text */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            <span className="text-amber-500/40 text-xs font-serif tracking-widest">
              OSEM 2025
            </span>
          </div>
        </div>

        {/* Enhanced Back Cover */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c] via-[#080808] to-[#000000] rounded-r-lg border-[5px] border-[#332a05] shadow-[30px_0_60px_rgba(0,0,0,1)]"
          style={{
            transform: 'translateZ(-15px)',
            boxShadow: '30px 0 60px rgba(0,0,0,1), inset 0 0 50px rgba(212,175,55,0.1)'
          }}
        >
          {/* Back cover decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-8 border border-amber-500/30 rounded-lg" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500/20 text-8xl font-cursive">
              2025
            </div>
          </div>
        </div>

        {/* Render all pages */}
        {YEARBOOK_DATA.pages.map((page, index) => renderPage(page, index))}

        {/* Enhanced Front Cover */}
        <div
          className="absolute inset-0 origin-left cursor-pointer group"
          style={{
            transformStyle: 'preserve-3d',
            zIndex: 100,
            transition: pageTransition,
            transform: `rotateY(${isCoverOpened ? -179 : 0}deg) translateZ(12px)`
          }}
          onClick={!isCoverOpened ? handleOpenCover : undefined}
        >
          {/* Cover Front Surface - Premium Yearbook Design */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] via-[#0a0a0a] to-[#000000] rounded-r-lg border-[10px] border-[#d4af37] flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-all duration-700"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
              boxShadow: '30px 30px 80px rgba(0,0,0,1), inset 0 0 100px rgba(212,175,55,0.1)',
            }}
          >
            {/* Leather texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-60 mix-blend-overlay pointer-events-none" />

            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/60 pointer-events-none" />

            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] pointer-events-none" />

            {/* Multiple decorative borders */}
            <div className="absolute inset-4 border-2 border-amber-500/20 rounded-r-md pointer-events-none" />
            <div className="absolute inset-6 border border-amber-600/10 rounded-r-md pointer-events-none" />

            {/* Corner ornaments */}
            <div className="absolute top-2 right-2 w-20 h-20 border-t-4 border-r-4 border-amber-600/40 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-20 h-20 border-b-4 border-r-4 border-amber-600/40 rounded-br-2xl pointer-events-none" />
            <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-amber-600/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-16 h-16 border-b-4 border-l-4 border-amber-600/30 rounded-bl-2xl pointer-events-none" />

            {/* Main content with 3D layers */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8 md:space-y-12 transition-transform duration-700 group-hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>

              {/* Top decorative flourish */}
              <div
                className="flex flex-col items-center gap-4"
                style={{ transform: 'translateZ(20px)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-500/60" />
                  <div className="w-3 h-3 rotate-45 border-2 border-amber-500/60" />
                  <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-500/60" />
                </div>

                <div
                  className="text-amber-500/60 text-[11px] font-black tracking-[0.9em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
                >
                  The Celestial Archive
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                </div>
              </div>

              {/* Year - Hero element */}
              <div className="relative" style={{ transform: 'translateZ(50px)' }}>
                <h1 className="text-[8rem] md:text-[13rem] font-cursive text-[#d4af37] leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,1)] filter brightness-110 tracking-wider">
                  2025
                </h1>
                {/* Glow effect */}
                <div className="absolute inset-0 blur-3xl bg-amber-500/10 -z-10 group-hover:bg-amber-500/30 transition-all duration-700" />
                {/* Reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-30 pointer-events-none" />
              </div>

              {/* School name section */}
              <div className="pt-4 space-y-6" style={{ transform: 'translateZ(30px)' }}>
                <div className="font-serif text-3xl md:text-5xl text-white tracking-[0.5em] font-bold uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                  OM SHANTI
                </div>

                {/* Divider with ornament */}
                <div className="flex items-center justify-center gap-6">
                  <div className="h-[1.5px] w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/40" />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    </div>
                    <div className="text-[12px] text-amber-200/50 uppercase tracking-[0.7em] font-black">
                      Grade XII
                    </div>
                  </div>
                  <div className="h-[1.5px] w-16 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/40" />
                </div>

                {/* Subtitle */}
                <div className="text-amber-400/40 text-sm tracking-[0.4em] uppercase font-light">
                  Memories Eternal
                </div>
              </div>

              {/* Hover prompt */}
              <div
                className="pt-12 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-8 group-hover:translate-y-0"
                style={{ transform: 'translateZ(15px)' }}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-[1px] bg-amber-500/40 animate-pulse" />
                  <span className="text-amber-500/80 text-[13px] tracking-[0.5em] font-bold uppercase animate-pulse">
                    Open Legacy
                  </span>
                  <div className="w-6 h-6 rounded-full border-2 border-amber-500/40 flex items-center justify-center animate-bounce">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Radial gradient overlay for vignette effect */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />
          </div>

          {/* Cover Interior Surface - Enhanced */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#fffefb] via-[#fefdf8] to-[#faf9f5] rounded-l-md border-r-[24px] border-amber-950/30 flex flex-col items-center justify-center p-12 md:p-16 text-center shadow-inner"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              boxShadow: 'inset 0 0 80px rgba(212,175,55,0.1)'
            }}
          >
            {/* Decorative icon */}
            <div className="w-24 h-24 mb-10 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-full flex items-center justify-center border-2 border-amber-200/50 shadow-xl relative">
              <span className="text-5xl">📜</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/60 to-transparent" />
            </div>

            {/* Preface title */}
            <h4 className="font-serif text-5xl text-amber-900/50 mb-8 italic tracking-wide">
              Preface
            </h4>

            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-2 h-2 rotate-45 bg-amber-300/50" />
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
              <div className="w-2 h-2 rotate-45 bg-amber-300/50" />
            </div>

            {/* Content */}
            <div className="space-y-6 text-[11px] text-amber-900/50 font-black uppercase tracking-[0.5em] max-w-xs">
              <div className="flex flex-col gap-2">
                <div>Class of 2025</div>
                <div className="w-16 h-[1px] bg-amber-300/40 mx-auto" />
              </div>
              <div className="flex flex-col gap-2">
                <div>A Journey Remembered</div>
                <div className="w-16 h-[1px] bg-amber-300/40 mx-auto" />
              </div>
              <div className="text-amber-900/30 text-[10px]">
                Forever in Our Hearts
              </div>
            </div>

            {/* Bottom ornament */}
            <div className="mt-12 flex items-center gap-2">
              <div className="w-8 h-[1px] bg-amber-300/30" />
              <div className="w-3 h-3 rounded-full border border-amber-300/30" />
              <div className="w-8 h-[1px] bg-amber-300/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Controls */}
      {isCoverOpened && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 py-5 px-10 bg-black/70 backdrop-blur-3xl rounded-full border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[999] animate-fade-in transition-all">
          <button
            onClick={(e) => handlePrevPage(e)}
            disabled={currentPage === -1 || isFlipping}
            className="p-4 text-amber-500 bg-white/5 rounded-full hover:bg-amber-500 hover:text-black transition-all disabled:opacity-0 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 disabled:scale-100"
            title="Previous Page (← or ↑)"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          <div className="flex flex-col items-center min-w-[120px]">
            <span className="text-[11px] text-amber-500/50 font-black uppercase tracking-[0.3em] mb-2">
              Memoir
            </span>
            <div className="relative">
              <span className="text-white text-2xl font-mono font-bold tracking-[0.2em] bg-white/5 px-8 py-2 rounded-lg border border-white/10 shadow-inner block">
                {currentPage === -1 ? "INT" : (currentPage + 1).toString().padStart(2, '0')}
              </span>
              <div className="absolute inset-0 bg-amber-500/5 rounded-lg blur-xl -z-10" />
            </div>
            <span className="text-[9px] text-amber-500/30 font-medium uppercase tracking-[0.2em] mt-2">
              of {totalPages.toString().padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={(e) => handleNextPage(e)}
            disabled={currentPage === totalPages - 1 || isFlipping}
            className="p-4 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-all disabled:opacity-0 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-110 disabled:scale-100"
            title="Next Page (→ or ↓)"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Enhanced Realistic Shadow with dynamic lighting */}
      <div
        className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 w-[140%] h-[60px] bg-black/80 blur-[60px] rounded-[100%] transition-all duration-1500 pointer-events-none"
        style={{
          opacity: isCoverOpened ? 0.5 : 0.9,
          transform: `translateX(-50%) scale(${isCoverOpened ? 1.2 : 1})`
        }}
      />

      {/* Additional ambient shadow */}
      <div
        className="absolute bottom-[-100px] left-1/2 transform -translate-x-1/2 w-[100%] h-[80px] bg-amber-900/20 blur-[80px] rounded-[100%] transition-opacity duration-1500 pointer-events-none"
        style={{ opacity: isHovered ? 0.3 : 0 }}
      />
    </div>
  );
};

export default Book3D;
