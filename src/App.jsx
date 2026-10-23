import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Calendar, 
  PieChart, 
  Bot, 
  Languages, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  Edit3, 
  Clock, 
  Train, 
  Volume2, 
  VolumeX, 
  Users, 
  Lock, 
  X, 
  Coins, 
  Sun, 
  Layers, 
  Star, 
  MapPin, 
  RefreshCw, 
  Wand2, 
  Eye, 
  Flame, 
  Zap, 
  Compass,
  CheckCircle2,
  Circle,
  Settings,
  ExternalLink,
  BookOpen,
  Feather,
  Sliders,
  Database,
  Cloud,
  CloudOff,
  CheckCheck
} from 'lucide-react';

// Browser-safe dynamic Supabase client helper that avoids build/compilation errors
// when @supabase/supabase-js is not yet installed in local/sandbox environments.
function getSupabaseClient(url, key) {
  if (!url || !key) return null;
  try {
    if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      return window.supabase.createClient(url, key);
    }
    // Fallback lightweight REST client if package or CDN is not pre-bundled
    return {
      from: (tableName) => ({
        select: async () => {
          try {
            const res = await fetch(`${url}/rest/v1/${tableName}?select=*`, {
              headers: { apikey: key, Authorization: `Bearer ${key}` }
            });
            const data = await res.json();
            return { data: Array.isArray(data) ? data : [], error: null };
          } catch (e) {
            return { data: null, error: e };
          }
        },
        insert: async (rows) => {
          try {
            await fetch(`${url}/rest/v1/${tableName}`, {
              method: 'POST',
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
              },
              body: JSON.stringify(rows)
            });
            return { error: null };
          } catch (e) {
            return { error: e };
          }
        },
        upsert: async (row) => {
          try {
            await fetch(`${url}/rest/v1/${tableName}`, {
              method: 'POST',
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates'
              },
              body: JSON.stringify(row)
            });
            return { error: null };
          } catch (e) {
            return { error: e };
          }
        },
        update: (updates) => ({
          eq: async (col, val) => {
            try {
              await fetch(`${url}/rest/v1/${tableName}?${col}=eq.${val}`, {
                method: 'PATCH',
                headers: {
                  apikey: key,
                  Authorization: `Bearer ${key}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
              });
              return { error: null };
            } catch (e) {
              return { error: e };
            }
          }
        }),
        delete: () => ({
          eq: async (col, val) => {
            try {
              await fetch(`${url}/rest/v1/${tableName}?${col}=eq.${val}`, {
                method: 'DELETE',
                headers: { apikey: key, Authorization: `Bearer ${key}` }
              });
              return { error: null };
            } catch (e) {
              return { error: e };
            }
          }
        })
      }),
      channel: () => ({
        on: function() { return this; },
        subscribe: function() { return this; }
      }),
      removeChannel: () => {}
    };
  } catch (err) {
    console.warn('Unable to initialize Supabase client:', err);
    return null;
  }
}

// ============================================================================
// 1. AUDIO SYNTHESIZER (Web Audio API)
// ============================================================================
class CardAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFoilUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Ethereal mana chime arpeggio (magical travel discovery chime)
    const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22, 1975.53];
    let start = this.ctx.currentTime + 0.03;

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.58);
      start += 0.06;
    });
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }
}
const cardAudio = new CardAudioEngine();

// ============================================================================
// 2. PROCEDURAL LANDSCAPE SCENERY GENERATOR (Pure Scenery - No Characters)
// ============================================================================
function generateProceduralLandscapeArt(title, category) {
  const isNight = title.toLowerCase().includes('night') || 
                  title.toLowerCase().includes('canal') || 
                  title.toLowerCase().includes('dotonbori') ||
                  title.toLowerCase().includes('yatai');
  
  if (isNight) {
    // Twilight & Golden Lantern Horizon (Pure Landscape)
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%231E1B4B"/>
          <stop offset="45%" stop-color="%23312E81"/>
          <stop offset="75%" stop-color="%23B45309"/>
          <stop offset="100%" stop-color="%23FBBF24"/>
        </linearGradient>
        <linearGradient id="waterMirror" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%231E1B4B"/>
          <stop offset="100%" stop-color="%230F172A"/>
        </linearGradient>
        <filter id="manaGlow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="600" height="600" fill="url(%23twilightSky)"/>
      <ellipse cx="480" cy="160" rx="42" ry="42" fill="%23FEF3C7" opacity="0.9" filter="url(%23manaGlow)"/>
      <path d="M0,420 Q150,380 300,410 T600,390 L600,600 L0,600 Z" fill="url(%23waterMirror)"/>
      
      <!-- Distant mossy stone arches & lantern glow -->
      <polygon points="120,380 150,320 220,320 250,380" fill="%231E293B" opacity="0.85"/>
      <circle cx="185" cy="340" r="14" fill="%23F59E0B" filter="url(%23manaGlow)"/>

      <!-- Floating gentle mana particles -->
      <circle cx="130" cy="220" r="4" fill="%2393C5FD" filter="url(%23manaGlow)"/>
      <circle cx="270" cy="150" r="4.5" fill="%23FDE68A" filter="url(%23manaGlow)"/>
      <circle cx="370" cy="250" r="3" fill="%23F472B6" filter="url(%23manaGlow)"/>
      <circle cx="450" cy="310" r="3.5" fill="%2367E8F9" filter="url(%23manaGlow)"/>
      
      <!-- Field grasses in silhouette -->
      <path d="M40,600 Q60,520 80,600 M120,600 Q140,500 160,600 M240,600 Q260,530 280,600 M400,600 Q420,510 440,600 M520,600 Q540,530 560,600" stroke="%230F172A" stroke-width="4"/>
    </svg>`;
  }

  // Pure Scenic Anime Watercolor: Cerulean Sky, Cumulus Clouds & Rolling Green Meadow
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="scenicSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%2338BDF8"/>
        <stop offset="40%" stop-color="%237DD3FC"/>
        <stop offset="85%" stop-color="%23E0F2FE"/>
        <stop offset="100%" stop-color="%23FEF3C7"/>
      </linearGradient>
      <linearGradient id="meadowGrass" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%2384CC16"/>
        <stop offset="40%" stop-color="%2365A30D"/>
        <stop offset="100%" stop-color="%233F6212"/>
      </linearGradient>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <rect width="600" height="600" fill="url(%23scenicSky)"/>

    <!-- Towering Sunlit Anime Clouds -->
    <circle cx="170" cy="230" r="95" fill="%23FFFFFF" opacity="0.95"/>
    <circle cx="280" cy="190" r="125" fill="%23FFFFFF" opacity="0.98"/>
    <circle cx="410" cy="240" r="105" fill="%23FFFFFF" opacity="0.92"/>
    <circle cx="290" cy="265" r="115" fill="%23EFF6FF" opacity="0.9"/>

    <!-- Distant rolling mountains with sunbeams -->
    <polygon points="0,410 180,310 360,420" fill="%2393C5FD" opacity="0.6"/>
    <polygon points="220,420 400,280 600,430" fill="%2360A5FA" opacity="0.45"/>

    <!-- Rolling Green Meadow Hillside with Wildflowers -->
    <path d="M0,390 Q200,330 420,370 T600,350 L600,600 L0,600 Z" fill="url(%23meadowGrass)"/>

    <!-- Mossy Ancient Stone Torii Arch / Ruins (Scenery Only) -->
    <rect x="220" y="315" width="18" height="155" fill="%2394A3B8"/>
    <rect x="360" y="315" width="18" height="155" fill="%2364748B"/>
    <polygon points="190,315 410,315 400,300 200,300" fill="%23475569"/>
    <polygon points="205,335 395,335 390,325 210,325" fill="%2364748B"/>
    
    <!-- Stone Moss details -->
    <ellipse cx="230" cy="380" rx="8" ry="14" fill="%234D7C0F"/>
    <ellipse cx="370" cy="410" rx="7" ry="16" fill="%234D7C0F"/>

    <!-- Whimsical Floating Blue Moonweed Petals / Mana Particles -->
    <circle cx="155" cy="375" r="4" fill="%2360A5FA" filter="url(%23softGlow)"/>
    <circle cx="265" cy="325" r="3" fill="%2393C5FD" filter="url(%23softGlow)"/>
    <circle cx="335" cy="355" r="4.5" fill="%23FDE68A" filter="url(%23softGlow)"/>
    <circle cx="455" cy="415" r="3.5" fill="%23F472B6" filter="url(%23softGlow)"/>
  </svg>`;
}

// ============================================================================
// 3. INTERACTIVE 3D WAYPOINT CARD (Pure Scenery, Gyro/Mouse Tilt)
// ============================================================================
function WaypointCard3D({ card, onClick, isInspecting = false }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glintPos, setGlintPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const mult = isInspecting ? 22 : 12;
    const rotX = ((y - centerY) / centerY) * -mult;
    const rotY = ((x - centerX) / centerX) * mult;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlintPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const isUnlocked = card.checkedIn;

  return (
    <div 
      className="perspective-1000 select-none cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
      }}
      onClick={onClick}
      style={{ perspective: '1200px' }}
    >
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale(1.025)' : 'scale(1)'}`,
          transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
          transformStyle: 'preserve-3d'
        }}
        className={`relative rounded-3xl p-4 transition-all duration-300 overflow-hidden ${
          isUnlocked
            ? 'bg-gradient-to-b from-[#181824] via-[#101018] to-black text-amber-50 border-2 border-amber-300/80 shadow-2xl hover:shadow-amber-400/25 ring-1 ring-amber-500/30'
            : 'bg-stone-900/90 backdrop-blur-md text-stone-400 border border-stone-800 shadow-xl hover:border-stone-700'
        }`}
      >
        {/* Holographic Iridescent Foil Layer with Specular Glint */}
        {isUnlocked && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
            style={{
              opacity: isHovered ? 0.75 : 0.35,
              background: `radial-gradient(circle at ${glintPos.x}% ${glintPos.y}%, rgba(254, 240, 138, 0.4) 0%, rgba(244, 114, 182, 0.3) 25%, rgba(96, 165, 250, 0.25) 50%, transparent 80%)`,
              mixBlendMode: 'color-dodge'
            }}
          />
        )}

        {/* Card Header */}
        <div className="flex items-center justify-between text-xs relative z-20" style={{ transform: 'translateZ(25px)' }}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
              isUnlocked ? 'bg-amber-400 text-stone-950 font-mono shadow-xs' : 'bg-stone-800 text-stone-500'
            }`}>
              {card.cityName}
            </span>
            <span className="text-[10px] text-amber-300 font-mono flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-400" /> {card.manaResonance || 880} MP
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md font-mono ${
              card.rarity === 'Mythic Grimoire' ? 'bg-gradient-to-r from-purple-500 via-rose-500 to-amber-500 text-white shadow-xs' :
              card.rarity === 'Ancient Relic' ? 'bg-amber-400 text-slate-950 font-bold' :
              'bg-sky-600 text-white'
            }`}>
              {card.rarity}
            </span>
          </div>
        </div>

        {/* Artwork Viewport with Pure Landscape Watercolor Frame */}
        <div 
          className="relative mt-3 rounded-2xl overflow-hidden aspect-square border border-amber-300/30 bg-stone-950 flex items-center justify-center shadow-inner group"
          style={{ transform: 'translateZ(35px)' }}
        >
          {isUnlocked ? (
            <>
              <img 
                src={card.artworkUrl} 
                alt={card.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {card.isGeneratingArt && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-amber-200 text-xs p-3 text-center">
                  <RefreshCw className="w-5 h-5 animate-spin mb-1 text-amber-300" />
                  <span className="font-bold">Conjuring Landscape Scenery...</span>
                </div>
              )}
              {/* Aesthetic Stamp Tag */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-amber-200 flex items-center gap-1 border border-white/20">
                <Feather className="w-3 h-3 text-sky-400" /> Watercolor Scenery
              </div>
            </>
          ) : (
            // Mystery Locked Vault Case
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-800/80 border border-stone-700/80 flex items-center justify-center shadow-lg mb-2 group-hover:scale-110 transition duration-300">
                <Lock className="w-6 h-6 text-stone-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">
                Waypoint Seal Active
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5">
                Check in on-site to break seal
              </span>
            </div>
          )}
        </div>

        {/* Card Lore & Title */}
        <div className="mt-3.5 relative z-20" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider">{card.category}</span>
            <div className="flex text-amber-400 text-xs">
              {Array.from({ length: card.stars || 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </div>

          <h3 className={`font-black text-sm mt-0.5 truncate ${isUnlocked ? 'text-white' : 'text-stone-400'}`}>
            {card.title}
          </h3>
          <p className="text-[11px] text-amber-200/70 font-serif truncate">
            {card.titleJa}
          </p>

          {isUnlocked && card.notes && (
            <p className="text-[10px] text-stone-300 italic mt-1 line-clamp-1 bg-stone-800/60 px-2 py-1 rounded-lg border border-stone-800">
              "{card.notes}"
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div 
          className="mt-3.5 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-xs relative z-20"
          style={{ transform: 'translateZ(15px)' }}
        >
          {isUnlocked ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-bold truncate max-w-[130px]">
                Recorded: {card.unlockedAt}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-stone-500 uppercase font-bold">
              Unexplored Realm
            </span>
          )}

          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300">
            <Eye className="w-3.5 h-3.5" />
            <span>Examine Card</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 4. INITIAL DEFAULT DATA
// ============================================================================
const DEFAULT_CITIES = [
  {
    id: 'fukuoka',
    name: 'Fukuoka',
    nameJa: '福岡・博多',
    hotelName: 'Miyako Hotel Hakata',
    hotelAddress: '2-1-1 Hakataekihigashi, Hakata Ward, Fukuoka',
    station: 'JR Hakata Station Direct Gate',
    startDate: '2026-10-24T09:00',
    endDate: '2026-10-27T10:30',
    transitToNext: 'Shinkansen Nozomi (2h 45m)'
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    nameJa: '京都・千年の都',
    hotelName: 'The Thousand Kyoto',
    hotelAddress: '570 Higashishiokojicho, Shimogyo Ward, Kyoto',
    station: 'JR Kyoto Station Central Gate',
    startDate: '2026-10-27T10:30',
    endDate: '2026-10-30T14:00',
    transitToNext: 'JR Special Rapid Service (28m)'
  },
  {
    id: 'osaka',
    name: 'Osaka',
    nameJa: '大阪・食いだおれ',
    hotelName: 'Swissôtel Nankai Osaka',
    hotelAddress: '5-1-60 Namba, Chuo Ward, Osaka',
    station: 'Nankai Namba Station Direct',
    startDate: '2026-10-30T14:00',
    endDate: '2026-11-03T18:00',
    transitToNext: 'Nankai Rapi:t to KIX Airport (35m)'
  }
];

const DEFAULT_PLACES = [
  // FUKUOKA LEG PLACES
  {
    id: 'p-fuk-1',
    cityId: 'fukuoka',
    title: 'Dazaifu Tenmangu Shrine',
    titleJa: '太宰府天満宮',
    category: 'Shrines & Temples',
    costJPY: 0,
    timeOfDay: 'Morning',
    checkedIn: true,
    checkedInBy: 'Lubelter',
    unlockedAt: 'Oct 24, 2026',
    address: '4-7-1 Saifu, Dazaifu, Fukuoka',
    notes: 'Try the fresh Umegae mochi right outside the gate!',
    rarity: 'Ancient Relic',
    manaResonance: 920,
    stars: 5,
    cardBio: 'A sacred sanctuary dedicated to scholarship, guarded by ancient mossy stone bridges and blooming plum trees.',
    artworkUrl: generateProceduralLandscapeArt('Dazaifu Tenmangu Shrine', 'Shrines & Temples')
  },
  {
    id: 'p-fuk-2',
    cityId: 'fukuoka',
    title: 'Nakasu Yatai Riverside Food Stalls',
    titleJa: '中洲屋台街・博多ラーメン',
    category: 'Dining & Street Food',
    costJPY: 3000,
    timeOfDay: 'Night',
    checkedIn: true,
    checkedInBy: 'Khai',
    unlockedAt: 'Oct 24, 2026',
    address: 'Nakasu 8-chome, Hakata Ward',
    notes: 'Rich tonkotsu foam broth with spring onions, sizzling gyoza by the river.',
    rarity: 'Hero Crest',
    manaResonance: 780,
    stars: 4,
    cardBio: 'Open-air riverside food tents glowing under lanterns in the cool Fukuoka evening breeze.',
    artworkUrl: generateProceduralLandscapeArt('Nakasu Yatai Food Stalls Night', 'Dining & Street Food')
  },
  {
    id: 'p-fuk-3',
    cityId: 'fukuoka',
    title: 'Ohori Park & Castle Ruins',
    titleJa: '大濠公園・福岡城跡',
    category: 'Nature & Walks',
    costJPY: 250,
    timeOfDay: 'Afternoon',
    checkedIn: false,
    checkedInBy: null,
    unlockedAt: null,
    address: '1 Ohorikoen, Chuo Ward, Fukuoka',
    notes: 'Rent swan boats or walk along the pine tree bridges across the central lake.',
    rarity: 'Ancient Relic',
    manaResonance: 810,
    stars: 4,
    cardBio: 'A serene moat garden with willow trees reflecting the vast Kyushu sky.',
    artworkUrl: generateProceduralLandscapeArt('Ohori Park & Castle Ruins', 'Nature & Walks')
  },

  // KYOTO LEG PLACES
  {
    id: 'p-kyo-1',
    cityId: 'kyoto',
    title: 'Arashiyama Bamboo Grove',
    titleJa: '嵐山 竹林の小径',
    category: 'Nature & Walks',
    costJPY: 0,
    timeOfDay: 'Early Morning (7:00 AM)',
    checkedIn: false,
    checkedInBy: null,
    unlockedAt: null,
    address: 'Ukyo Ward, Kyoto, 616-8394',
    notes: 'Go at dawn before tourist crowds arrive; listen to the wind rustling through stalks.',
    rarity: 'Mythic Grimoire',
    manaResonance: 1050,
    stars: 5,
    cardBio: 'Towering jade bamboo stalks piercing the morning mist, casting rays of tranquil green sunlight.',
    artworkUrl: generateProceduralLandscapeArt('Arashiyama Bamboo Grove', 'Nature & Walks')
  },
  {
    id: 'p-kyo-2',
    cityId: 'kyoto',
    title: 'Fushimi Inari Taisha 10,000 Gates',
    titleJa: '伏見稲荷大社・千本鳥居',
    category: 'Shrines & Temples',
    costJPY: 0,
    timeOfDay: 'Late Afternoon',
    checkedIn: false,
    checkedInBy: null,
    unlockedAt: null,
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward',
    notes: 'Hike up to Yotsutsuji intersection for panoramic views of Kyoto.',
    rarity: 'Mythic Grimoire',
    manaResonance: 1200,
    stars: 5,
    cardBio: 'A winding tunnel of ten thousand vermilion torii gates carving a path through mountain mist.',
    artworkUrl: generateProceduralLandscapeArt('Fushimi Inari Taisha', 'Shrines & Temples')
  },
  {
    id: 'p-kyo-3',
    cityId: 'kyoto',
    title: 'Kinkaku-ji Golden Pavilion',
    titleJa: '鹿苑寺・金閣寺',
    category: 'Shrines & Temples',
    costJPY: 500,
    timeOfDay: 'Morning',
    checkedIn: false,
    checkedInBy: null,
    unlockedAt: null,
    address: '1 Kinkakujicho, Kita Ward, Kyoto',
    notes: 'Watch the gold leaf shimmer across the Kyoko-chi (Mirror Pond).',
    rarity: 'Ancient Relic',
    manaResonance: 980,
    stars: 5,
    cardBio: 'A shimmering pavilion leafed in pure gold rising over still waters framed by black pines.',
    artworkUrl: generateProceduralLandscapeArt('Kinkaku-ji Golden Pavilion', 'Shrines & Temples')
  },

  // OSAKA LEG PLACES
  {
    id: 'p-osa-1',
    cityId: 'osaka',
    title: 'Dotonbori Canal & Golden Bridges',
    titleJa: '道頓堀・グリコサイン',
    category: 'Dining & Street Food',
    costJPY: 1500,
    timeOfDay: 'Evening / Night',
    checkedIn: false,
    checkedInBy: null,
    unlockedAt: null,
    address: '1-10-3 Dotonbori, Chuo Ward, Osaka',
    notes: 'Grab piping hot takoyaki with dancing bonito flakes and take canal photos.',
    rarity: 'Hero Crest',
    manaResonance: 890,
    stars: 4,
    cardBio: 'Electric signs casting dazzling reflections over the buzzing canals of food heaven.',
    artworkUrl: generateProceduralLandscapeArt('Dotonbori Canal Night', 'Dining & Street Food')
  },
  {
    id: 'p-osa-2',
    cityId: 'osaka',
    title: 'Osaka Castle Tenshukaku Keep',
    titleJa: '大坂城・金箔天守閣',
    category: 'Historical Keep',
    costJPY: 600,
    timeOfDay: 'Morning',
    checkedIn: false,
    checkedInBy: null,
    unlockedAt: null,
    address: '1-1 Osakajo, Chuo Ward, Osaka',
    notes: 'Walk across the giant granite stone moats; visit the 8th floor observation deck.',
    rarity: 'Ancient Relic',
    manaResonance: 950,
    stars: 5,
    cardBio: 'An impenetrable citadel with golden tiger crests commanding the central plains of Kansai.',
    artworkUrl: generateProceduralLandscapeArt('Osaka Castle Tenshukaku Keep', 'Historical Keep')
  }
];

const DEFAULT_TRAVELERS = [
  { id: 't1', name: 'Lubelter', avatar: '⚡', role: 'Mage Navigator' },
  { id: 't2', name: 'Khai', avatar: '🍃', role: 'Party Vanguard' }
];

const DEFAULT_EXPENSES = [
  { id: 'e1', title: 'Hakata Kushida Gyoza & Oden', amountJPY: 2800, category: 'Ramen & Dining', paymentMethod: 'kitty', date: 'Oct 24' },
  { id: 'e2', title: '7-Eleven Egg Sandwiches & Green Tea', amountJPY: 1350, category: 'Konbini', paymentMethod: 'kitty', date: 'Oct 24' },
  { id: 'e3', title: 'Subway One-Day Passes (Fukuoka)', amountJPY: 1280, category: 'Transit', paymentMethod: 'kitty', date: 'Oct 25' },
  { id: 'e4', title: 'Shrine Fortune Omikuji & Talismans', amountJPY: 2000, category: 'Temples', paymentMethod: 'personal', paidBy: 't1', date: 'Oct 25' }
];

const DEFAULT_CONTRIBUTIONS = [
  { id: 'c1', travelerId: 't1', amountJPY: 15000, date: 'Oct 23', note: 'Trip Pot Initial Deposit' },
  { id: 'c2', travelerId: 't2', amountJPY: 15000, date: 'Oct 23', note: 'Trip Pot Initial Deposit' },
  { id: 'c3', travelerId: 't1', amountJPY: 3000, date: 'Oct 24', note: 'Yatai Food Fund' },
  { id: 'c4', travelerId: 't2', amountJPY: 3000, date: 'Oct 24', note: 'Yatai Food Fund' }
];

const FLASHCARDS = [
  { ja: 'このホテル（住所）までお願いします。', ro: 'Kono hoteru made onegaishimasu.', en: 'Please take me to this hotel/address.', type: 'Taxi' },
  { ja: 'お会計は別々でお願いできますか？', ro: 'Okaikei wa betsubetsu de onegaidekimasu ka?', en: 'Can we please pay separately?', type: 'Dining' },
  { ja: '豚肉やラード、アルコールは入っていますか？', ro: 'Butaniku ya raado, arukooru wa haitte imasu ka?', en: 'Does this dish contain pork, lard, or alcohol?', type: 'Dietary' },
  { ja: '一番近いエレベーター・改札口はどこですか？', ro: 'Ichiban chikai erebeetaa / kaisatsuguchi wa doko desu ka?', en: 'Where is the nearest elevator or ticket gate?', type: 'Station' },
  { ja: 'おすすめのメニューを教えてください。', ro: 'Osusume no menyuu o oshiete kudasai.', en: 'What is your best recommended specialty?', type: 'Dining' },
  { ja: 'Suica / Pasmo などの交通系ICカードは使えますか？', ro: 'Koutsuukei IC kaado wa tsukaemasu ka?', en: 'Can I pay with my IC transit card?', type: 'Payment' }
];

// ============================================================================
// 5. MAIN WAYPOINT APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('places'); // 'places' | 'cards' | 'timeline' | 'kitty' | 'ai'
  const [now, setNow] = useState(new Date());

  // Cloud Sync (Supabase Credentials)
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('waypoint_supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('waypoint_supabase_key') || '');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('offline'); // 'connected' | 'offline' | 'syncing'

  // Supabase Client Ref
  const supabaseRef = useRef(null);

  // Initialize Supabase if credentials are provided
  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      const client = getSupabaseClient(supabaseUrl, supabaseAnonKey);
      if (client) {
        supabaseRef.current = client;
        setCloudSyncStatus('connected');
      } else {
        supabaseRef.current = null;
        setCloudSyncStatus('offline');
      }
    } else {
      supabaseRef.current = null;
      setCloudSyncStatus('offline');
    }
  }, [supabaseUrl, supabaseAnonKey]);

  // Travelers
  const [travelers, setTravelers] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_travelers');
      return s ? JSON.parse(s) : DEFAULT_TRAVELERS;
    } catch { return DEFAULT_TRAVELERS; }
  });
  const [activeTravelerId, setActiveTravelerId] = useState(() => travelers[0]?.id || 't1');

  // Cities
  const [cities, setCities] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_cities');
      return s ? JSON.parse(s) : DEFAULT_CITIES;
    } catch { return DEFAULT_CITIES; }
  });
  const [activeCityId, setActiveCityId] = useState(() => cities[0]?.id || 'fukuoka');

  // Places To Visit per City Leg
  const [places, setPlaces] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_places');
      return s ? JSON.parse(s) : DEFAULT_PLACES;
    } catch { return DEFAULT_PLACES; }
  });
  const [placesFilter, setPlacesFilter] = useState('all'); // 'all' | 'pending' | 'visited'

  // Common Kitty Financials
  const [expenses, setExpenses] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_expenses');
      return s ? JSON.parse(s) : DEFAULT_EXPENSES;
    } catch { return DEFAULT_EXPENSES; }
  });
  const [contributions, setContributions] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_contribs');
      return s ? JSON.parse(s) : DEFAULT_CONTRIBUTIONS;
    } catch { return DEFAULT_CONTRIBUTIONS; }
  });
  const [ratePer100Jpy] = useState(3.12);

  // Gemini API Configuration
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('waypoint_gemini_key') || '');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(() => localStorage.getItem('waypoint_gemini_model') || 'gemini-3.8-flash');
  const [showApiSettingsModal, setShowApiSettingsModal] = useState(false);

  // Modals & UI States
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [inspectedCard, setInspectedCard] = useState(null);
  const [showManageTravelers, setShowManageTravelers] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditCityModal, setShowEditCityModal] = useState(null);
  const [showNewCityModal, setShowNewCityModal] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // AI Chat
  const [aiLog, setAiLog] = useState([
    {
      role: 'assistant',
      text: "Greetings, travelers. I am your Waypoint AI Travel Companion. I monitor your city checklists, Waypoint Deck landscapes, and Common Kitty reserves. What spell of guidance may I cast for you today?"
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Local Storage Persistence
  useEffect(() => localStorage.setItem('waypoint_travelers', JSON.stringify(travelers)), [travelers]);
  useEffect(() => localStorage.setItem('waypoint_cities', JSON.stringify(cities)), [cities]);
  useEffect(() => localStorage.setItem('waypoint_places', JSON.stringify(places)), [places]);
  useEffect(() => localStorage.setItem('waypoint_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('waypoint_contribs', JSON.stringify(contributions)), [contributions]);
  useEffect(() => localStorage.setItem('waypoint_gemini_key', geminiApiKey), [geminiApiKey]);
  useEffect(() => localStorage.setItem('waypoint_gemini_model', selectedGeminiModel), [selectedGeminiModel]);
  useEffect(() => localStorage.setItem('waypoint_supabase_url', supabaseUrl), [supabaseUrl]);
  useEffect(() => localStorage.setItem('waypoint_supabase_key', supabaseAnonKey), [supabaseAnonKey]);

  // Real-Time Supabase Sync Handlers
  useEffect(() => {
    if (!supabaseRef.current) return;
    const client = supabaseRef.current;

    // Initial fetch from cloud
    const syncFromCloud = async () => {
      try {
        setCloudSyncStatus('syncing');
        const { data: cloudPlaces } = await client.from('trip_places').select('*');
        if (cloudPlaces && cloudPlaces.length > 0) {
          setPlaces(prev => {
            const map = new Map(prev.map(p => [p.id, p]));
            cloudPlaces.forEach(cp => {
              map.set(cp.id, {
                id: cp.id,
                cityId: cp.city || cp.cityId || 'fukuoka',
                title: cp.name || cp.title,
                titleJa: cp.jp_name || cp.titleJa || '',
                category: cp.category || 'Shrines & Temples',
                timeOfDay: cp.time_of_day || cp.timeOfDay || 'Morning',
                costJPY: Number(cp.est_cost || cp.costJPY || 0),
                checkedIn: !!(cp.visited || cp.checkedIn),
                checkedInBy: cp.checked_in_by || cp.checkedInBy || null,
                unlockedAt: cp.unlocked_at || cp.unlockedAt || null,
                address: cp.address || 'Japan',
                notes: cp.notes || '',
                rarity: cp.rarity || 'Ancient Relic',
                manaResonance: cp.mana_resonance || 880,
                stars: 5,
                cardBio: cp.card_bio || `A quiet scenic destination in ${cp.city || 'Japan'} steeped in gentle skies.`,
                artworkUrl: cp.image_url || cp.artworkUrl || generateProceduralLandscapeArt(cp.name || cp.title, cp.category)
              });
            });
            return Array.from(map.values());
          });
        }

        const { data: cloudExpenses } = await client.from('trip_expenses').select('*');
        if (cloudExpenses && cloudExpenses.length > 0) {
          setExpenses(prev => {
            const map = new Map(prev.map(e => [e.id, e]));
            cloudExpenses.forEach(ce => {
              map.set(ce.id, {
                id: ce.id,
                title: ce.title,
                amountJPY: Number(ce.amount_jpy || ce.amountJPY || 0),
                category: ce.category || 'Ramen & Dining',
                paymentMethod: ce.is_kitty ? 'kitty' : 'personal',
                paidBy: ce.paid_by || null,
                date: ce.date || new Date(ce.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              });
            });
            return Array.from(map.values());
          });
        }
        setCloudSyncStatus('connected');
      } catch (err) {
        console.warn('Initial cloud sync error:', err);
        setCloudSyncStatus('offline');
      }
    };

    syncFromCloud();

    // Listen to real-time broadcast changes
    const channel = client
      .channel('waypoint-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_places' }, () => {
        syncFromCloud();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses' }, () => {
        syncFromCloud();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [supabaseUrl, supabaseAnonKey]);

  // Live Clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiLog, isAiThinking]);

  const jpyToMyr = (jpy) => ((Number(jpy || 0) / 100) * ratePer100Jpy).toFixed(2);

  const activeCityIndex = useMemo(() => {
    const idx = cities.findIndex(c => c.id === activeCityId);
    return idx >= 0 ? idx : 0;
  }, [cities, activeCityId]);

  const currentCity = useMemo(() => cities[activeCityIndex] || cities[0] || DEFAULT_CITIES[0], [cities, activeCityIndex]);
  const nextCity = useMemo(() => cities[activeCityIndex + 1] || null, [cities, activeCityIndex]);

  // Countdown Timers
  const timers = useMemo(() => {
    if (!cities || cities.length === 0) return { tripD: 0, tripH: 0, tripM: 0, tripS: 0, nextD: 0, nextH: 0, nextM: 0, nextS: 0, pctCity: 0, isFinal: false };
    const curTime = now.getTime();

    const tripEndTime = new Date(cities[cities.length - 1].endDate).getTime();
    const tripDiff = tripEndTime - curTime;
    const tripD = Math.max(0, Math.floor(tripDiff / (1000 * 60 * 60 * 24)));
    const tripH = Math.max(0, Math.floor((tripDiff / (1000 * 60 * 60)) % 24));
    const tripM = Math.max(0, Math.floor((tripDiff / (1000 * 60)) % 60));
    const tripS = Math.max(0, Math.floor((tripDiff / 1000) % 60));

    const curStart = new Date(currentCity.startDate).getTime();
    const curEnd = new Date(currentCity.endDate).getTime();
    const nextDiff = curEnd - curTime;
    const nextD = Math.max(0, Math.floor(nextDiff / (1000 * 60 * 60 * 24)));
    const nextH = Math.max(0, Math.floor((nextDiff / (1000 * 60 * 60)) % 24));
    const nextM = Math.max(0, Math.floor((nextDiff / (1000 * 60)) % 60));
    const nextS = Math.max(0, Math.floor((nextDiff / 1000) % 60));

    const totalSpan = Math.max(1, curEnd - curStart);
    const elapsed = Math.max(0, Math.min(totalSpan, curTime - curStart));
    const pctCity = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));

    return { tripD, tripH, tripM, tripS, nextD, nextH, nextM, nextS, pctCity, isFinal: !nextCity };
  }, [cities, currentCity, nextCity, now]);

  // Financial Stats
  const kittyStats = useMemo(() => {
    const totalDeposited = contributions.reduce((s, c) => s + Number(c.amountJPY || 0), 0);
    let kittySpent = 0;
    let personalSpent = 0;
    const catMap = {};

    expenses.forEach(e => {
      const amt = Number(e.amountJPY || 0);
      if (e.paymentMethod === 'kitty') kittySpent += amt;
      else personalSpent += amt;
      const cat = e.category || 'Misc';
      catMap[cat] = (catMap[cat] || 0) + amt;
    });

    const remaining = totalDeposited - kittySpent;
    const totalAllSpend = kittySpent + personalSpent;

    const ranked = Object.keys(catMap).map(k => ({
      name: k,
      amount: catMap[k],
      pct: totalAllSpend > 0 ? Math.round((catMap[k] / totalAllSpend) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalDeposited,
      kittySpent,
      personalSpent,
      remaining,
      totalAllSpend,
      ranked,
      topCat: ranked[0] || null
    };
  }, [contributions, expenses]);

  // Places for active city
  const activeCityPlaces = useMemo(() => {
    return places.filter(p => p.cityId === activeCityId);
  }, [places, activeCityId]);

  const filteredPlaces = useMemo(() => {
    if (placesFilter === 'pending') return activeCityPlaces.filter(p => !p.checkedIn);
    if (placesFilter === 'visited') return activeCityPlaces.filter(p => p.checkedIn);
    return activeCityPlaces;
  }, [activeCityPlaces, placesFilter]);

  const completedCount = activeCityPlaces.filter(p => p.checkedIn).length;

  // Toggle Check-in Place & Unlock Card (with optional cloud push)
  const handleToggleCheckIn = useCallback(async (placeId) => {
    const activeTraveler = travelers.find(t => t.id === activeTravelerId);
    cardAudio.playFoilUnlock();

    let targetUpdated = null;

    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const nextState = !p.checkedIn;
        const updated = {
          ...p,
          checkedIn: nextState,
          checkedInBy: nextState ? (activeTraveler?.name || 'Traveler') : null,
          unlockedAt: nextState ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
        };
        targetUpdated = updated;
        if (inspectedCard && inspectedCard.id === placeId) {
          setInspectedCard(updated);
        }
        return updated;
      }
      return p;
    }));

    // If connected to Supabase, push update
    if (supabaseRef.current && targetUpdated) {
      try {
        await supabaseRef.current.from('trip_places').upsert({
          id: targetUpdated.id,
          city: targetUpdated.cityId,
          name: targetUpdated.title,
          jp_name: targetUpdated.titleJa,
          category: targetUpdated.category,
          visited: targetUpdated.checkedIn,
          card_unlocked: targetUpdated.checkedIn,
          notes: targetUpdated.notes,
          image_url: targetUpdated.artworkUrl
        });
      } catch (e) {
        console.warn('Failed to sync place check-in to cloud:', e);
      }
    }
  }, [activeTravelerId, travelers, inspectedCard]);

  const getMapsUrl = (destTitle, destAddress) => {
    const origin = encodeURIComponent(`${currentCity.hotelName}, ${currentCity.hotelAddress}`);
    const dest = encodeURIComponent(`${destTitle} ${destAddress || ''}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit`;
  };

  // Generate Pure Landscape Scenery Art via Gemini API
 const handleGenerateLandscapeArt = async (card) => {
    cardAudio.playClick();
    const fallbackSvg = generateProceduralLandscapeArt(card.title, card.category);

    setPlaces(prev => prev.map(p => p.id === card.id ? { ...p, isGeneratingArt: true } : p));
    if (inspectedCard && inspectedCard.id === card.id) {
      setInspectedCard(prev => ({ ...prev, isGeneratingArt: true }));
    }

    // Direct high-resolution fantasy anime watercolor generator
    const cleanPrompt = encodeURIComponent(
      `fantasy anime watercolor scenery of ${card.title} in ${currentCity.name} Japan, soft golden sunlight, towering anime cumulus clouds, tranquil architecture, ghibli aesthetic, no people, masterpiece, 8k resolution`
    );
    const randomSeed = Math.floor(Math.random() * 900000) + 100000;
    const finalUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=800&nologo=true&seed=${randomSeed}&model=flux`;

    // Pre-load the generated image
    const img = new Image();
    img.src = finalUrl;
    img.onload = () => {
      setPlaces(prev => prev.map(p => p.id === card.id ? { ...p, artworkUrl: finalUrl, isGeneratingArt: false } : p));
      if (inspectedCard && inspectedCard.id === card.id) {
        setInspectedCard(prev => ({ ...prev, artworkUrl: finalUrl, isGeneratingArt: false }));
      }
      cardAudio.playFoilUnlock();
    };
    img.onerror = () => {
      setPlaces(prev => prev.map(p => p.id === card.id ? { ...p, artworkUrl: fallbackSvg, isGeneratingArt: false } : p));
      if (inspectedCard && inspectedCard.id === card.id) {
        setInspectedCard(prev => ({ ...prev, artworkUrl: fallbackSvg, isGeneratingArt: false }));
      }
    };

    if (supabaseRef.current) {
      supabaseRef.current.from('trip_places').upsert({
        id: card.id,
        city: card.cityId,
        name: card.title,
        image_url: finalUrl
      }).catch(console.warn);
    }
  };
    const modelToUse = selectedGeminiModel || "gemini-3.8-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

    const contextPayload = {
      companionMinds: travelers.map(t => `${t.name} (${t.avatar} - ${t.role})`),
      activeTraveler: travelers.find(t => t.id === activeTravelerId)?.name,
      currentCityLeg: currentCity.name,
      hotelBase: `${currentCity.hotelName} near ${currentCity.station}`,
      nextCityTransit: nextCity ? `Departing to ${nextCity.name} in ${timers.nextD}d ${timers.nextH}h` : 'Final City Leg',
      kittyRemainingJPY: `¥${kittyStats.remaining.toLocaleString()} (~RM ${jpyToMyr(kittyStats.remaining)})`,
      totalPlacesInThisCity: activeCityPlaces.length,
      placesToVisit: activeCityPlaces.filter(p => !p.checkedIn).map(p => `${p.title} (${p.category} - ${p.timeOfDay})`),
      alreadyVisited: activeCityPlaces.filter(p => p.checkedIn).map(p => p.title)
    };

    const systemPrompt = `You are the personal Travel AI Assistant in Waypoint, an elegant travel companion app.
Model Engine: ${modelToUse} (Gemini Status Active).
LIVE APP TELEMETRY FOR ${currentCity.name.toUpperCase()}:
${JSON.stringify(contextPayload, null, 2)}
Respond with warmth, practical transit and timing tips, food recommendations, and serene travel philosophy.`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "The mana flow was interrupted; unable to cast response.";
      setAiLog(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setAiLog(prev => [...prev, { role: 'assistant', text: `Failed to query ${modelToUse}. Please check your Gemini API key in Settings.` }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans flex flex-col pb-24 selection:bg-amber-100 selection:text-amber-900">
      
      {/* ==================================================================== */}
      {/* TOP HEADER: DUAL REAL-TIME COUNTDOWN TIMERS & PRO HUD                */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          
          {/* Logo & City Selector */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-amber-300">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">Waypoint</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase flex items-center gap-0.5 ${
                  cloudSyncStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {cloudSyncStatus === 'connected' ? (
                    <><Cloud className="w-2.5 h-2.5" /> Synced</>
                  ) : (
                    <><CloudOff className="w-2.5 h-2.5" /> Local</>
                  )}
                </span>
                
                {/* Active City Dropdown */}
                <select
                  value={activeCityId}
                  onChange={(e) => {
                    setActiveCityId(e.target.value);
                    cardAudio.playClick();
                  }}
                  className="text-[11px] font-bold bg-stone-100 border border-stone-200 text-stone-800 rounded-md px-1.5 py-0.5 focus:outline-none cursor-pointer ml-1"
                >
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.nameJa.split('・')[0]})</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-stone-500 truncate max-w-[200px]">
                Base: {currentCity.hotelName.split(' ')[0]} near {currentCity.station.split(' ')[0]}
              </p>
            </div>
          </div>

          {/* Traveler Profiles, Switcher & Settings */}
          <div className="flex items-center gap-1.5">
            <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {travelers.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTravelerId(t.id);
                    cardAudio.playClick();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                    activeTravelerId === t.id 
                      ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title={`${t.name} (${t.role})`}
                >
                  <span>{t.avatar}</span>
                  <span className="max-w-[70px] truncate">{t.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowManageTravelers(true)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs border border-stone-200"
              title="Add or Edit Travelers"
            >
              <Users className="w-3.5 h-3.5" />
            </button>

            {/* Cloud & AI Config Settings Button */}
            <button
              onClick={() => setShowApiSettingsModal(true)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                geminiApiKey || supabaseUrl
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold' 
                  : 'bg-stone-100 border-stone-200 text-stone-600'
              }`}
              title="Configure Gemini & Supabase Cloud Sync"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">
                {selectedGeminiModel.replace('gemini-', '')}
              </span>
            </button>
          </div>

        </div>

        {/* PROMINENT DUAL TIMERS BAR (OVERALL TRIP & NEXT CITY WITH LIVE SECONDS) */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          
          {/* 1. Next City Departure Countdown */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-3 py-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-amber-600" />
                {nextCity ? `Depart to ${nextCity.name}` : 'Final City Leg'}
              </span>
              <span className="text-[10px] font-semibold text-amber-700">
                {currentCity.transitToNext ? currentCity.transitToNext.split('(')[0] : 'Express'}
              </span>
            </div>
            
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight font-mono">
                {timers.isFinal ? 'Tour Concluded' : `${timers.nextD}d ${timers.nextH}h ${timers.nextM}m ${timers.nextS}s`}
              </span>
              <span className="text-[10px] font-medium text-stone-500">
                {timers.pctCity}% spent
              </span>
            </div>

            <div className="w-full bg-amber-200/60 rounded-full h-1 mt-1 overflow-hidden">
              <div 
                className="bg-amber-600 h-1 rounded-full transition-all duration-1000"
                style={{ width: `${timers.pctCity}%` }}
              />
            </div>
          </div>

          {/* 2. Total Trip Countdown */}
          <div className="bg-stone-50 border border-stone-200/90 rounded-xl px-3 py-2 flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-600" />
              Total Time Left on Trip
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight font-mono">
                {timers.tripD}d {timers.tripH}h {timers.tripM}m {timers.tripS}s
              </span>
              <span className="text-[10px] text-stone-400">
                Ends Nov 03
              </span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 truncate">
              {cities.map(c => c.name).join(' ➔ ')}
            </div>
          </div>

          {/* 3. Common Kitty Reserve */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-3 py-2 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-800 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Common Kitty Pot
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                Equal Split
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-extrabold text-emerald-950 text-base">
                ¥{kittyStats.remaining.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                ≈ RM {jpyToMyr(kittyStats.remaining)}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 flex justify-between">
              <span>{travelers.length} companions</span>
              <span>Spent: ¥{kittyStats.kittySpent.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN VIEWPORT TABS                                                  */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4">
        
        {/* ================================================================== */}
        {/* TAB 1: PLACES TO VISIT (CITY-LEG SPECIFIC CHECKLIST)              */}
        {/* ================================================================== */}
        {activeTab === 'places' && (
          <div className="space-y-4">
            
            {/* City Leg Switcher Header Banner */}
            <div className="bg-white rounded-3xl border border-stone-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                      Current Leg • {currentCity.name}
                    </span>
                    <span className="text-xs text-stone-400 font-serif">
                      {currentCity.nameJa}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Places To Visit in {currentCity.name}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Base Lodging: <span className="font-bold text-slate-800">{currentCity.hotelName}</span> ({currentCity.station})
                  </p>
                </div>

                {/* Primary Button: + Add Place to Visit */}
                <button
                  onClick={() => setShowAddPlaceModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  + Add Place to Visit
                </button>
              </div>

              {/* City Switcher Tabs */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 overflow-x-auto">
                <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Switch Leg:</span>
                {cities.map(c => {
                  const isCur = c.id === activeCityId;
                  const cPlaces = places.filter(p => p.cityId === c.id);
                  const cDone = cPlaces.filter(p => p.checkedIn).length;

                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCityId(c.id);
                        cardAudio.playClick();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        isCur 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isCur ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {cDone}/{cPlaces.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Checklist Filter Bar */}
              <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                  {[
                    { id: 'all', label: `All Spots (${activeCityPlaces.length})` },
                    { id: 'pending', label: `To Visit (${activeCityPlaces.length - completedCount})` },
                    { id: 'visited', label: `Visited (${completedCount})` }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setPlacesFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        placesFilter === f.id ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-stone-500 font-medium">
                  {completedCount === activeCityPlaces.length && activeCityPlaces.length > 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All {currentCity.name} spots mastered!
                    </span>
                  ) : (
                    <span>{activeCityPlaces.length - completedCount} destinations remaining</span>
                  )}
                </div>
              </div>
            </div>

            {/* Places List Cards */}
            <div className="space-y-3">
              {filteredPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">No places found in this view</h3>
                  <p className="text-xs text-stone-500">Tap '+ Add Place to Visit' to record destinations for {currentCity.name}!</p>
                </div>
              ) : (
                filteredPlaces.map(place => (
                  <div
                    key={place.id}
                    className={`bg-white rounded-2xl border transition-all p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      place.checkedIn ? 'border-emerald-300 bg-emerald-50/20' : 'border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    {/* Left: Checkbox & Place Information */}
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleCheckIn(place.id)}
                        className="mt-0.5 text-stone-400 hover:text-emerald-600 transition"
                        title={place.checkedIn ? 'Mark Unvisited' : 'Mark Visited & Unlock Card'}
                      >
                        {place.checkedIn ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-6 h-6 text-stone-300 hover:text-stone-400" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                            {place.category}
                          </span>
                          {place.timeOfDay && (
                            <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                              {place.timeOfDay}
                            </span>
                          )}
                          {place.costJPY > 0 && (
                            <span className="text-[10px] text-stone-500 font-mono">
                              Est: ¥{place.costJPY.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-2">
                          <h3 className={`font-black text-base ${place.checkedIn ? 'text-emerald-950 line-through opacity-85' : 'text-slate-900'}`}>
                            {place.title}
                          </h3>
                          {place.titleJa && (
                            <span className="text-xs text-stone-500 font-serif">
                              {place.titleJa}
                            </span>
                          )}
                        </div>

                        {place.notes && (
                          <p className="text-xs text-stone-600 italic">
                            "{place.notes}"
                          </p>
                        )}

                        {place.checkedIn && (
                          <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 pt-0.5">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            Checked in by {place.checkedInBy} on {place.unlockedAt}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 w-full sm:w-auto justify-end">
                      {/* Directions from Base Hotel Link */}
                      <a
                        href={getMapsUrl(place.title, place.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition"
                        title={`Transit route from ${currentCity.hotelName}`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>

                      {/* View / Inspect Card */}
                      <button
                        onClick={() => {
                          setInspectedCard(place);
                          cardAudio.playClick();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                          place.checkedIn
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span>Card</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          setPlaces(prev => prev.filter(p => p.id !== place.id));
                          if (supabaseRef.current) {
                            supabaseRef.current.from('trip_places').delete().eq('id', place.id).catch(console.warn);
                          }
                          cardAudio.playClick();
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600"
                        title="Delete Spot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: WAYPOINT DECK (SCENIC FANTASY TRADING CARDS)               */}
        {/* ================================================================== */}
        {activeTab === 'cards' && (
          <div className="space-y-4">
            
            {/* Waypoint Deck Banner */}
            <div className="bg-gradient-to-r from-[#171622] via-[#0E0D16] to-[#171622] text-amber-100 rounded-3xl p-5 shadow-2xl border-2 border-amber-400/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/10 via-sky-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between flex-wrap gap-3 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-xs">
                      <Compass className="w-3 h-3" /> Waypoint Deck
                    </span>
                    <span className="text-xs text-amber-300 font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> {places.filter(p => p.checkedIn).reduce((a, b) => a + (b.manaResonance || 880), 0)} Mana Recorded
                    </span>
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
                    Waypoint Deck • Scenery & Memories
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5 max-w-lg">
                    Pure fantasy watercolor landscape art. Soft watercolor skies, towering clouds, and tranquil stone arches. Check off destinations to unlock cards with interactive 3D holographic tilt!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const nextMute = !soundMuted;
                      setSoundMuted(nextMute);
                      cardAudio.muted = nextMute;
                    }}
                    className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs"
                    title="Toggle Audio Chimes"
                  >
                    {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setShowAddPlaceModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + New Spot / Card
                  </button>
                </div>
              </div>

              {/* Progress & City Filter */}
              <div className="mt-4 pt-3.5 border-t border-stone-800/80 flex items-center justify-between text-xs relative z-10 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-300 text-sm font-mono">
                    {places.filter(p => p.checkedIn).length} / {places.length} Landscapes Captured
                  </span>
                  <span className="text-stone-400 text-[11px]">
                    ({Math.round((places.filter(p => p.checkedIn).length / Math.max(1, places.length)) * 100)}% Mastered)
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {['all', 'fukuoka', 'kyoto', 'osaka'].map(cf => (
                    <button
                      key={cf}
                      onClick={() => setActiveCityId(cf === 'all' ? activeCityId : cf)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition ${
                        (cf === 'all' || activeCityId === cf) 
                          ? 'bg-amber-400 text-slate-950 shadow-xs' 
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {cf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full bg-stone-800 rounded-full h-1.5 mt-2.5 overflow-hidden relative z-10">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-sky-400 to-purple-400 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${(places.filter(p => p.checkedIn).length / Math.max(1, places.length)) * 100}%` }}
                />
              </div>
            </div>

            {/* Waypoint Trading Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {places.map(place => (
                <WaypointCard3D
                  key={place.id}
                  card={{
                    ...place,
                    cityName: cities.find(c => c.id === place.cityId)?.name || 'Japan'
                  }}
                  onClick={() => {
                    setInspectedCard(place);
                    cardAudio.playClick();
                  }}
                />
              ))}
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: ROUTE & TIMELINE                                           */}
        {/* ================================================================== */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            
            {/* Active Lodging Base */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Active Base Camp • {currentCity.name}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{currentCity.hotelName}</h2>
                  <p className="text-xs text-stone-500 font-serif mt-0.5">{currentCity.hotelAddress}</p>
                </div>

                <button
                  onClick={() => setShowEditCityModal(currentCity)}
                  className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Leg
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-stone-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                    <Train className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-medium">Nearest Station</span>
                    <p className="text-slate-800 font-semibold">{currentCity.station}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-medium">Time in {currentCity.name}</span>
                    <p className="text-slate-800 font-semibold font-mono">
                      {timers.nextD}d {timers.nextH}h {timers.nextM}m {timers.nextS}s
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable City Route Timeline */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Campaign Route & Cities</h3>
                  <p className="text-xs text-stone-500">Edit origin city, transit dates, hotels, and train transfers</p>
                </div>

                <button
                  onClick={() => setShowNewCityModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-stone-50 text-xs font-medium hover:bg-slate-800 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add City Leg
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                {cities.map((city, idx) => {
                  const isCurrent = city.id === activeCityId;
                  const isOrigin = idx === 0;

                  return (
                    <div
                      key={city.id}
                      className={`p-3.5 rounded-xl border transition ${
                        isCurrent 
                          ? 'border-slate-900 bg-stone-50/70 ring-1 ring-slate-900/10' 
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{idx === 0 ? '🚅' : idx === 1 ? '⛩️' : '🐙'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{city.name}</h4>
                              {isOrigin && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                                  Origin
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-stone-50">
                                  Active Base
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 font-serif">{city.nameJa}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowEditCityModal(city)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 hover:text-slate-900"
                            title="Edit Leg"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {cities.length > 1 && (
                            <button
                              onClick={() => setCities(prev => prev.filter(c => c.id !== city.id))}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-stone-400 hover:text-rose-600"
                              title="Delete Leg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t border-stone-100 text-xs text-stone-600">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-medium">Dates</span>
                          <span className="font-medium text-slate-800">
                            {city.startDate.replace('T', ' ')} ➔ {city.endDate.replace('T', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-medium">Hotel Lodging</span>
                          <span className="truncate block font-medium text-slate-800">{city.hotelName}</span>
                        </div>
                      </div>

                      {city.transitToNext && (
                        <div className="mt-2.5 pt-2 border-t border-dashed border-stone-200 flex items-center justify-between text-xs text-stone-500">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Train className="w-3.5 h-3.5 text-stone-400" />
                            Transfer: {city.transitToNext}
                          </span>
                          {!isCurrent && (
                            <button
                              onClick={() => {
                                setActiveCityId(city.id);
                                cardAudio.playClick();
                              }}
                              className="text-xs font-semibold text-slate-900 hover:underline"
                            >
                              Switch Base Camp ➔
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 4: COMMON KITTY & SPENDING INFOGRAPHICS                       */}
        {/* ================================================================== */}
        {activeTab === 'kitty' && (
          <div className="space-y-4">
            
            {/* Kitty Overview Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Common Kitty • Tabung Bersama
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-700 mt-1">
                    Equal Pool for {travelers.length} Companions
                  </h3>
                </div>

                <button
                  onClick={() => setShowTopUpModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-stone-50 text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Top Up Kitty
                </button>
              </div>

              {/* Main JPY / MYR Display */}
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    ¥{kittyStats.remaining.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    ≈ RM {jpyToMyr(kittyStats.remaining)}
                  </span>
                </div>
              </div>

              {/* Traveler Contributions Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-stone-100 text-xs">
                {travelers.map(t => {
                  const travelerPaid = contributions
                    .filter(c => c.travelerId === t.id)
                    .reduce((a, b) => a + Number(b.amountJPY || 0), 0);

                  return (
                    <div key={t.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                      <span className="text-[10px] text-stone-400 font-medium block uppercase truncate">
                        {t.avatar} {t.name}
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        ¥{travelerPaid.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-stone-500">RM {jpyToMyr(travelerPaid)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spending Infographic: What did we spend on the most? */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Spending Infographic
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">What did we spend on the most?</h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase font-medium block">Total Group Spend</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ¥{kittyStats.totalAllSpend.toLocaleString()}
                  </span>
                </div>
              </div>

              {kittyStats.topCat && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <span className="text-stone-400 text-[10px] uppercase font-medium block">#1 Top Spending Category</span>
                      <span className="font-bold text-slate-900 text-sm">{kittyStats.topCat.name}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {kittyStats.topCat.pct}% of budget
                  </span>
                </div>
              )}

              {/* Ranked Category Bars */}
              <div className="space-y-2.5 pt-2">
                {kittyStats.ranked.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.name}</span>
                      <span className="font-semibold text-slate-900">¥{cat.amount.toLocaleString()} ({cat.pct}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-slate-900 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Log List */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Expense Log</h4>
                  <p className="text-xs text-stone-500">Separated by Kitty Pool vs. Personal Pocket</p>
                </div>

                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-slate-900 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Expense
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {expenses.map(e => (
                  <div
                    key={e.id}
                    className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          e.paymentMethod === 'kitty' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {e.paymentMethod === 'kitty' ? 'Kitty Pool' : 'Personal'}
                        </span>
                        <span className="text-stone-400">{e.category}</span>
                      </div>
                      <p className="font-semibold text-slate-900 mt-1">{e.title}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">¥{Number(e.amountJPY).toLocaleString()}</p>
                        <p className="text-[10px] text-stone-400">RM {jpyToMyr(e.amountJPY)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setExpenses(prev => prev.filter(x => x.id !== e.id));
                          if (supabaseRef.current) {
                            supabaseRef.current.from('trip_expenses').delete().eq('id', e.id).catch(console.warn);
                          }
                        }}
                        className="text-stone-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 5: AI CHAT (POWERED BY GEMINI PRO / 3.8 FLASH)                */}
        {/* ================================================================== */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col h-[75vh] overflow-hidden">
            
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Waypoint AI Companion</h3>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                      {selectedGeminiModel}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Telemetry: {currentCity.name} • {completedCount}/{activeCityPlaces.length} Spots Done • Kitty: ¥{kittyStats.remaining.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowApiSettingsModal(true)}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs flex items-center gap-1"
                title="Change Model, API Key or Cloud Sync"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[10px]">Config</span>
              </button>
            </div>

            <div className="p-2.5 border-b border-stone-100 bg-stone-50/30 flex gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => handleAiSend(`Give our morning travel briefing for ${currentCity.name}. We are staying at ${currentCity.hotelName}. Check our remaining places to visit today (${activeCityPlaces.filter(p => !p.checkedIn).map(p => p.title).join(', ')}), give transit advice, and food tips!`)}
                disabled={isAiThinking}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold flex items-center gap-1.5 border border-amber-200/60"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Morning Briefing
              </button>

              <button
                onClick={() => handleAiSend(`Suggest a whimsical hidden spot in ${currentCity.name} that fits a peaceful fantasy anime landscape aesthetic (quiet mossy gardens, tranquil tea shops, or historic stone paths) near our hotel ${currentCity.hotelName}!`)}
                disabled={isAiThinking}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold flex items-center gap-1.5 border border-purple-200/60"
              >
                <Feather className="w-3.5 h-3.5 text-purple-600" />
                Suggest Secret Scenic Spot
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {aiLog.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-stone-100 text-slate-800 rounded-tl-none whitespace-pre-wrap font-sans'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex items-center gap-2 text-stone-400 text-xs p-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
                  Waypoint AI is channeling {selectedGeminiModel}...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiSend();
              }}
              className="p-3 border-t border-stone-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={`Ask ${selectedGeminiModel} about ${currentCity.name}, train lines, or food...`}
                className="flex-1 text-xs bg-stone-50 border border-stone-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={isAiThinking || !aiInput.trim()}
                className="p-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* BOTTOM NAVIGATION BAR                                                */}
      {/* ==================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 py-2 px-2 shadow-sm">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-[10px]">
          
          <button
            onClick={() => {
              setActiveTab('places');
              cardAudio.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'places' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mb-0.5" />
            <span>Places</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('cards');
              cardAudio.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'cards' ? 'text-amber-600 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Compass className="w-4 h-4 mb-0.5" />
            <span>Deck</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('timeline');
              cardAudio.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'timeline' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('kitty');
              cardAudio.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'kitty' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <PieChart className="w-4 h-4 mb-0.5" />
            <span>Kitty</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai');
              cardAudio.playClick();
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'ai' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Bot className="w-4 h-4 mb-0.5" />
            <span>AI Chat</span>
          </button>

        </div>
      </nav>

      {/* ==================================================================== */}
      {/* MODAL 1: ADD PLACE TO VISIT (CITY SPECIFIC)                          */}
      {/* ==================================================================== */}
      {showAddPlaceModal && (
        <AddPlaceModal
          currentCity={currentCity}
          cities={cities}
          onClose={() => setShowAddPlaceModal(false)}
          onAdd={async (newPlace) => {
            setPlaces(prev => [newPlace, ...prev]);
            setShowAddPlaceModal(false);
            cardAudio.playFoilUnlock();

            if (supabaseRef.current) {
              try {
                await supabaseRef.current.from('trip_places').insert([{
                  id: newPlace.id,
                  city: newPlace.cityId,
                  name: newPlace.title,
                  jp_name: newPlace.titleJa,
                  category: newPlace.category,
                  time_of_day: newPlace.timeOfDay,
                  est_cost: newPlace.costJPY,
                  notes: newPlace.notes,
                  visited: false,
                  card_unlocked: false,
                  image_url: newPlace.artworkUrl
                }]);
              } catch (err) {
                console.warn('Could not insert place into cloud database:', err);
              }
            }
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: WAYPOINT CARD INSPECTION & REGENERATOR                      */}
      {/* ==================================================================== */}
      {inspectedCard && (
        <CardInspectionModal
          card={inspectedCard}
          currentCity={currentCity}
          onClose={() => setInspectedCard(null)}
          onCheckIn={() => handleToggleCheckIn(inspectedCard.id)}
          onGenerateArt={() => handleGenerateLandscapeArt(inspectedCard)}
          onUpdateNotes={(newNotes) => {
            setPlaces(prev => prev.map(p => p.id === inspectedCard.id ? { ...p, notes: newNotes } : p));
            setInspectedCard(prev => ({ ...prev, notes: newNotes }));
            if (supabaseRef.current) {
              supabaseRef.current.from('trip_places').update({ notes: newNotes }).eq('id', inspectedCard.id).catch(console.warn);
            }
          }}
          getMapsUrl={getMapsUrl}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: GEMINI PRO & SUPABASE CLOUD SETTINGS                        */}
      {/* ==================================================================== */}
      {showApiSettingsModal && (
        <ApiSettingsModal
          apiKey={geminiApiKey}
          model={selectedGeminiModel}
          supabaseUrl={supabaseUrl}
          supabaseKey={supabaseAnonKey}
          onClose={() => setShowApiSettingsModal(false)}
          onSave={(key, model, sUrl, sKey) => {
            setGeminiApiKey(key);
            setSelectedGeminiModel(model);
            setSupabaseUrl(sUrl);
            setSupabaseAnonKey(sKey);
            setShowApiSettingsModal(false);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: MANAGE TRAVELERS                                            */}
      {/* ==================================================================== */}
      {showManageTravelers && (
        <ManageTravelersModal
          travelers={travelers}
          onClose={() => setShowManageTravelers(false)}
          onUpdate={(updated) => {
            setTravelers(updated);
            if (!updated.some(t => t.id === activeTravelerId)) {
              setActiveTravelerId(updated[0]?.id || '');
            }
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: EDIT OR ADD CITY LEG                                        */}
      {/* ==================================================================== */}
      {(showEditCityModal || showNewCityModal) && (
        <EditCityModal
          city={showEditCityModal}
          isNew={!!showNewCityModal}
          onClose={() => {
            setShowEditCityModal(null);
            setShowNewCityModal(false);
          }}
          onSave={(saved) => {
            if (showNewCityModal) setCities(prev => [...prev, saved]);
            else setCities(prev => prev.map(c => c.id === saved.id ? saved : c));
            setShowEditCityModal(null);
            setShowNewCityModal(false);
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: TOP UP KITTY POOL                                           */}
      {/* ==================================================================== */}
      {showTopUpModal && (
        <TopUpModal
          travelers={travelers}
          onClose={() => setShowTopUpModal(false)}
          onAdd={async (items) => {
            setContributions(prev => [...items, ...prev]);
            setShowTopUpModal(false);
            cardAudio.playClick();
          }}
        />
      )}

      {/* ==================================================================== */}
      {/* MODAL 7: LOG EXPENSE                                                 */}
      {/* ==================================================================== */}
      {showExpenseModal && (
        <AddExpenseModal
          travelers={travelers}
          activeTravelerId={activeTravelerId}
          onClose={() => setShowExpenseModal(false)}
          onAdd={async (exp) => {
            setExpenses(prev => [exp, ...prev]);
            setShowExpenseModal(false);
            cardAudio.playClick();

            if (supabaseRef.current) {
              try {
                await supabaseRef.current.from('trip_expenses').insert([{
                  id: exp.id,
                  title: exp.title,
                  amount_jpy: exp.amountJPY,
                  category: exp.category,
                  paid_by: exp.paidBy,
                  is_kitty: exp.paymentMethod === 'kitty',
                  created_at: new Date().toISOString()
                }]);
              } catch (err) {
                console.warn('Could not insert expense to cloud:', err);
              }
            }
          }}
        />
      )}

    </div>
  );
}

// ============================================================================
// 6. MODAL: ADD PLACE TO VISIT (CITY SPECIFIC)
// ============================================================================
function AddPlaceModal({ currentCity, cities, onClose, onAdd }) {
  const [cityId, setCityId] = useState(currentCity.id);
  const [title, setTitle] = useState('');
  const [titleJa, setTitleJa] = useState('');
  const [category, setCategory] = useState('Shrines & Temples');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [costJPY, setCostJPY] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const fallbackArt = generateProceduralLandscapeArt(title, category);

    onAdd({
      id: 'place-' + Date.now(),
      cityId,
      title: title.trim(),
      titleJa: titleJa.trim() || title.trim(),
      category,
      timeOfDay,
      costJPY: Number(costJPY) || 0,
      checkedIn: false,
      checkedInBy: null,
      unlockedAt: null,
      address: address.trim() || `${currentCity.name}, Japan`,
      notes: notes.trim(),
      rarity: category === 'Shrines & Temples' ? 'Mythic Grimoire' : 'Ancient Relic',
      manaResonance: Math.floor(Math.random() * 400) + 700,
      stars: 5,
      cardBio: `A quiet scenic destination in ${currentCity.name} steeped in memories and gentle skies.`,
      artworkUrl: fallbackArt
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">+ Add Place to Visit</h3>
            <p className="text-[11px] text-stone-500">Add to your city travel checklist</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">City Leg</label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
            >
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.nameJa})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Place Name (English)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arashiyama Bamboo Grove"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Japanese Kanji / Kana (Optional)</label>
            <input
              type="text"
              value={titleJa}
              onChange={(e) => setTitleJa(e.target.value)}
              placeholder="e.g. 嵐山 竹林の小径"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <option>Shrines & Temples</option>
                <option>Nature & Walks</option>
                <option>Dining & Street Food</option>
                <option>Historical Keep</option>
                <option>Shopping & Konbini</option>
                <option>Viewpoint & Skyline</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-medium">Best Time</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
              >
                <option>Early Morning (7:00 AM)</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Sunset / Golden Hour</option>
                <option>Evening / Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Estimated Cost (¥ JPY)</label>
            <input
              type="number"
              min="0"
              value={costJPY}
              onChange={(e) => setCostJPY(e.target.value)}
              placeholder="e.g. 500 (Leave blank if free)"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Address / Station Exit</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Arashiyama Station"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Notes & Travel Strategy</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Visit early to avoid tourist crowds..."
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Save Destination
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 7. MODAL: GEMINI PRO & SUPABASE CLOUD SETTINGS
// ============================================================================
function ApiSettingsModal({ apiKey, model, supabaseUrl, supabaseKey, onClose, onSave }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(model || 'gemini-3.8-flash');
  const [tempSUrl, setTempSUrl] = useState(supabaseUrl || '');
  const [tempSKey, setTempSKey] = useState(supabaseKey || '');

  const handleSave = (e) => {
    e.preventDefault();
    onSave(tempKey.trim(), tempModel, tempSUrl.trim(), tempSKey.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Waypoint Engine Settings</h3>
              <p className="text-[10px] text-stone-500">Configure AI Intelligence & Supabase Cloud Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          {/* Section A: Gemini AI Configuration */}
          <div className="border border-stone-200 rounded-2xl p-3 bg-stone-50/50 space-y-2">
            <span className="text-[10px] font-bold text-slate-900 uppercase block">1. Gemini AI Model</span>
            <div>
              <select
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-bold text-slate-900"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (High-Speed Reasoning)</option>
                <option value="gemini-3.1-pro">gemini-3.1-pro (Pro Intelligence Tier)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Extended Pro Context)</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Gemini API Key</label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Section B: Supabase Real-Time Cloud Sync */}
          <div className="border border-stone-200 rounded-2xl p-3 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-900 uppercase block">2. Real-Time Cloud Sync</span>
              <Database className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Supabase Project URL</label>
              <input
                type="text"
                value={tempSUrl}
                onChange={(e) => setTempSUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Supabase Anon Public Key</label>
              <input
                type="password"
                value={tempSKey}
                onChange={(e) => setTempSKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <p className="text-[9px] text-stone-400">Leave blank to keep app operating in offline mode with local storage.</p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 8. MODAL: WAYPOINT CARD INSPECTION & REGENERATOR
// ============================================================================
function CardInspectionModal({
  card,
  currentCity,
  onClose,
  onCheckIn,
  onGenerateArt,
  onUpdateNotes,
  getMapsUrl
}) {
  const [editingNotes, setEditingNotes] = useState(card.notes || '');

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-b from-[#181824] via-[#101018] to-black text-amber-50 rounded-3xl p-5 max-w-sm w-full shadow-2xl border-2 border-amber-400/90 space-y-4 my-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-800 text-stone-400 hover:text-white z-30"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 3D Card Preview */}
        <div className="pt-2">
          <WaypointCard3D 
            card={{
              ...card,
              cityName: currentCity.name
            }} 
            isInspecting={true} 
          />
        </div>

        {/* Details & Lore */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-300">{card.category}</span>
            <span className="text-[10px] font-mono font-bold text-sky-400">+{card.manaResonance || 880} MP</span>
          </div>
          <h2 className="text-lg font-black text-white">{card.title}</h2>
          <p className="text-xs text-amber-200/80 font-serif">{card.titleJa}</p>
          <p className="text-xs text-stone-300 italic bg-stone-800/60 p-2.5 rounded-xl border border-stone-800 mt-2">
            "{card.cardBio}"
          </p>
        </div>

        {/* Art Engine Regenerator */}
        <div className="bg-stone-900/80 p-3 rounded-2xl border border-stone-700/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Pure Scenery Generator
            </span>
            <p className="text-[10px] text-stone-400">Uses Gemini 3.1 Flash Image AI</p>
          </div>

          <button
            onClick={onGenerateArt}
            disabled={card.isGeneratingArt}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${card.isGeneratingArt ? 'animate-spin' : ''}`} />
            Conjure Art
          </button>
        </div>

        {/* Travel Notes */}
        <div>
          <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
            Travel Notes & Memory
          </label>
          <textarea
            rows={2}
            value={editingNotes}
            onChange={(e) => setEditingNotes(e.target.value)}
            onBlur={() => onUpdateNotes(editingNotes)}
            placeholder="Field notes, memories, or food tips..."
            className="w-full text-xs bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCheckIn}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition shadow-sm ${
              card.checkedIn 
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' 
                : 'bg-gradient-to-r from-amber-400 via-sky-400 to-purple-400 hover:opacity-90 text-slate-950 font-black'
            }`}
          >
            {card.checkedIn ? 'Mark as Unvisited' : 'Stamp Check-in & Unlock ✓'}
          </button>

          <a
            href={getMapsUrl(card.title, card.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            Route
          </a>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// 9. AUXILIARY MODALS (TRAVELERS, EDIT CITY, KITTY)
// ============================================================================
function ManageTravelersModal({ travelers, onClose, onUpdate }) {
  const [list, setList] = useState(travelers);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🎒');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const item = {
      id: 't-' + Date.now(),
      name: newName.trim(),
      avatar: newAvatar || '🎒',
      role: 'Adventurer'
    };
    const updated = [...list, item];
    setList(updated);
    onUpdate(updated);
    setNewName('');
    cardAudio.playClick();
  };

  const handleDelete = (id) => {
    if (list.length <= 1) return;
    const updated = list.filter(t => t.id !== id);
    setList(updated);
    onUpdate(updated);
    cardAudio.playClick();
  };

  const handleEditName = (id, val) => {
    const updated = list.map(t => t.id === id ? { ...t, name: val } : t);
    setList(updated);
    onUpdate(updated);
  };

  const handleEditAvatar = (id, val) => {
    const updated = list.map(t => t.id === id ? { ...t, avatar: val } : t);
    setList(updated);
    onUpdate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Manage Travelers</h3>
            <p className="text-[11px] text-stone-500">Add companions, edit names, or change avatars</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {list.map(t => (
            <div key={t.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
              <input
                type="text"
                value={t.avatar}
                onChange={(e) => handleEditAvatar(t.id, e.target.value)}
                className="w-9 h-9 text-center bg-white border border-stone-200 rounded-lg text-base"
                title="Change Avatar"
              />
              <input
                type="text"
                value={t.name}
                onChange={(e) => handleEditName(t.id, e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-slate-900"
              />
              {list.length > 1 && (
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600"
                  title="Remove Companion"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="pt-2 border-t border-stone-100 flex gap-1.5">
          <input
            type="text"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
            className="w-10 text-center bg-stone-50 border border-stone-200 rounded-xl text-base"
            placeholder="Emoji"
          />
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Friend's name..."
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            + Add
          </button>
        </form>

        <button
          onClick={onClose}
          className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-slate-800 rounded-xl text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function EditCityModal({ city, isNew, onClose, onSave }) {
  const [name, setName] = useState(city?.name || '');
  const [nameJa, setNameJa] = useState(city?.nameJa || '');
  const [hotelName, setHotelName] = useState(city?.hotelName || '');
  const [hotelAddress, setHotelAddress] = useState(city?.hotelAddress || '');
  const [station, setStation] = useState(city?.station || '');
  const [startDate, setStartDate] = useState(city?.startDate || '2026-10-24T09:00');
  const [endDate, setEndDate] = useState(city?.endDate || '2026-10-27T10:30');
  const [transitToNext, setTransitToNext] = useState(city?.transitToNext || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: city?.id || 'city-' + Date.now(),
      name,
      nameJa,
      hotelName,
      hotelAddress,
      station,
      startDate,
      endDate,
      transitToNext
    });
    cardAudio.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">
            {isNew ? '+ Add New City Leg' : 'Edit City Route & Lodging'}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">City Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fukuoka"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">Japanese Kanji / Hiragana</label>
            <input
              type="text"
              value={nameJa}
              onChange={(e) => setNameJa(e.target.value)}
              placeholder="e.g. 福岡・博多"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 font-serif"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-stone-500 uppercase">Arrival Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-stone-500 uppercase">Departure Date & Time</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">Hotel Lodging Base</label>
            <input
              type="text"
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="e.g. Miyako Hotel Hakata"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">Hotel Address / Station Gate</label>
            <input
              type="text"
              value={hotelAddress}
              onChange={(e) => setHotelAddress(e.target.value)}
              placeholder="e.g. 2-1-1 Hakataekihigashi"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">Transit to Next City</label>
            <input
              type="text"
              value={transitToNext}
              onChange={(e) => setTransitToNext(e.target.value)}
              placeholder="e.g. Shinkansen Nozomi (2h 45m)"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Save Leg
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TopUpModal({ travelers, onClose, onAdd }) {
  const [amt, setAmt] = useState(1000);
  const [mode, setMode] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = Number(amt);
    if (!val || val <= 0) return;

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const items = [];

    if (mode === 'all') {
      travelers.forEach(t => {
        items.push({
          id: 'c-' + Date.now() + '-' + t.id,
          travelerId: t.id,
          amountJPY: val,
          date: dateStr,
          note: `Equal top-up ¥${val.toLocaleString()}`
        });
      });
    } else {
      items.push({
        id: 'c-' + Date.now(),
        travelerId: mode,
        amountJPY: val,
        date: dateStr,
        note: `Single top-up ¥${val.toLocaleString()}`
      });
    }

    onAdd(items);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Top Up Common Kitty</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Contributor</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 font-semibold"
            >
              <option value="all">Everyone Puts Same Amount (All {travelers.length} Travelers)</option>
              {travelers.map(t => (
                <option key={t.id} value={t.id}>Single: {t.avatar} {t.name} Only</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Quick Presets (¥ JPY)</label>
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[1000, 3000, 5000, 10000].map(v => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setAmt(v)}
                  className={`py-1.5 rounded-lg font-bold border transition ${
                    Number(amt) === v ? 'bg-slate-900 text-white border-slate-900' : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  ¥{v.toLocaleString()}
                </button>
              ))}
            </div>

            <input
              type="number"
              required
              min="100"
              step="100"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
              className="w-full mt-2.5 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-slate-900 font-bold"
            />
          </div>

          <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
            Total added to Kitty: ¥{(mode === 'all' ? amt * travelers.length : amt).toLocaleString()}
          </p>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddExpenseModal({ travelers, activeTravelerId, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [amountJPY, setAmountJPY] = useState('');
  const [category, setCategory] = useState('Ramen & Dining');
  const [paymentMethod, setPaymentMethod] = useState('kitty');
  const [paidBy, setPaidBy] = useState(activeTravelerId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amountJPY) return;

    onAdd({
      id: 'e-' + Date.now(),
      title,
      amountJPY: Number(amountJPY),
      category,
      paymentMethod,
      paidBy: paymentMethod === 'personal' ? paidBy : null,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Record Expense</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Payment Source</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('kitty')}
                className={`py-2 rounded-xl border font-medium ${
                  paymentMethod === 'kitty' ? 'bg-slate-900 text-white border-slate-900' : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                Common Kitty
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('personal')}
                className={`py-2 rounded-xl border font-medium ${
                  paymentMethod === 'personal' ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                Personal Pocket
              </button>
            </div>
          </div>

          {paymentMethod === 'personal' && (
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-medium">Paid By Traveler</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              >
                {travelers.map(t => (
                  <option key={t.id} value={t.id}>{t.avatar} {t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Expense Item</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ichiran Tonkotsu Ramen"
              className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Amount (¥ JPY)</label>
            <input
              type="number"
              required
              min="1"
              value={amountJPY}
              onChange={(e) => setAmountJPY(e.target.value)}
              placeholder="2800"
              className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
            >
              <option>Ramen & Dining</option>
              <option>Konbini</option>
              <option>Transit</option>
              <option>Temples</option>
              <option>Shopping</option>
              <option>Lodging</option>
              <option>Misc</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
