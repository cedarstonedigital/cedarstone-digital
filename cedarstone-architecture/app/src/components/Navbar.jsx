import React, { useEffect, useState } from 'react';

const LINKS = [
  ['Studio', 'studio'],
  ['Projects', 'projects'],
  ['Experience', 'experience'],
  ['About', 'about'],
  ['Contact', 'contact']
];

export default function Navbar() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (e, id) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-700 ease-arch
        ${stuck ? 'bg-ink/80 backdrop-blur-xl border-b border-line py-4' : 'py-7 border-b border-transparent'}`}
    >
      <div className="mx-auto flex max-w-[1680px] items-center px-6 sm:px-10">
        <a href="#top" onClick={e => go(e, 'top')} className="group flex items-baseline gap-3">
          <span className="font-display text-[15px] font-600 uppercase tracking-[0.28em]">Cedarstone</span>
          <span className="hidden sm:inline label text-dim">Architecture Group</span>
        </a>

        <nav className="ml-auto hidden items-center gap-10 md:flex" aria-label="Primary">
          {LINKS.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={e => go(e, id)}
              className="label group relative py-1 text-ash transition-colors duration-500 hover:text-bone">
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-ember
                               transition-transform duration-500 ease-arch group-hover:origin-left group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <button
          className="ml-auto flex items-center gap-3 md:hidden"
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          <span className="label text-bone">{open ? 'Close' : 'Menu'}</span>
          <span className="flex h-3 w-5 flex-col justify-between">
            <span className={`h-px w-full bg-bone transition-transform duration-500 ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
            <span className={`h-px w-full bg-bone transition-opacity duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`h-px w-full bg-bone transition-transform duration-500 ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>

      <div className={`overflow-hidden border-t border-line bg-ink/95 backdrop-blur-xl transition-[max-height,opacity]
                       duration-700 ease-arch md:hidden ${open ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col gap-1 px-6 py-6">
          {LINKS.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={e => go(e, id)}
              className="font-display text-2xl uppercase tracking-tightest py-2">{label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
