import React from 'react';
import { Fade, Lines } from './Reveal';

/**
 * 04 — the architectural showcase. Deliberately almost empty: the fixed 3D
 * stage behind the page is the content here, and the camera rig is mid-move
 * through the building. Only a caption rail sits on top.
 */
export default function Showcase() {
  return (
    <section id="showcase" className="relative z-10 min-h-[180svh]">
      <div className="pointer-events-none absolute inset-0 -z-10
        bg-[linear-gradient(180deg,rgba(8,9,10,0.96),rgba(8,9,10,0.30)_22%,rgba(8,9,10,0.20)_70%,rgba(8,9,10,0.96))]" />

      <div className="sticky top-0 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-[1680px] px-6 sm:px-10">
          <div className="max-w-[52ch]">
            <Fade className="label mb-8 flex items-center gap-4" y={12}>
              <span className="block h-px w-10 bg-ember" />
              <span>The model</span>
            </Fade>
            <Lines as="h2" className="h-display text-[clamp(2rem,4.4vw,4.2rem)]">
              <span className="mask"><span>Walk the</span></span>
              <span className="mask"><span>building before</span></span>
              <span className="mask"><span className="text-ash">it is built.</span></span>
            </Lines>
            <Fade delay={0.15} className="mt-8 text-[15px] leading-relaxed text-ash">
              Every Cedarstone project is modelled and lit before a slab is poured.
              Clients walk the section, stand in the doorway and watch the light move
              through a full day — months before the site is cleared.
            </Fade>
          </div>

          <div className="mt-16 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
            {[['Model', 'Real-time'], ['Lighting', 'Physically based'], ['Detail', 'LOD 300'], ['Review', 'VR + web']]
              .map(([k, v], i) => (
                <Fade key={k} delay={i * 0.05} y={16}>
                  <div className="label mb-2">{k}</div>
                  <div className="font-display text-[15px] tracking-tight">{v}</div>
                </Fade>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
