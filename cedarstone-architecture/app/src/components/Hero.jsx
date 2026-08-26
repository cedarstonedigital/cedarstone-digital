import React from 'react';
import { Lines, Fade } from './Reveal';

export default function Hero() {
  return (
    <section id="top" className="relative z-10 flex min-h-[100svh] flex-col justify-end">
      {/* the 3D stage reads through here — only enough scrim to hold the type */}
      <div className="pointer-events-none absolute inset-0 -z-10
        bg-[linear-gradient(180deg,rgba(8,9,10,0.86)_0%,rgba(8,9,10,0.45)_38%,rgba(8,9,10,0.72)_100%)]
        md:bg-[linear-gradient(102deg,rgba(8,9,10,0.92)_0%,rgba(8,9,10,0.62)_32%,rgba(8,9,10,0.06)_62%,rgba(8,9,10,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-64
        bg-[linear-gradient(180deg,transparent,rgba(8,9,10,0.9))]" />

      <div className="mx-auto w-full max-w-[1680px] px-6 pb-16 pt-32 sm:px-10 sm:pb-24">
        <Fade className="label mb-8 flex items-center gap-4" y={14}>
          <span className="block h-px w-10 bg-line2" />
          <span>Architecture that inspires</span>
        </Fade>

        <Lines as="h1" className="h-display text-[clamp(2.9rem,8.4vw,9.5rem)]">
          <span className="mask"><span>Designing</span></span>
          <span className="mask"><span>Spaces.</span></span>
          <span className="mask"><span className="text-ash">Creating</span></span>
          <span className="mask"><span className="text-ash">Experiences.</span></span>
        </Lines>

        <div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <Fade delay={0.15} className="max-w-[46ch] text-[15px] leading-relaxed text-ash">
            Cedarstone is a Johannesburg practice working in residential, commercial and
            heritage architecture. We design in stone, light and restraint — buildings made
            to outlive their photographs.
          </Fade>

          <Fade delay={0.25} className="flex flex-wrap items-center gap-4">
            <a href="#projects" className="btn btn-solid"
              onClick={e => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}>
              View projects
              <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1" />
              </svg>
            </a>
            <a href="#contact" className="btn"
              onClick={e => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Start a project
            </a>
          </Fade>
        </div>

        <Fade delay={0.4} className="mt-14 flex items-center gap-4">
          <span className="label">Scroll to explore</span>
          <span className="relative block h-10 w-px overflow-hidden bg-line2">
            <span className="absolute inset-x-0 top-0 h-4 animate-[cue_2.4s_cubic-bezier(0.16,1,0.3,1)_infinite] bg-ember" />
          </span>
        </Fade>
      </div>

      <style>{`@keyframes cue{0%{transform:translateY(-100%)}60%{transform:translateY(240%)}100%{transform:translateY(240%)}}`}</style>
    </section>
  );
}
