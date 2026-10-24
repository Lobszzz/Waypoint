import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Calendar, 
  PieChart, 
  Bot, 
  Plus, 
  Trash2, 
  Send, 
  Edit3, 
  Clock, 
  Train, 
  Users, 
  X, 
  Coins, 
  Sun, 
  MapPin, 
  RefreshCw, 
  Compass, 
  CheckCircle2, 
  Circle, 
  Settings, 
  ExternalLink, 
  Sliders, 
  Cloud, 
  CloudOff, 
  ArrowUpDown, 
  Navigation,
  Plane
} from 'lucide-react';

function getSupabaseClient(rawUrl, key) {
  if (!rawUrl || !key) return null;
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  try {
    const supabaseGlobal = typeof window !== 'undefined' ? window.supabase : null;
    if (supabaseGlobal && typeof supabaseGlobal.createClient === 'function') {
      return supabaseGlobal.createClient(cleanUrl, key);
    }

    return {
      from: (tableName) => ({
        select: async () => {
          try {
            const res = await fetch(`${cleanUrl}/rest/v1/${tableName}?select=*`, {
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
            const res = await fetch(`${cleanUrl}/rest/v1/${tableName}`, {
              method: 'POST',
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
              },
              body: JSON.stringify(rows)
            });
            return { error: res.ok ? null : await res.text() };
          } catch (e) {
            return { error: e };
          }
        },
        upsert: async (row) => {
          try {
            const res = await fetch(`${cleanUrl}/rest/v1/${tableName}`, {
              method: 'POST',
              headers: {
                apikey: key,
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates'
              },
              body: JSON.stringify(row)
            });
            return { error: res.ok ? null : await res.text() };
          } catch (e) {
            return { error: e };
          }
        },
        delete: () => ({
          eq: async (col, val) => {
            try {
              const res = await fetch(`${cleanUrl}/rest/v1/${tableName}?${col}=eq.${encodeURIComponent(val)}`, {
                method: 'DELETE',
                headers: { apikey: key, Authorization: `Bearer ${key}` }
              });
              return { error: res.ok ? null : new Error('Delete failed') };
            } catch (e) {
              return { error: e };
            }
          },
          neq: async (col, val) => {
            try {
              const res = await fetch(`${cleanUrl}/rest/v1/${tableName}?${col}=neq.${encodeURIComponent(val)}`, {
                method: 'DELETE',
                headers: { apikey: key, Authorization: `Bearer ${key}` }
              });
              return { error: res.ok ? null : new Error('Delete all failed') };
            } catch (e) {
              return { error: e };
            }
          }
        })
      }),
      channel: () => ({
        on: function() { return this; },
        subscribe: function(callback) { 
          if (typeof callback === 'function') callback('SUBSCRIBED');
          return this; 
        }
      }),
      removeChannel: () => {}
    };
  } catch (err) {
    return null;
  }
}

const DEFAULT_CITIES = [
  {
    id: 'osaka',
    name: 'Osaka',
    nameJa: '大阪・食いだおれ',
    hotelName: 'Swissôtel Nankai Osaka',
    hotelAddress: '5-1-60 Namba, Chuo Ward, Osaka',
    station: 'Nankai Namba Station Direct',
    startDate: '2026-10-24T09:00',
    endDate: '2026-10-27T10:30',
    transitToNext: 'JR Special Rapid (28m)'
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
    transitToNext: 'Shinkansen Nozomi (2h 45m)'
  },
  {
    id: 'fukuoka',
    name: 'Fukuoka',
    nameJa: '福岡・博多',
    hotelName: 'Miyako Hotel Hakata',
    hotelAddress: '2-1-1 Hakataekihigashi, Hakata Ward, Fukuoka',
    station: 'JR Hakata Station Direct Gate',
    startDate: '2026-10-30T14:00',
    endDate: '2026-11-03T18:00',
    transitToNext: 'Fukuoka Airport Subway (5m)'
  }
];

const DEFAULT_TRAVELERS = [
  { id: 't1', name: 'Lubelter', avatar: '⚡', role: 'Navigator' },
  { id: 't2', name: 'Khai', avatar: '🍃', role: 'Vanguard' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('places');
  const [now, setNow] = useState(new Date());
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('waypoint_supabase_url') || 'https://rplthksiyiwlqjcjazto.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('waypoint_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbHRoa3NpeWl3bHFqY2phenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3Njg1NDIsImV4cCI6MjEwODM0NDU0Mn0.CyVoRZ9yVQYZYykYANg94dLPBe_kxLeexh9kHEj8dsM');
  const [cloudSyncStatus, setCloudSyncStatus] = useState('syncing');
  const supabaseRef = useRef(null);

  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      supabaseRef.current = getSupabaseClient(supabaseUrl, supabaseAnonKey);
    } else {
      supabaseRef.current = null;
      setCloudSyncStatus('offline');
    }
  }, [supabaseUrl, supabaseAnonKey]);

  const [travelers, setTravelers] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_travelers');
      return s ? JSON.parse(s) : DEFAULT_TRAVELERS;
    } catch { return DEFAULT_TRAVELERS; }
  });
  const [activeTravelerId, setActiveTravelerId] = useState(() => travelers[0]?.id || 't1');

  const [cities, setCities] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_cities');
      return s ? JSON.parse(s) : DEFAULT_CITIES;
    } catch { return DEFAULT_CITIES; }
  });
  const [activeCityId, setActiveCityId] = useState(() => cities[0]?.id || 'osaka');

  const [places, setPlaces] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_places');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [placesFilter, setPlacesFilter] = useState('all');
  const [sortByDistance, setSortByDistance] = useState(false);

  const [expenses, setExpenses] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_expenses');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [contributions, setContributions] = useState(() => {
    try {
      const s = localStorage.getItem('waypoint_contribs');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [ratePer100Jpy] = useState(3.12);
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('waypoint_gemini_key') || '');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(() => localStorage.getItem('waypoint_gemini_model') || 'gemini-2.5-flash');

  const [showApiSettingsModal, setShowApiSettingsModal] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showManageTravelers, setShowManageTravelers] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditCityModal, setShowEditCityModal] = useState(null);
  const [showNewCityModal, setShowNewCityModal] = useState(false);

  const [aiLog, setAiLog] = useState([
    {
      role: 'assistant',
      text: "Greetings. I am your Waypoint travel companion. I track your destinations, schedule, and Common Kitty. How can I help you today?"
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Sync to Cloud
  const syncFromCloud = useCallback(async () => {
    if (!supabaseRef.current) return;
    try {
      setCloudSyncStatus('syncing');

      // 1. Places
      const { data: cloudPlaces, error: pErr } = await supabaseRef.current.from('trip_places').select('*');
      if (!pErr && Array.isArray(cloudPlaces)) {
        const mappedPlaces = cloudPlaces.map(cp => ({
          id: cp.id,
          cityId: cp.city || cp.cityId || 'osaka',
          title: cp.name || cp.title,
          titleJa: cp.jp_name || cp.titleJa || '',
          category: cp.category || 'Shrines & Temples',
          timeOfDay: cp.time_of_day || cp.timeOfDay || 'Morning',
          costJPY: Number(cp.est_cost || cp.costJPY || 0),
          distanceKm: Number(cp.distance_km || 0),
          transitMins: Number(cp.transit_mins || 0),
          checkedIn: !!(cp.visited || cp.checkedIn),
          checkedInBy: cp.checked_in_by || cp.checkedInBy || null,
          unlockedAt: cp.unlocked_at || cp.unlockedAt || null,
          address: cp.address || 'Japan',
          notes: cp.notes || ''
        }));
        setPlaces(mappedPlaces);
      }

      // 2. Expenses
      const { data: cloudExpenses, error: eErr } = await supabaseRef.current.from('trip_expenses').select('*');
      if (!eErr && Array.isArray(cloudExpenses)) {
        const mappedExpenses = cloudExpenses.map(ce => ({
          id: ce.id,
          title: ce.title,
          amountJPY: Number(ce.amount_jpy || ce.amountJPY || 0),
          category: ce.category || 'Ramen & Dining',
          paymentMethod: ce.is_kitty ? 'kitty' : 'personal',
          paidBy: ce.paid_by || null,
          date: ce.date || new Date(ce.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
        setExpenses(mappedExpenses);
      }

      // 3. Travelers
      const { data: cloudTravelers, error: tErr } = await supabaseRef.current.from('trip_travelers').select('*');
      if (!tErr && Array.isArray(cloudTravelers) && cloudTravelers.length > 0) {
        setTravelers(cloudTravelers);
      }

      // 4. Cities
      const { data: cloudCities, error: cErr } = await supabaseRef.current.from('trip_cities').select('*');
      if (!cErr && Array.isArray(cloudCities) && cloudCities.length > 0) {
        const sorted = [...cloudCities].sort((a, b) => new Date(a.start_date || a.startDate) - new Date(b.start_date || b.startDate));
        const mappedCities = sorted.map(cc => ({
          id: cc.id,
          name: cc.name,
          nameJa: cc.name_ja || cc.nameJa || '',
          hotelName: cc.hotel_name || cc.hotelName || '',
          hotelAddress: cc.hotel_address || cc.hotelAddress || '',
          station: cc.station || '',
          startDate: cc.start_date || cc.startDate || '2026-10-24T09:00',
          endDate: cc.end_date || cc.endDate || '2026-10-27T10:30',
          transitToNext: cc.transit_to_next || cc.transitToNext || ''
        }));
        setCities(mappedCities);
      }

      // 5. Contributions
      const { data: cloudContribs, error: cbErr } = await supabaseRef.current.from('trip_contributions').select('*');
      if (!cbErr && Array.isArray(cloudContribs)) {
        const mappedContribs = cloudContribs.map(cc => ({
          id: cc.id,
          travelerId: cc.traveler_id,
          amountJPY: Number(cc.amount_jpy || 0),
          date: cc.date,
          note: cc.note || ''
        }));
        setContributions(mappedContribs);
      }

      setCloudSyncStatus('connected');
    } catch {
      setCloudSyncStatus('offline');
    }
  }, []);

  useEffect(() => {
    syncFromCloud();
    let channel = null;
    if (supabaseRef.current) {
      try {
        channel = supabaseRef.current
          .channel('waypoint-realtime-all')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_places' }, () => syncFromCloud())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses' }, () => syncFromCloud())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_travelers' }, () => syncFromCloud())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_cities' }, () => syncFromCloud())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_contributions' }, () => syncFromCloud())
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') setCloudSyncStatus('connected');
          });
      } catch {}
    }
    return () => {
      if (channel && supabaseRef.current?.removeChannel) {
        supabaseRef.current.removeChannel(channel);
      }
    };
  }, [supabaseUrl, supabaseAnonKey, syncFromCloud]);

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

  // DEDICATED TRIP TIMERS & CITY LEG TIMERS
  const tripMetrics = useMemo(() => {
    if (!cities || cities.length === 0) {
      return {
        totalTripDays: 0,
        preTrip: false,
        flightCountdown: '0d 0h 0m 0s',
        daysLeftInCountry: '0d 0h 0m 0s',
        tripStartDateStr: '',
        tripEndDateStr: '',
        concluded: true
      };
    }

    const cur = now.getTime();
    const tripStart = new Date(cities[0].startDate).getTime();
    const tripEnd = new Date(cities[cities.length - 1].endDate).getTime();

    // Total Duration of whole trip in days
    const totalDays = Math.max(1, Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24)));

    const preTrip = cur < tripStart;
    const concluded = cur > tripEnd;

    // Countdown till flight
    const toFlightDiff = Math.max(0, tripStart - cur);
    const fD = Math.floor(toFlightDiff / (1000 * 60 * 60 * 24));
    const fH = Math.floor((toFlightDiff / (1000 * 60 * 60)) % 24);
    const fM = Math.floor((toFlightDiff / (1000 * 60)) % 60);
    const fS = Math.floor((toFlightDiff / 1000) % 60);
    const flightCountdown = `${fD}d ${fH}h ${fM}m ${fS}s`;

    // Countdown remaining days in country
    const remainDiff = Math.max(0, tripEnd - cur);
    const rD = Math.floor(remainDiff / (1000 * 60 * 60 * 24));
    const rH = Math.floor((remainDiff / (1000 * 60 * 60)) % 24);
    const rM = Math.floor((remainDiff / (1000 * 60)) % 60);
    const rS = Math.floor((remainDiff / 1000) % 60);
    const daysLeftInCountry = `${rD}d ${rH}h ${rM}m ${rS}s`;

    const startFmt = new Date(cities[0].startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFmt = new Date(cities[cities.length - 1].endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      totalTripDays: totalDays,
      preTrip,
      concluded,
      flightCountdown,
      daysLeftInCountry,
      tripStartDateStr: startFmt,
      tripEndDateStr: endFmt
    };
  }, [cities, now]);

  const cityLegMetrics = useMemo(() => {
    const cur = now.getTime();
    const curStart = new Date(currentCity.startDate).getTime();
    const curEnd = new Date(currentCity.endDate).getTime();

    const notStarted = cur < curStart;
    const isCompleted = cur > curEnd;

    let legCountdown = '';
    if (notStarted) {
      const d = Math.max(0, curStart - cur);
      legCountdown = `${Math.floor(d / (1000 * 60 * 60 * 24))}d ${Math.floor((d / (1000 * 60 * 60)) % 24)}h till arrival`;
    } else if (!isCompleted) {
      const d = Math.max(0, curEnd - cur);
      const days = Math.floor(d / (1000 * 60 * 60 * 24));
      const hours = Math.floor((d / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((d / (1000 * 60)) % 60);
      const secs = Math.floor((d / 1000) % 60);
      legCountdown = `${days}d ${hours}h ${mins}m ${secs}s`;
    } else {
      legCountdown = 'Completed';
    }

    const totalSpan = Math.max(1, curEnd - curStart);
    const elapsed = Math.max(0, Math.min(totalSpan, cur - curStart));
    const pctCity = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));

    return {
      legCountdown,
      pctCity,
      notStarted,
      isCompleted
    };
  }, [currentCity, now]);

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

  const activeCityPlaces = useMemo(() => {
    return places.filter(p => p.cityId === activeCityId);
  }, [places, activeCityId]);

  const filteredPlaces = useMemo(() => {
    let list = activeCityPlaces;
    if (placesFilter === 'pending') list = activeCityPlaces.filter(p => !p.checkedIn);
    if (placesFilter === 'visited') list = activeCityPlaces.filter(p => p.checkedIn);

    if (sortByDistance) {
      return [...list].sort((a, b) => (Number(a.distanceKm) || 999) - (Number(b.distanceKm) || 999));
    }
    return list;
  }, [activeCityPlaces, placesFilter, sortByDistance]);

  const completedCount = activeCityPlaces.filter(p => p.checkedIn).length;

  const handleToggleCheckIn = useCallback(async (placeId) => {
    const activeTraveler = travelers.find(t => t.id === activeTravelerId);
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
        return updated;
      }
      return p;
    }));

    if (supabaseRef.current && targetUpdated) {
      try {
        await supabaseRef.current.from('trip_places').upsert({
          id: targetUpdated.id,
          city: targetUpdated.cityId,
          name: targetUpdated.title,
          jp_name: targetUpdated.titleJa,
          category: targetUpdated.category,
          visited: targetUpdated.checkedIn,
          checked_in_by: targetUpdated.checkedInBy,
          unlocked_at: targetUpdated.unlockedAt,
          distance_km: targetUpdated.distanceKm,
          transit_mins: targetUpdated.transitMins,
          notes: targetUpdated.notes
        });
      } catch {}
    }
  }, [activeTravelerId, travelers]);

  const getMapsUrl = (destTitle, destAddress) => {
    const origin = encodeURIComponent(`${currentCity.hotelName}, ${currentCity.hotelAddress}`);
    const dest = encodeURIComponent(`${destTitle} ${destAddress || ''}`);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit`;
  };

  const handleResetKitty = async () => {
    if (!window.confirm("Reset Common Kitty back to ¥0 for everyone?")) return;
    setContributions([]);
    setExpenses([]);
    if (supabaseRef.current) {
      try {
        await supabaseRef.current.from('trip_contributions').delete().neq('id', '0');
        await supabaseRef.current.from('trip_expenses').delete().neq('id', '0');
      } catch {}
    }
  };

  const handleAiSend = async (forcedText = null) => {
    const text = (forcedText || aiInput).trim();
    if (!text) return;
    setAiLog(prev => [...prev, { role: 'user', text }]);
    setAiInput('');
    setIsAiThinking(true);

    const apiKey = geminiApiKey || "";
    const modelToUse = selectedGeminiModel || "gemini-2.5-flash";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

    const contextPayload = {
      travelers: travelers.map(t => `${t.name} (${t.role})`),
      activeTraveler: travelers.find(t => t.id === activeTravelerId)?.name,
      currentCity: currentCity.name,
      hotelBase: `${currentCity.hotelName} near ${currentCity.station}`,
      kittyRemainingJPY: `¥${kittyStats.remaining.toLocaleString()} (~RM ${jpyToMyr(kittyStats.remaining)})`,
      placesToVisit: activeCityPlaces.filter(p => !p.checkedIn).map(p => `${p.title} (${p.category})`),
      alreadyVisited: activeCityPlaces.filter(p => p.checkedIn).map(p => p.title)
    };

    const systemPrompt = `You are the travel companion in Waypoint.
LIVE STATUS FOR ${currentCity.name.toUpperCase()}:
${JSON.stringify(contextPayload, null, 2)}
Respond with practical transit tips, timing advice, food specialties, and concise itinerary recommendations.`;

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
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to retrieve advice.";
      setAiLog(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setAiLog(prev => [...prev, { role: 'assistant', text: "Request failed. Please check your Gemini API key in Settings." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 font-sans flex flex-col pb-24 selection:bg-amber-100 selection:text-amber-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
              <Compass className="w-4 h-4 text-amber-400" />
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
                
                <select
                  value={activeCityId}
                  onChange={(e) => setActiveCityId(e.target.value)}
                  className="text-[11px] font-bold bg-stone-100 border border-stone-200 text-stone-800 rounded-md px-1.5 py-0.5 focus:outline-none cursor-pointer ml-1"
                >
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.nameJa ? c.nameJa.split('・')[0] : c.name})</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-stone-500 truncate max-w-[200px]">
                Base: {currentCity.hotelName.split(' ')[0]} near {currentCity.station.split(' ')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => syncFromCloud()}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs border border-stone-200"
              title="Force Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
              {travelers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTravelerId(t.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition flex items-center gap-1 ${
                    activeTravelerId === t.id 
                      ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span>{t.avatar}</span>
                  <span className="max-w-[70px] truncate">{t.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowManageTravelers(true)}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs border border-stone-200"
              title="Manage Travelers"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowApiSettingsModal(true)}
              className="p-1.5 rounded-lg border border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs"
              title="Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 DEDICATED CARDS: 1. OVERALL COUNTRY TRIP | 2. CITY LEG | 3. KITTY */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          
          {/* CARD 1: DEDICATED TRIP & COUNTRY MASTER CARD */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/70 border border-indigo-200/90 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-indigo-950 flex items-center gap-1.5 tracking-wide">
                <Plane className="w-3.5 h-3.5 text-indigo-600" />
                Japan Expedition
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900">
                {tripMetrics.totalTripDays} Days Total
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-bold text-indigo-800">
                  {tripMetrics.preTrip ? '⏳ Countdown to Flight:' : (tripMetrics.concluded ? '🎌 Expedition Ended:' : '🗾 Time Left in Japan:')}
                </span>
                <button
                  onClick={() => setShowEditCityModal(cities[0])}
                  className="text-[10px] text-indigo-600 hover:text-indigo-950 underline font-medium"
                >
                  Edit Dates
                </button>
              </div>
              <div className="font-extrabold text-slate-900 text-base font-mono tracking-tight">
                {tripMetrics.preTrip ? tripMetrics.flightCountdown : (tripMetrics.concluded ? 'Tour Concluded' : tripMetrics.daysLeftInCountry)}
              </div>
            </div>

            <div className="text-[10px] text-indigo-700/80 font-medium mt-1 pt-1.5 border-t border-indigo-100 flex justify-between">
              <span>Departs: {tripMetrics.tripStartDateStr}</span>
              <span>Returns: {tripMetrics.tripEndDateStr}</span>
            </div>
          </div>

          {/* CARD 2: DEDICATED CITY LEG & NEXT STOP CARD */}
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-amber-950 flex items-center gap-1.5 tracking-wide">
                <Train className="w-3.5 h-3.5 text-amber-600" />
                Leg: {currentCity.name}
              </span>
              <span className="text-[10px] font-semibold text-amber-800">
                {nextCity ? `Next: ${nextCity.name}` : 'Final Leg'}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-bold text-amber-900">
                  {nextCity ? `Time Till ${nextCity.name}:` : `Departing ${currentCity.name}:`}
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  {cityLegMetrics.pctCity}% spent
                </span>
              </div>
              <div className="font-extrabold text-slate-900 text-base font-mono tracking-tight">
                {cityLegMetrics.legCountdown}
              </div>
            </div>

            <div className="w-full bg-amber-200/70 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className="bg-amber-600 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${cityLegMetrics.pctCity}%` }}
              />
            </div>
          </div>

          {/* CARD 3: COMMON KITTY */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-emerald-950 flex items-center gap-1 tracking-wide">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Common Kitty Pot
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                Equal Split
              </span>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-emerald-950">
                  ¥{kittyStats.remaining.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  ≈ RM {jpyToMyr(kittyStats.remaining)}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-emerald-700 mt-1 pt-1.5 border-t border-emerald-100 flex justify-between">
              <span>{travelers.length} companions</span>
              <span>Spent: ¥{kittyStats.kittySpent.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-4">
        
        {/* TAB 1: PLACES */}
        {activeTab === 'places' && (
          <div className="space-y-4">
            
            {/* LODGING & LEG CONTROL CARD */}
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
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Lodging: <strong className="text-slate-900">{currentCity.hotelName}</strong> ({currentCity.hotelAddress})</span>
                    <button 
                      onClick={() => setShowEditCityModal(currentCity)}
                      className="ml-1 text-[11px] text-amber-700 hover:underline flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Base
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddPlaceModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  + Add Place
                </button>
              </div>

              {/* CITY TABS SWITCHER */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-stone-100 overflow-x-auto">
                <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Switch Leg:</span>
                {cities.map(c => {
                  const isCur = c.id === activeCityId;
                  const cPlaces = places.filter(p => p.cityId === c.id);
                  const cDone = cPlaces.filter(p => p.checkedIn).length;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveCityId(c.id)}
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
                <button
                  onClick={() => setShowNewCityModal(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Leg
                </button>
              </div>

              {/* FILTER & DISTANCE SORT BAR */}
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSortByDistance(prev => !prev)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition ${
                      sortByDistance 
                        ? 'bg-amber-500 text-white border-amber-500' 
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>{sortByDistance ? 'Sorted: Closest First' : 'Sort by Distance'}</span>
                  </button>

                  <span className="text-xs text-stone-400">
                    {completedCount === activeCityPlaces.length && activeCityPlaces.length > 0 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All spots visited!
                      </span>
                    ) : (
                      <span>{activeCityPlaces.length - completedCount} remaining</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* PLACES LIST */}
            <div className="space-y-3">
              {filteredPlaces.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">No places found in {currentCity.name}</h3>
                  <p className="text-xs text-stone-500">Add destinations for this city using the button above.</p>
                </div>
              ) : (
                filteredPlaces.map(place => (
                  <div
                    key={place.id}
                    className={`bg-white rounded-2xl border transition-all p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      place.checkedIn ? 'border-emerald-300 bg-emerald-50/20' : 'border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleCheckIn(place.id)}
                        className="mt-0.5 text-stone-400 hover:text-emerald-600 transition"
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
                          {place.distanceKm > 0 && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 flex items-center gap-0.5">
                              <Navigation className="w-2.5 h-2.5" />
                              {place.distanceKm} km from {currentCity.hotelName.split(' ')[0]}
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
                          <p className="text-[10px] font-bold text-emerald-700 pt-0.5">
                            ✓ Visited by {place.checkedInBy} on {place.unlockedAt}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 w-full sm:w-auto justify-end">
                      <a
                        href={getMapsUrl(place.title, place.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                      <button
                        onClick={async () => {
                          const placeIdToDelete = place.id;
                          setPlaces(prev => prev.filter(p => p.id !== placeIdToDelete));
                          if (supabaseRef.current) {
                            try {
                              const res = await supabaseRef.current.from('trip_places').delete().eq('id', placeIdToDelete);
                              if (res && res.error) {
                                syncFromCloud();
                              }
                            } catch (err) {
                              syncFromCloud();
                            }
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition"
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

        {/* TAB 2: TIMELINE (INDIVIDUAL LEG COUNTDOWNS & MANAGEMENT) */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            
            {/* CURRENT BASE HOTEL */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      Active Base • {currentCity.name}
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
                  Edit Base & Dates
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
                    <span className="text-[10px] text-stone-400 uppercase font-medium">Time Remaining in {currentCity.name}</span>
                    <p className="text-slate-800 font-semibold font-mono">
                      {cityLegMetrics.legCountdown}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ALL CITIES / TRAVEL LEGS WITH LIVE COUNTDOWNS */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">All Travel Legs in Japan</h3>
                  <p className="text-xs text-stone-500">Every city stop has its own countdown and schedule</p>
                </div>
                <button
                  onClick={() => setShowNewCityModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-stone-50 text-xs font-medium hover:bg-slate-800 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Travel Leg
                </button>
              </div>

              <div className="space-y-2.5 pt-1">
                {cities.map((city, idx) => {
                  const isCurrent = city.id === activeCityId;
                  const isOrigin = idx === 0;

                  // Individual timer for this exact city leg
                  const cur = now.getTime();
                  const cStart = new Date(city.startDate).getTime();
                  const cEnd = new Date(city.endDate).getTime();

                  let statusBadge = '';
                  let statusTime = '';

                  if (cur < cStart) {
                    const diff = Math.max(0, cStart - cur);
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    statusBadge = 'Upcoming';
                    statusTime = `Starts in ${d}d ${h}h`;
                  } else if (cur <= cEnd) {
                    const diff = Math.max(0, cEnd - cur);
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    statusBadge = 'Active Now';
                    statusTime = `${d}d ${h}h remaining`;
                  } else {
                    statusBadge = 'Completed';
                    statusTime = 'Leg Finished';
                  }

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
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                statusBadge === 'Active Now' ? 'bg-emerald-100 text-emerald-800' :
                                statusBadge === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-stone-200 text-stone-600'
                              }`}>
                                {statusBadge}: {statusTime}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-stone-50">
                                  Current Base
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
                              onClick={async () => {
                                if (!window.confirm(`Delete ${city.name} leg from itinerary?`)) return;
                                const cityIdToDelete = city.id;
                                setCities(prev => prev.filter(c => c.id !== cityIdToDelete));
                                if (supabaseRef.current) {
                                  try {
                                    await supabaseRef.current.from('trip_cities').delete().eq('id', cityIdToDelete);
                                  } catch {}
                                }
                              }}
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
                          <span className="text-[10px] text-stone-400 block uppercase font-medium">Dates & Schedule</span>
                          <span className="font-medium text-slate-800">
                            {city.startDate.replace('T', ' ')} ➔ {city.endDate.replace('T', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-medium">Hotel & Station</span>
                          <span className="truncate block font-medium text-slate-800">{city.hotelName} ({city.station})</span>
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
                              onClick={() => setActiveCityId(city.id)}
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

        {/* TAB 3: KITTY */}
        {activeTab === 'kitty' && (
          <div className="space-y-4">
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
                    Shared Pool for {travelers.length} Companions
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetKitty}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Pool
                  </button>
                  <button
                    onClick={() => setShowTopUpModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-stone-50 text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Top Up
                  </button>
                </div>
              </div>
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

            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    Analytics
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">Spending Breakdown</h3>
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
                      <span className="text-stone-400 text-[10px] uppercase font-medium block">Top Category</span>
                      <span className="font-bold text-slate-900 text-sm">{kittyStats.topCat.name}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {kittyStats.topCat.pct}% of budget
                  </span>
                </div>
              )}
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

            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Expense Log</h4>
                  <p className="text-xs text-stone-500">Tracked in real time</p>
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
                {expenses.length === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs italic">
                    No expenses logged yet.
                  </div>
                ) : (
                  expenses.map(e => (
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
                          onClick={async () => {
                            const expenseIdToDelete = e.id;
                            setExpenses(prev => prev.filter(x => x.id !== expenseIdToDelete));
                            if (supabaseRef.current) {
                              try {
                                const res = await supabaseRef.current.from('trip_expenses').delete().eq('id', expenseIdToDelete);
                                if (res && res.error) {
                                  syncFromCloud();
                                }
                              } catch (err) {
                                syncFromCloud();
                              }
                            }
                          }}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI CHAT */}
        {activeTab === 'ai' && (
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col h-[75vh] overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Waypoint AI</h3>
                  <p className="text-[10px] text-stone-500">{currentCity.name} Leg Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiSettingsModal(true)}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 border-b border-stone-100 bg-stone-50/30 flex gap-2 overflow-x-auto text-xs">
              <button
                onClick={() => handleAiSend(`Give our travel briefing for ${currentCity.name}. Base: ${currentCity.hotelName}. Check our checklist (${activeCityPlaces.filter(p => !p.checkedIn).map(p => p.title).join(', ')}), give transit and food tips!`)}
                disabled={isAiThinking}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold flex items-center gap-1.5 border border-amber-200/60"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                Daily Briefing
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {aiLog.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-stone-100 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex items-center gap-2 text-stone-400 text-xs p-2">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
                  Thinking...
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
                placeholder="Ask about trains, local food, or schedule..."
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

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 py-2 px-2 shadow-sm">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-[10px]">
          <button
            onClick={() => setActiveTab('places')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'places' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mb-0.5" />
            <span>Places</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'timeline' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('kitty')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'kitty' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <PieChart className="w-4 h-4 mb-0.5" />
            <span>Kitty</span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition ${
              activeTab === 'ai' ? 'text-slate-900 font-bold' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Bot className="w-4 h-4 mb-0.5" />
            <span>AI Chat</span>
          </button>
        </div>
      </nav>

      {/* MODALS */}
      {showAddPlaceModal && (
        <AddPlaceModal
          currentCity={currentCity}
          cities={cities}
          onClose={() => setShowAddPlaceModal(false)}
          onAdd={async (newPlace) => {
            setPlaces(prev => [newPlace, ...prev]);
            setShowAddPlaceModal(false);
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
                  distance_km: newPlace.distanceKm,
                  transit_mins: newPlace.transitMins,
                  notes: newPlace.notes,
                  visited: false
                }]);
              } catch {}
            }
          }}
        />
      )}

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

      {showManageTravelers && (
        <ManageTravelersModal
          travelers={travelers}
          onClose={() => setShowManageTravelers(false)}
          onAddTraveler={async (newT) => {
            setTravelers(prev => [...prev, newT]);
            if (supabaseRef.current) {
              try {
                await supabaseRef.current.from('trip_travelers').insert([{
                  id: newT.id,
                  name: newT.name,
                  avatar: newT.avatar,
                  role: newT.role
                }]);
              } catch {}
            }
          }}
          onDeleteTraveler={async (tId) => {
            setTravelers(prev => prev.filter(t => t.id !== tId));
            if (supabaseRef.current) {
              try {
                await supabaseRef.current.from('trip_travelers').delete().eq('id', tId);
              } catch {}
            }
          }}
        />
      )}

      {(showEditCityModal || showNewCityModal) && (
        <EditCityModal
          city={showEditCityModal}
          isNew={!!showNewCityModal}
          onClose={() => {
            setShowEditCityModal(null);
            setShowNewCityModal(false);
          }}
          onSave={async (saved) => {
            if (showNewCityModal) {
              setCities(prev => [...prev, saved]);
            } else {
              setCities(prev => prev.map(c => c.id === saved.id ? saved : c));
            }
            setShowEditCityModal(null);
            setShowNewCityModal(false);

            if (supabaseRef.current) {
              try {
                await supabaseRef.current.from('trip_cities').upsert({
                  id: saved.id,
                  name: saved.name,
                  name_ja: saved.nameJa,
                  hotel_name: saved.hotelName,
                  hotel_address: saved.hotelAddress,
                  station: saved.station,
                  start_date: saved.startDate,
                  end_date: saved.endDate,
                  transit_to_next: saved.transitToNext
                });
              } catch {}
            }
          }}
        />
      )}

      {showTopUpModal && (
        <TopUpModal
          travelers={travelers}
          onClose={() => setShowTopUpModal(false)}
          onAdd={async (items) => {
            setContributions(prev => [...items, ...prev]);
            setShowTopUpModal(false);

            if (supabaseRef.current) {
              try {
                const cloudRows = items.map(it => ({
                  id: it.id,
                  traveler_id: it.travelerId,
                  amount_jpy: it.amountJPY,
                  date: it.date,
                  note: it.note
                }));
                await supabaseRef.current.from('trip_contributions').insert(cloudRows);
              } catch {}
            }
          }}
        />
      )}

      {showExpenseModal && (
        <AddExpenseModal
          travelers={travelers}
          activeTravelerId={activeTravelerId}
          onClose={() => setShowExpenseModal(false)}
          onAdd={async (exp) => {
            setExpenses(prev => [exp, ...prev]);
            setShowExpenseModal(false);
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
              } catch {}
            }
          }}
        />
      )}
    </div>
  );
}

function AddPlaceModal({ currentCity, cities, onClose, onAdd }) {
  const [cityId, setCityId] = useState(currentCity.id);
  const [title, setTitle] = useState('');
  const [titleJa, setTitleJa] = useState('');
  const [category, setCategory] = useState('Shrines & Temples');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [costJPY, setCostJPY] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      id: 'place-' + Date.now(),
      cityId,
      title: title.trim(),
      titleJa: titleJa.trim() || title.trim(),
      category,
      timeOfDay,
      costJPY: Number(costJPY) || 0,
      distanceKm: Number(distanceKm) || 0,
      checkedIn: false,
      checkedInBy: null,
      unlockedAt: null,
      address: address.trim() || `${currentCity.name}, Japan`,
      notes: notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">+ Add Place to Visit</h3>
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
              placeholder="e.g. Dotonbori Canal"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Japanese Kanji / Kana (Optional)</label>
            <input
              type="text"
              value={titleJa}
              onChange={(e) => setTitleJa(e.target.value)}
              placeholder="e.g. 道頓堀"
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-medium">Est. Cost (¥ JPY)</label>
              <input
                type="number"
                min="0"
                value={costJPY}
                onChange={(e) => setCostJPY(e.target.value)}
                placeholder="e.g. 500"
                className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-medium">Distance from Hotel (km)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g. 1.2"
                className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Address / Station Exit</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Namba Station"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>
          <div>
            <label className="text-[10px] text-stone-500 uppercase font-medium">Notes & Tips</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Takoyaki stalls by the canal..."
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
              Save Place
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApiSettingsModal({ apiKey, model, supabaseUrl, supabaseKey, onClose, onSave }) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(model || 'gemini-2.5-flash');
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
          <h3 className="font-bold text-sm text-slate-900">Settings</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div className="border border-stone-200 rounded-2xl p-3 bg-stone-50/50 space-y-2">
            <span className="text-[10px] font-bold text-slate-900 uppercase block">Gemini AI</span>
            <div>
              <select
                value={tempModel}
                onChange={(e) => setTempModel(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-bold text-slate-900"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Fast)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Detailed)</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">API Key</label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="border border-stone-200 rounded-2xl p-3 bg-stone-50/50 space-y-2">
            <span className="text-[10px] font-bold text-slate-900 uppercase block">Supabase Sync</span>
            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Project URL</label>
              <input
                type="text"
                value={tempSUrl}
                onChange={(e) => setTempSUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-stone-500 uppercase block mb-0.5">Anon Key</label>
              <input
                type="password"
                value={tempSKey}
                onChange={(e) => setTempSKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl font-mono text-[11px]"
              />
            </div>
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageTravelersModal({ travelers, onClose, onAddTraveler, onDeleteTraveler }) {
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🎒');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const item = {
      id: 't-' + Date.now(),
      name: newName.trim(),
      avatar: newAvatar || '🎒',
      role: 'Traveler'
    };
    onAddTraveler(item);
    setNewName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">Manage Travelers</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {travelers.map(t => (
            <div key={t.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
              <span className="text-base px-1">{t.avatar}</span>
              <span className="flex-1 text-xs font-semibold text-slate-900">{t.name}</span>
              {travelers.length > 1 && (
                <button
                  onClick={() => onDeleteTraveler(t.id)}
                  className="p-1.5 text-stone-400 hover:text-rose-600"
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
          />
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name..."
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
      id: city?.id || name.toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      nameJa: nameJa.trim() || name.trim(),
      hotelName: hotelName.trim() || 'Central Hotel',
      hotelAddress: hotelAddress.trim() || 'Station Area, Japan',
      station: station.trim() || 'JR Main Station',
      startDate,
      endDate,
      transitToNext: transitToNext.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900">
            {isNew ? '+ Add New Travel Leg' : `Edit Leg • ${city?.name}`}
          </h3>
          <button onClick={onClose} className="text-stone-400 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">City / Stop Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Osaka"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-medium text-stone-500 uppercase">Japanese Kanji / Kana</label>
            <input
              type="text"
              value={nameJa}
              onChange={(e) => setNameJa(e.target.value)}
              placeholder="e.g. 大阪・道頓堀"
              className="w-full mt-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-slate-900 font-serif"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-stone-500 uppercase">Arrive / Check-in</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-stone-500 uppercase">Depart / Checkout</label>
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
