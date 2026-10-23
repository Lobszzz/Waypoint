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

// ============================================================================
// 2. PROCEDURAL ANIME LANDSCAPE GENERATOR (Pure Scenery, Zero Characters)
// ============================================================================
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
      
      <!-- Distant stone bridge silhouette & warm paper lanterns -->
      <polygon points="110,400 140,340 230,340 260,400" fill="%230F172A" opacity="0.9"/>
      <circle cx="185" cy="360" r="16" fill="%23F59E0B" filter="url(%23glow)"/>
      <circle cx="185" cy="360" r="8" fill="%23FEF08A"/>

      <!-- Whimsical floating mana particles drifting across the water -->
      <circle cx="120" cy="240" r="3.5" fill="%2393C5FD" filter="url(%23glow)"/>
      <circle cx="260" cy="180" r="4.5" fill="%23FDE68A" filter="url(%23glow)"/>
      <circle cx="370" cy="280" r="3" fill="%23F472B6" filter="url(%23glow)"/>
      <circle cx="450" cy="330" r="3.5" fill="%2367E8F9" filter="url(%23glow)"/>
      <circle cx="310" cy="480" r="2.5" fill="%23FBBF24" opacity="0.6"/>
    </svg>`;
  }

  // Daylight Vistas: Cerulean sky, giant cumulus clouds, mossy stone torii ruins
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

    <!-- Monumental anime-style clouds -->
    <circle cx="170" cy="250" r="95" fill="%23FFFFFF" opacity="0.95"/>
    <circle cx="290" cy="210" r="130" fill="%23FFFFFF" opacity="0.98"/>
    <circle cx="410" cy="260" r="105" fill="%23FFFFFF" opacity="0.94"/>
    <circle cx="280" cy="270" r="115" fill="%23F0F9FF" opacity="0.9"/>

    <!-- Rolling mountains in atmospheric haze -->
    <polygon points="0,420 180,310 370,430" fill="%237DD3FC" opacity="0.55"/>
    <polygon points="210,430 410,270 600,440" fill="%2338BDF8" opacity="0.45"/>

    <!-- Rolling lush meadow hill -->
    <path d="M0,410 Q190,340 410,380 T600,350 L600,600 L0,600 Z" fill="url(%23grassyHills)"/>

    <!-- Ancient mossy stone Torii portal (pure landscape architecture) -->
    <rect x="230" y="310" width="18" height="170" fill="%2364748B"/>
    <rect x="360" y="310" width="18" height="170" fill="%23475569"/>
    <polygon points="200,310 395,310 385,295 210,295" fill="%23334155"/>
    <polygon points="215,330 380,330 375,320 220,320" fill="%23475569"/>

    <!-- Forest moss spots -->
    <ellipse cx="239" cy="380" rx="6" ry="16" fill="%23365314"/>
    <ellipse cx="369" cy="420" rx="7" ry="18" fill="%23365314"/>

    <!-- Ethereal flower petals & mana particles -->
    <circle cx="150" cy="390" r="4.5" fill="%2360A5FA" filter="url(%23softManaGlow)"/>
    <circle cx="260" cy="340" r="3.5" fill="%2393C5FD" filter="url(%23softManaGlow)"/>
    <circle cx="340" cy="370" r="5" fill="%23FDE68A" filter="url(%23softManaGlow)"/>
    <circle cx="470" cy="430" r="4" fill="%23F472B6" filter="url(%23softManaGlow)"/>
  </svg>`;
}

// =================================
