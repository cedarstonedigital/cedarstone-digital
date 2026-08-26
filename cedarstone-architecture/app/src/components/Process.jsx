import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ExplodedView from '../scene/views/ExplodedView';
import Panel3D from './Panel3D';
import { Lines, Fade, REDUCED } from './Reveal';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  ['Concept', 'Site, light, budget and brief measured before a line is drawn.'],
  ['Design', 'One idea, argued properly — massing, section, and the single move.'],
  ['Development', 'Every joint resolved on paper before it is resolved in concrete.'],
  ['Construction', 'Council, engineers, contractors. We stay on site until the last handle.'],
  ['Completion', 'Handover, snagging, and the first evening in the finished room.']
];

export default function Process() {
  const section = useRef(null);
  const [stage, setStage] = useState(0);

  useLayoutEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const rows = el.querySelectorAll('[data-step]');
      rows.forEach((row, i) => {
        ScrollTrigger.create({
          trigger: row,
          start: 'top 68%',
          onEnter: () => setStage(i),
          onEnterBack: () => setStage(i)
        });
        if (!REDUCED) {
          gsap.fromTo(row, { opacity: 0.25, x: -14 }, {
            opacity: 1, x: 0, duration: 0.9, ease: 'expo.out',
            scrollTrigger: { trigger: row, start: 'top 80%', once: true }
          });
        }
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" ref={section} className="relative z-10 bg-char">
      <div className="mx-auto max-w-[1680px] px-6 py-24 sm:px-10 sm:py-32">
        <Fade className="label mb-10 flex items-center gap-4" y={12}>
          <span className="block h-px w-10 bg-ember" />
          <span>Our process</span>
        </Fade>

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
          <div>
            <Lines as="h2" className="h-display text-[clamp(2.2rem,4.6vw,4.6rem)]">
              <span className="mask"><span>From concept</span></span>
              <span className="mask"><span>to reality</span></span>
            </Lines>
            <Fade delay={0.1} className="mt-8 max-w-[40ch] text-[15px] leading-relaxed text-ash">
              Five movements, in the same order on every project — whether it is a garden
              room or forty thousand square metres.
            </Fade>

            <ol className="mt-12 border-t border-line">
              {STEPS.map(([title, body], i) => (
                <li key={title} data-step
                  className={`grid grid-cols-[3rem_minmax(0,1fr)] gap-5 border-b border-line py-6
                              transition-colors duration-500 sm:grid-cols-[4rem_minmax(0,1fr)]
                              ${stage === i ? 'text-bone' : 'text-ash'}`}>
                  <span className={`label pt-1 transition-colors duration-500 ${stage === i ? 'text-ember' : ''}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-display text-lg uppercase tracking-tight sm:text-xl">{title}</h3>
                    <p className="mt-2 max-w-[52ch] text-[14px] leading-relaxed text-ash">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* the model separates level by level as the steps are read */}
          <div className="relative lg:sticky lg:top-24 lg:h-[70vh]">
            <div className="relative h-[52vh] w-full overflow-hidden bg-ink lg:h-full">
              <Panel3D className="absolute inset-0">
                <ExplodedView stage={stage} />
              </Panel3D>
              <div className="pointer-events-none absolute inset-0 z-30 border border-line" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-5">
                <span className="label text-ash">Exploded axonometric</span>
                <span className="label text-ash">{String(stage + 1).padStart(2, '0')} / 05</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
