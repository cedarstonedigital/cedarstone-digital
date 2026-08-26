import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Headline lines rising out of a mask, staggered. Each child is one line. */
export function Lines({ children, delay = 0, className = '', as: Tag = 'h2' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lines = el.querySelectorAll('.mask > *');
    if (REDUCED) { gsap.set(lines, { y: 0, opacity: 1 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(lines,
        { yPercent: 118, opacity: 0 },
        {
          yPercent: 0, opacity: 1, duration: 1.15, ease: 'expo.out',
          stagger: 0.08, delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
    }, el);
    return () => ctx.revert();
  }, [delay]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}

/** Everything else: a short rise with a long ease. */
export function Fade({ children, delay = 0, y = 26, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (REDUCED) { gsap.set(el, { opacity: 1, y: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y },
        {
          opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
    }, el);
    return () => ctx.revert();
  }, [delay, y]);
  return <Tag ref={ref} className={className} style={{ opacity: REDUCED ? 1 : 0 }}>{children}</Tag>;
}

/** A panel uncovered by a wipe, with the content drifting the other way. */
export function Uncover({ children, className = '' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || REDUCED) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        });
      gsap.fromTo(el.querySelector('[data-drift]'),
        { scale: 1.14 }, {
        scale: 1, duration: 1.8, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

/** Parallax on the y axis, tied to the element's own travel through the viewport. */
export function Parallax({ children, amount = 60, className = '' }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || REDUCED) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { y: amount }, {
        y: -amount, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    }, el);
    return () => ctx.revert();
  }, [amount]);
  return <div ref={ref} className={className}>{children}</div>;
}

export { REDUCED };
