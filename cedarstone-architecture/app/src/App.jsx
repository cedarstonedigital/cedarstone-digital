import React, { useEffect, useRef, useState } from 'react';
import HeroCanvas from './scene/HeroCanvas';
import Navbar from './components/Navbar';
import ScrollRail from './components/ScrollRail';
import Hero from './components/Hero';
import FeaturedProject from './components/FeaturedProject';
import Process from './components/Process';
import Showcase from './components/Showcase';
import InteriorSpaces from './components/InteriorSpaces';
import Sustainability from './components/Sustainability';
import About from './components/About';
import Contact from './components/Contact';
import { startScrollWatch } from './lib/scroll';

const RAIL = [
  { id: 'top', label: 'Intro' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Process' },
  { id: 'showcase', label: 'Model' },
  { id: 'interiors', label: 'Interiors' },
  { id: 'sustainable', label: 'Systems' },
  { id: 'about', label: 'Studio' },
  { id: 'contact', label: 'Contact' }
];

function pickQuality() {
  if (typeof window === 'undefined') return 'high';
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 900;
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  return coarse || small || cores <= 4 || mem <= 4 ? 'low' : 'high';
}

export default function App() {
  const root = useRef(null);
  const [quality, setQuality] = useState('high');

  useEffect(() => {
    setQuality(pickQuality());
    const stop = startScrollWatch();
    return stop;
  }, []);

  return (
    <div ref={root} className="relative">
      {/* the stage every section is composed over */}
      <HeroCanvas quality={quality} onDegrade={() => setQuality('low')} />

      <div className="grain" aria-hidden="true" />

      <Navbar />
      <ScrollRail items={RAIL} />

      <main className="relative z-10">
        <Hero />
        <FeaturedProject />
        <Process />
        <Showcase />
        <InteriorSpaces />
        <Sustainability />
        <About />
        <Contact />
      </main>


    </div>
  );
}
