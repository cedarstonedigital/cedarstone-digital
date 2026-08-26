import React from 'react';
import EcoView from '../scene/views/EcoView';
import Panel3D from './Panel3D';
import { Lines, Fade, Uncover } from './Reveal';

const SYSTEMS = [
  ['Solar array', '18.4 kWp on the north roof — the house runs itself for nine months of the year.'],
  ['Natural ventilation', 'Cross-ventilated through the core; the stack pulls hot air out at the ridge.'],
  ['Materials', 'Local stone, low-carbon cement replacement, FSC oak, no applied finishes.'],
  ['Green roof', 'Indigenous planting over the bedroom wing — insulation, and a roof worth looking at.'],
  ['Water', 'Rainwater harvested off 380 m² of roof into a 40 000-litre tank under the terrace.']
];

export default function Sustainability() {
  return (
    <section id="sustainable" className="relative z-10 bg-char">
      <div className="mx-auto max-w-[1680px] px-6 py-24 sm:px-10 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <Uncover className="order-2 lg:order-1">
            <div data-drift className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
              <Panel3D className="absolute inset-0">
                <EcoView />
              </Panel3D>
              <div className="pointer-events-none absolute inset-0 z-30 border border-line" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-5">
                <span className="label text-ash">Systems axonometric</span>
                <span className="label text-ash">Net · 0.18 kgCO₂e/m²·yr</span>
              </div>
            </div>
          </Uncover>

          <div className="order-1 lg:order-2">
            <Fade className="label mb-8 flex items-center gap-4" y={12}>
              <span className="block h-px w-10 bg-ember" />
              <span>Sustainable design</span>
            </Fade>
            <Lines as="h2" className="h-display text-[clamp(2.2rem,4.6vw,4.6rem)]">
              <span className="mask"><span>Built for</span></span>
              <span className="mask"><span>a better</span></span>
              <span className="mask"><span className="text-ash">tomorrow</span></span>
            </Lines>
            <Fade delay={0.1} className="mt-8 max-w-[42ch] text-[15px] leading-relaxed text-ash">
              Sustainability is a set of decisions taken in the first two weeks, not a
              specification added at the end. Orientation, mass, shade and section do most
              of the work before a single system is switched on.
            </Fade>

            <ul className="mt-12 border-t border-line">
              {SYSTEMS.map(([title, body], i) => (
                <Fade as="li" key={title} delay={i * 0.05} y={18}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-5 border-b border-line py-5 sm:grid-cols-[4rem_minmax(0,1fr)]">
                  <span className="label pt-1 text-ember">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-display text-base uppercase tracking-tight">{title}</h3>
                    <p className="mt-1.5 max-w-[46ch] text-[14px] leading-relaxed text-ash">{body}</p>
                  </div>
                </Fade>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
