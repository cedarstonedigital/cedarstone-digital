import React, { useState } from 'react';
import InteriorView, { SPACES } from '../scene/views/InteriorView';
import Panel3D from './Panel3D';
import { Lines, Fade } from './Reveal';

const COPY = {
  living: 'A single room five metres tall, opened on two sides. The fireplace is the only thing that holds still.',
  kitchen: 'Stone island, brass tops, joinery set into the service core so the room stays a room.',
  bedroom: 'Set back from the glazed band, so the bed sits in shadow and the view stays in light.',
  bath: 'A freestanding stone bath against the clerestory — the only window in the house you cannot see into.',
  outdoor: 'The terrace is the largest room. Concrete underfoot, water on one edge, the ridge on the other.'
};

export default function InteriorSpaces() {
  const [i, setI] = useState(0);
  const active = SPACES[i];

  return (
    <section id="interiors" className="relative z-10 bg-ink">
      <div className="mx-auto max-w-[1680px] px-6 py-24 sm:px-10 sm:py-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Fade className="label mb-8 flex items-center gap-4" y={12}>
              <span className="block h-px w-10 bg-ember" />
              <span>Interior spaces</span>
            </Fade>
            <Lines as="h2" className="h-display text-[clamp(2.2rem,4.6vw,4.6rem)]">
              <span className="mask"><span>Where form</span></span>
              <span className="mask"><span>meets function</span></span>
            </Lines>
          </div>
          <Fade delay={0.1} className="max-w-[38ch] text-[15px] leading-relaxed text-ash">
            Move through the interior. Each space is the same model you saw from the ridge —
            the camera simply steps inside.
          </Fade>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-14">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-char lg:aspect-auto lg:h-[68vh]">
            <Panel3D className="absolute inset-0">
                <InteriorView index={i} />
              </Panel3D>
            <div className="pointer-events-none absolute inset-0 z-30 border border-line" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-5">
              <span className="label text-ash">{active.label} · Cliffside Residence</span>
              <span className="label text-ash">{String(i + 1).padStart(2, '0')} / 0{SPACES.length}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <ul className="border-t border-line">
              {SPACES.map((s, k) => (
                <li key={s.key}>
                  <button
                    onMouseEnter={() => setI(k)}
                    onFocus={() => setI(k)}
                    onClick={() => setI(k)}
                    className={`group flex w-full items-baseline gap-5 border-b border-line py-5 text-left
                                transition-colors duration-500 ${i === k ? 'text-bone' : 'text-ash hover:text-bone'}`}
                  >
                    <span className={`label transition-colors duration-500 ${i === k ? 'text-ember' : ''}`}>
                      {String(k + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-xl uppercase tracking-tight sm:text-2xl">{s.label}</span>
                    <span className={`ml-auto block h-px transition-all duration-700 ease-arch
                      ${i === k ? 'w-12 bg-ember' : 'w-5 bg-line2'}`} />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-[38ch] text-[15px] leading-relaxed text-ash">{COPY[active.key]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
