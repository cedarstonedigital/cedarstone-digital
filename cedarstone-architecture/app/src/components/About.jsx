import React from 'react';
import { Lines, Fade } from './Reveal';

const FACTS = [['Founded', '2009'], ['Projects', '240'], ['Awards', '09'], ['Studio', '14 people']];

export default function About() {
  return (
    <section id="about" className="relative z-10 bg-ink">
      <div className="mx-auto max-w-[1680px] px-6 py-24 sm:px-10 sm:py-32">
        <Fade className="label mb-10 flex items-center gap-4" y={12}>
          <span className="block h-px w-10 bg-ember" />
          <span>About the studio</span>
        </Fade>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-24">
          <Lines as="h2" className="h-display text-[clamp(1.9rem,3.8vw,3.6rem)]">
            <span className="mask"><span>We keep the</span></span>
            <span className="mask"><span>practice small</span></span>
            <span className="mask"><span className="text-ash">enough that the</span></span>
            <span className="mask"><span className="text-ash">person who drew</span></span>
            <span className="mask"><span className="text-ash">your section</span></span>
            <span className="mask"><span className="text-ash">stands on your site.</span></span>
          </Lines>

          <div className="flex flex-col justify-between gap-12">
            <Fade className="max-w-[46ch] space-y-6 text-[15px] leading-relaxed text-ash">
              <p>
                Cedarstone was founded in Parktown in 2009 on a single conviction:
                architecture is not decoration applied to shelter, it is the shelter itself,
                made deliberate.
              </p>
              <p>
                Directors take every commission from first sketch to final snag. There is no
                hand-off, because there is no one to hand off to — fourteen people, one
                drawing board, and a queue we keep honest.
              </p>
            </Fade>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
              {FACTS.map(([k, v], i) => (
                <Fade key={k} delay={i * 0.05} y={16}>
                  <dt className="label mb-3">{k}</dt>
                  <dd className="font-display text-[clamp(1.6rem,2.4vw,2.4rem)] tracking-tightest">{v}</dd>
                </Fade>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
