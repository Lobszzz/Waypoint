import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Calendar, 
  PieChart, 
  Bot, 
  Plus, 
  Trash2, 
  Send, 
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
  MapPin, 
  RefreshCw, 
  Eye, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Sliders, 
  BookOpen, 
  Compass, 
  ExternalLink,
  Cloud,
  Database
} from 'lucide-react';

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
    osc.frequency.setValueAtTime(480, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
}
const cardAudio = new CardAudioEngine();

function generateProceduralLandscape(title, category) {
  const isNight = title.toLowerCase().includes('night') || 
                  title.toLowerCase().includes('canal') || 
                  title.toLowerCase().includes('dotonbori') ||
                  title.toLowerCase().includes('yatai');
  
  if (isNight) {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="twilightSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%23111827"/>
          <stop offset="45%" stop-color="%231E1B4B"/>
          <stop offset="75%" stop-color="%239A3412"/>
          <stop offset="100%" stop-color="%23F59E0B"/>
        </linearGradient>
        <linearGradient id="waterMirror" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="%231E1B4B"/>
          <stop offset="100%" stop-color="%23090D16"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="600" height="600" fill="url(%23twilightSky)"/>
      <ellipse cx="490" cy="160" rx="42" ry="42" fill="%23FEF3C7" opacity="0.92" filter="url(%23glow)"/>
      <path d="M0,430 Q160,390 320,420 T600,400 L600,600 L0,600 Z" fill="url(%23waterMirror)"/>
      <polygon points="110,400 140,340 230,340 260,400" fill="%230F172A" opacity="0.9"/>
      <circle cx="185" cy="360" r="16" fill="%23F59E0B" filter="url(%23glow)"/>
      <circle cx="185" cy="360" r="8" fill="%23FEF08A"/>
      <circle cx="120" cy="240" r="3.5" fill="%2393C5FD" filter="url(%23glow)"/>
      <circle cx="260" cy="180" r="4.5" fill="%23FDE68A" filter="url(%23glow)"/>
      <circle cx="370" cy="280" r="3" fill="%23F472B6" filter="url(%23glow)"/>
      <circle cx="450" cy="330" r="3.5" fill="%2367E8F9" filter="url(%23glow)"/>
      <circle cx="310" cy="480" r="2.5" fill="%23FBBF24" opacity="0.6"/>
    </svg>`;
  }

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="azureSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%230284C7"/>
        <stop offset="35%" stop-color="%2338BDF8"/>
        <stop offset="80%" stop-color="%23BAE6FD"/>
        <stop offset="100%" stop-color="%23FEF3C7"/>
      </linearGradient>
      <linearGradient id="grassyHills" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%2365A30D"/>
        <stop offset="50%" stop-color="%234D7C0F"/>
        <stop offset="100%" stop-color="%231E3A1A"/>
      </linearGradient>
      <filter id="softManaGlow">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="600" height="600" fill="url(%23azureSky)"/>
    <circle cx="170" cy="250" r="95" fill="%23FFFFFF" opacity="0.95"/>
    <circle cx="290" cy="210" r="130" fill="%23FFFFFF" opacity="0.98"/>
    <circle cx="410" cy="260" r="105" fill="%23FFFFFF" opacity="0.94"/>
    <circle cx="280" cy="270" r="115" fill="%23F0F9FF" opacity="0.9"/>
    <polygon points="0,420 180,310 370,430" fill="%237DD3FC" opacity="0.55"/>
    <polygon points="210,430 410,270 600,440" fill="%2338BDF8" opacity="0.45"/>
    <path d="M0,410 Q190,340 410,380 T600,350 L600,600 L0,600 Z" fill="url(%23grassyHills)"/>
    <rect x="230" y="310" width="18" height="170" fill="%2364748B"/>
    <rect x="360" y="310" width="18" height="170" fill="%23475569"/>
    <polygon points="200,310 395,310 385,295 210,295" fill="%23334155"/>
    <polygon points="215,330 380,330 375,320 220,320" fill="%23475569"/>
    <circle cx="150" cy="390" r="4.5" fill="%2360A5FA" filter="url(%23softManaGlow)"/>
    <circle cx="260" cy="340" r="3.5" fill="%2393C5FD" filter="url(%23softManaGlow)"/>
    <circle cx="340" cy="370" r="5" fill="%23FDE68A" filter="url(%23softManaGlow)"/>
    <circle cx="470" cy="430" r="4" fill="%23F472B6" filter="url(%23softManaGlow)"/>
  </svg>`;
}

function createSupabaseRestAdapter(url, anonKey) {
  if (!url || !anonKey) return null;
  const cleanUrl = url.replace(/\/+$/, '');

  return {
    async select(table) {
      const res = await fetch(`${cleanUrl}/rest/v1/${table}?select=*`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      if (!res.ok) throw new Error('Supabase fetch failed');
      return await res.json();
    },
    async upsert(table, records) {
      const res = await fetch(`${cleanUrl}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(records)
      });
      return res.ok;
    }
  };
}

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
    const mult = isInspecting ? 20 : 12;
    setRotateX(((y - (rect.height / 2)) / (rect.height / 2)) * -mult);
    setRotateY(((x - (rect.width / 2)) / (rect.width / 2)) * mult);
    setGlintPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const isUnlocked = card.checkedIn;

  return (
    <div 
      className="perspective-1000 select-none cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setRotateX(0); setRotateY(0); }}
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
            ? 'bg-gradient-to-b from-[#181824] via-[#101018] to-black text-amber-50 border-2 border-amber-300/80 shadow-2xl ring-1 ring-amber-500/30'
            : 'bg-stone-900/90 backdrop-blur-md text-stone-400 border border-stone-800 shadow-xl'
        }`}
      >
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

        <div className="flex items-center justify-between text-xs relative z-20" style={{ transform: 'translateZ(25px)' }}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
              isUnlocked ? 'bg-amber-400 text-stone-950 font-mono' : 'bg-stone-800 text-stone-500'
            }`}>
              {card.cityName}
            </span>
            <span className="text-[10px] text-amber-300 font-mono flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-amber-400" /> {card.manaResonance || 880} MP
            </span>
          </div>
          <span className="text-[9px] font-black px-2 py-0.5 rounded-md font-mono bg-sky-600 text-white">
            {card.rarity || 'Common'}
          </span>
        </div>

        <div 
          className="relative mt-3 rounded-2xl overflow-hidden aspect-square border border-amber-300/30 bg-stone-950 flex items-center justify-center shadow-inner group"
          style={{ transform: 'translateZ(35px)' }}
        >
          {isUnlocked ? (
            <>
              <img src={card.artworkUrl} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-amber-200 flex items-center gap-1 border border-white/20">
                <Compass className="w-3 h-3 text-sky-400" /> Scenery Card
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-800/80 border border-stone-700/80 flex items-center justify-center shadow-lg mb-2">
                <Lock className="w-6 h-6 text-stone-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-stone-400">Waypoint Sealed</span>
            </div>
          )}
        </div>

        <div className="mt-3.5 relative z-20" style={{ transform: 'translateZ(20px)' }}>
          <span className="text-[10px] text-amber-300/90 font-bold uppercase tracking-wider">{card.category}</span>
          <h3 className={`font-black text-sm mt-0.5 truncate ${isUnlocked ? 'text-white' : 'text-stone-400'}`}>{card.title}</h3>
          <p className="text-[11px] text-amber-200/70 font-serif truncate">{card.titleJa}</p>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_CITIES = [
  { id: 'fukuoka', name: 'Fukuoka', nameJa: '福岡・博多', hotelName: 'Miyako Hotel Hakata', hotelAddress: '2-1-1 Hakataekihigashi', station: 'JR Hakata Station', startDate: '2027-01-07T09:00', endDate: '2027-01-10T10:30', transitToNext: 'Shinkansen Nozomi (2h 45m)' },
  { id: 'kyoto', name: 'Kyoto', nameJa: '京都・千年の都', hotelName: 'The Thousand Kyoto', hotelAddress: '570 Higashishiokojicho', station: 'JR Kyoto Station', startDate: '2027-01-10T10:30', endDate: '2027-01-14T14:00', transitToNext: 'JR Special Rapid (28m)' },
  { id: 'osaka', name: 'Osaka', nameJa: '大阪・食いだおれ', hotelName: 'Swissôtel Nankai', hotelAddress: '5-1-60 Namba', station: 'Nankai Namba Station', startDate: '2027-01-14T14:00', endDate: '2027-01-18T18:00', transitToNext: 'Nankai Rapi:t (35m)' }
];

const DEFAULT_PLACES = [
  { id: 'p-fuk-1', cityId: 'fukuoka', title: 'Dazaifu Tenmangu Shrine', titleJa: '太宰府天満宮', category: 'Shrines & Temples', costJPY: 0, timeOfDay: 'Morning', checkedIn: true, checkedInBy: 'Lubelter', unlockedAt: 'Jan 07, 2027', notes: 'Try hot Umegae mochi outside the gate!', rarity: 'Ancient Relic', manaResonance: 920, artworkUrl: generateProceduralLandscape('Dazaifu Tenmangu Shrine', 'Shrines & Temples') },
  { id: 'p-fuk-2', cityId: 'fukuoka', title: 'Nakasu Yatai Food Stalls', titleJa: '中洲屋台街・博多ラーメン', category: 'Dining & Street Food', costJPY: 3000, timeOfDay: 'Night', checkedIn: false, notes: 'Open-air riverside food tents glowing under lanterns.', rarity: 'Hero Crest', manaResonance: 780, artworkUrl: generateProceduralLandscape('Nakasu Yatai Food Stalls Night', 'Dining & Street Food') }
];

const DEFAULT_TRAVELERS = [
  { id: 't1', name: 'Lubelter', avatar: '🧭', role: 'Party Navigator' },
  { id: 't2', name: 'Travel Buddy', avatar: '🍃', role: 'Companion' }
];

const DEFAULT_EXPENSES = [
  { id: 'e1', title: 'Hakata Kushida Gyoza', amountJPY: 2800, category: 'Dining', paymentMethod: 'kitty', date: 'Jan 07' }
];

const DEFAULT_CONTRIBUTIONS = [
  { id: 'c1', travelerId: 't1', amountJPY: 20000, date: 'Jan 06' },
  { id: 'c2', travelerId: 't2', amountJPY: 20000, date: 'Jan 06' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('places');
  const [now, setNow] = useState(new Date());

  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('waypoint_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('waypoint_supabase_key') || '');
  const [cloudStatus, setCloudStatus] = useState('local');

  const [travelers, setTravelers] = useState(() => {
    try { const s = localStorage.getItem('waypoint_travelers'); return s ? JSON.parse(s) : DEFAULT_TRAVELERS; } catch { return DEFAULT_TRAVELERS; }
  });
  const [activeTravelerId, setActiveTravelerId] = useState(() => travelers[0]?.id || 't1');

  const [cities, setCities] = useState(() => {
    try { const s = localStorage.getItem('waypoint_cities'); return s ? JSON.parse(s) : DEFAULT_CITIES; } catch { return DEFAULT_CITIES; }
  });
  const [activeCityId, setActiveCityId] = useState(() => cities[0]?.id || 'fukuoka');

  const [places, setPlaces] = useState(() => {
    try { const s = localStorage.getItem('waypoint_places'); return s ? JSON.parse(s) : DEFAULT_PLACES; } catch { return DEFAULT_PLACES; }
  });

  const [expenses, setExpenses] = useState(() => {
    try { const s = localStorage.getItem('waypoint_expenses'); return s ? JSON.parse(s) : DEFAULT_EXPENSES; } catch { return DEFAULT_EXPENSES; }
  });
  const [contributions, setContributions] = useState(() => {
    try { const s = localStorage.getItem('waypoint_contribs'); return s ? JSON.parse(s) : DEFAULT_CONTRIBUTIONS; } catch { return DEFAULT_CONTRIBUTIONS; }
  });

  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('waypoint_gemini_key') || '');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(() => localStorage.getItem('waypoint_gemini_model') || 'gemini-3.8-flash');
  const [showApiSettingsModal, setShowApiSettingsModal] = useState(false);

  const [aiLog, setAiLog] = useState([
    { role: 'assistant', text: "Greetings! Waypoint AI is active. How can I assist your Japan itinerary or Kitty tracking today?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => localStorage.setItem('waypoint_travelers', JSON.stringify(travelers)), [travelers]);
  useEffect(() => localStorage.setItem('waypoint_cities', JSON.stringify(cities)), [cities]);
  useEffect(() => localStorage.setItem('waypoint_places', JSON.stringify(places)), [places]);
  useEffect(() => localStorage.setItem('waypoint_expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('waypoint_contribs', JSON.stringify(contributions)), [contributions]);
  useEffect(() => localStorage.setItem('waypoint_gemini_key', geminiApiKey), [geminiApiKey]);
  useEffect(() => localStorage.setItem('waypoint_gemini_model', selectedGeminiModel), [selectedGeminiModel]);
  useEffect(() => localStorage.setItem('waypoint_supabase_url', supabaseUrl), [supabaseUrl]);
  useEffect(() => localStorage.setItem('waypoint_supabase_key', supabaseKey), [supabaseKey]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentCity = useMemo(() => cities.find(c => c.id === activeCityId) || cities[0], [cities, activeCityId]);

  const kittyStats = useMemo(() => {
    const totalDeposited = contributions.reduce((s, c) => s + Number(c.amountJPY || 0), 0);
    const kittySpent = expenses.filter(e => e.paymentMethod === 'kitty').reduce((s, e) => s + Number(e.amountJPY || 0), 0);
    return { remaining: totalDeposited - kittySpent, kittySpent };
  }, [contributions, expenses]);

  const activeCityPlaces = useMemo(() => places.filter(p => p.cityId === activeCityId), [places, activeCityId]);

  const handleToggleCheckIn = (placeId) => {
    cardAudio.playFoilUnlock();
    setPlaces(prev => prev.map(p => {
      if (p.id === placeId) {
        const next = !p.checkedIn;
        return { ...p, checkedIn: next, unlockedAt: next ? new Date().toLocaleDateString() : null };
      }
      return p;
    }));
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userText = aiInput.trim();
    setAiLog(prev => [...prev, { role: 'user', text: userText }]);
    setAiInput('');
    setIsAiThinking(true);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedGeminiModel}:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }],
          systemInstruction: { parts: [{ text: `You are the travel companion in Waypoint. Active City: ${currentCity.name}. Answer concisely with local Japan travel and food advice.` }] }
        })
      });
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply from model.";
      setAiLog(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setAiLog(prev => [...prev, { role: 'assistant', text: "Error contacting Gemini. Please verify your API Key in Config." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center ring-2 ring-amber-400">
              <Compass className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900">Waypoint</span>
              <select
                value={activeCityId}
                onChange={(e) => setActiveCityId(e.target.value)}
                className="ml-2 text-xs font-bold bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5"
              >
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={() => setShowApiSettingsModal(true)}
            className="p-1.5 rounded-lg border border-stone-200 text-xs flex items-center gap-1 bg-white hover:bg-stone-50"
          >
            <Sliders className="w-4 h-4 text-stone-600" />
            <span className="text-[11px] font-bold">Config</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="max-w-4xl mx-auto mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 flex items-center justify-between">
            <span className="text-amber-800 font-bold uppercase text-[10px] flex items-center gap-1"><Train className="w-3.5 h-3.5" /> Base</span>
            <span className="font-bold text-slate-900">{currentCity.hotelName.split(' ')[0]}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 flex items-center justify-between">
            <span className="text-emerald-800 font-bold uppercase text-[10px] flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> Kitty Pool</span>
            <span className="font-bold text-emerald-950 font-mono">¥{kittyStats.remaining.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4">
        {activeTab === 'places' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black text-slate-900">Places in {currentCity.name}</h2>
            {activeCityPlaces.map(place => (
              <div 
                key={place.id}
                onClick={() => handleToggleCheckIn(place.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  place.checkedIn ? 'bg-emerald-50/40 border-emerald-300' : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {place.checkedIn ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <Circle className="w-6 h-6 text-stone-300" />}
                  <div>
                    <h3 className={`font-bold text-sm ${place.checkedIn ? 'line-through text-stone-400' : 'text-slate-900'}`}>{place.title}</h3>
                    <p className="text-xs text-stone-500 font-serif">{place.titleJa}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{place.timeOfDay}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {places.map(place => (
              <WaypointCard3D key={place.id} card={{ ...place, cityName: currentCity.name }} onClick={() => handleToggleCheckIn(place.id)} />
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col h-[65vh]">
            <div className="flex-1 overflow-y-auto space-y-3 text-xs mb-3">
              {aiLog.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-stone-100 text-slate-900'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiThinking && <p className="text-stone-400 text-xs italic">Thinking...</p>}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiInput} 
                onChange={(e) => setAiInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Ask about train lines, food, spots..." 
                className="flex-1 text-xs border border-stone-200 rounded-xl px-3 py-2"
              />
              <button onClick={handleAiSend} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1 text-[11px] text-center font-bold">
          <button onClick={() => setActiveTab('places')} className={`py-1.5 rounded-lg ${activeTab === 'places' ? 'text-slate-900 bg-stone-100' : 'text-stone-400'}`}>Places</button>
          <button onClick={() => setActiveTab('cards')} className={`py-1.5 rounded-lg ${activeTab === 'cards' ? 'text-amber-600 bg-amber-50' : 'text-stone-400'}`}>Deck</button>
          <button onClick={() => setActiveTab('ai')} className={`py-1.5 rounded-lg ${activeTab === 'ai' ? 'text-slate-900 bg-stone-100' : 'text-stone-400'}`}>AI Chat</button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showApiSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Config Settings</h3>
              <button onClick={() => setShowApiSettingsModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-stone-500 block">Gemini API Key</label>
                <input type="password" value={geminiApiKey} onChange={(e) => setGeminiApiKey(e.target.value)} className="w-full border rounded-lg p-2 font-mono" placeholder="AIza..." />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block">Supabase URL</label>
                <input type="text" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} className="w-full border rounded-lg p-2 font-mono" placeholder="https://xyz.supabase.co" />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block">Supabase Anon Key</label>
                <input type="password" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} className="w-full border rounded-lg p-2 font-mono" placeholder="eyJ..." />
              </div>
              <button onClick={() => setShowApiSettingsModal(false)} className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold mt-2">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
