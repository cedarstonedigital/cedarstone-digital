import React from 'react';
import ProjectView from '../scene/views/ProjectView';
import Panel3D from './Panel3D';
import { Lines, Fade, Uncover } from './Reveal';

const META = [
  ['Location', 'Westcliff, Johannesburg'],
  ['Year', '2024'],
  ['Type', 'Private residence'],
  ['Area', '640 m²']
];

export default function FeaturedProject() {
  return (
    <section id="projects" className="relative z-10 bg-ink">
      <div className="mx-auto max-w-[1680px] px-6 py-24 sm:px-10 sm:py-32">
        <Fade className="label mb-10 flex items-center gap-4" y={12}>
          <span className="block h-px w-10 bg-ember" />
          <span>Featured project</span>
        </Fade>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div className="flex flex-col justify-between">
            <div>
              <Lines as="h2" className="h-display text-[clamp(2.2rem,4.6vw,4.6rem)]">
                <span className="mask"><span>Cliffside</span></span>
                <span className="mask"><span>Residence</span></span>
              </Lines>
              <Fade delay={0.1} className="mt-8 max-w-[42ch] text-[15px] leading-relaxed text-ash">
                A house held on a rock ledge above the ridge. Concrete, glass and stone
                are set against the site rather than on it — the upper volume turns its
                curved face to the west so every room takes the long light.
              </Fade>
            </div>

            <div className="mt-12">
              <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8">
                {META.map(([k, v], i) => (
                  <Fade key={k} delay={0.05 * i} y={16}>
                    <dt className="label mb-2">{k}</dt>
                    <dd className="font-display text-[15px] tracking-tight text-bone">{v}</dd>
                  </Fade>
                ))}
              </dl>
              <Fade delay={0.2} className="mt-10">
                <a href="#experience" className="btn"
                  onClick={e => { e.preventDefault(); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  Explore the model
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                    <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </a>
              </Fade>
            </div>
          </div>

          {/* live cutaway — the roof lifted off the model in the hero */}
          <Uncover className="relative">
            <div data-drift className="relative aspect-[4/3] w-full overflow-hidden bg-char">
              <Panel3D className="absolute inset-0">
                <ProjectView />
              </Panel3D>
              <div className="pointer-events-none absolute inset-0 z-30 border border-line" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex items-end justify-between p-5">
                <span className="label text-ash">Cutaway · Level 00 – 01</span>
                <span className="label text-ash">01 / 05</span>
              </div>
            </div>
          </Uncover>
        </div>
      </div>
    </section>
  );
}
