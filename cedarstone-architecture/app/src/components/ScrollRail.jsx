import React, { useEffect, useState } from 'react';

/** The chapter rail on the right of the hero — 01 INTRO / 02 PROJECTS / … */
export default function ScrollRail({ items }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      let i = 0;
      items.forEach((it, k) => {
        const el = document.getElementById(it.id);
        if (el && window.scrollY >= el.offsetTop - window.innerHeight * 0.4) i = k;
      });
      setActive(i);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  return (
    <div className="pointer-events-none fixed right-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-8 2xl:flex">
      {items.map((it, i) => (
        <button
          key={it.id}
          onClick={() => document.getElementById(it.id)?.scrollIntoView({ behavior: 'smooth' })}
          className="pointer-events-auto flex items-center gap-4 text-right"
        >
          <span className={`label transition-colors duration-500 ${i === active ? 'text-bone' : 'text-dim'}`}>
            <span className="block">{String(i + 1).padStart(2, '0')}</span>
            <span className="block text-[9px]">{it.label}</span>
          </span>
          <span className={`block h-px transition-all duration-700 ease-arch
            ${i === active ? 'w-9 bg-ember' : 'w-4 bg-line2'}`} />
        </button>
      ))}
    </div>
  );
}
