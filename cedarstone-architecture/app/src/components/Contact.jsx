import React, { useState } from 'react';
import { Lines, Fade } from './Reveal';

const FIELDS = [
  { id: 'name', label: 'Your name', type: 'text', auto: 'name' },
  { id: 'email', label: 'Email', type: 'email', auto: 'email' },
  { id: 'site', label: 'Where is the site?', type: 'text' }
];

export default function Contact() {
  const [note, setNote] = useState('We reply to every enquiry within two working days.');

  const submit = e => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') || '').trim();
    const email = String(f.get('email') || '').trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setNote('A name and a working email address, please.');
      return;
    }
    const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0ASite: ${f.get('site') || '—'}%0D%0A%0D%0A${f.get('brief') || ''}`;
    setNote('Opening your mail client…');
    window.location.href =
      `mailto:studio@cedarstonearchitecture.co.za?subject=${encodeURIComponent('Enquiry — ' + name)}&body=${body}`;
  };

  return (
    <section id="contact" className="relative z-10 bg-char">
      <div className="mx-auto max-w-[1680px] px-6 py-24 sm:px-10 sm:py-32">
        <Fade className="label mb-10 flex items-center gap-4" y={12}>
          <span className="block h-px w-10 bg-ember" />
          <span>Contact</span>
        </Fade>

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-24">
          <div className="flex flex-col justify-between">
            <Lines as="h2" className="h-display text-[clamp(2.1rem,5vw,5.2rem)]">
              <span className="mask"><span>Let's create</span></span>
              <span className="mask"><span>something</span></span>
              <span className="mask"><span className="text-ash">extraordinary.</span></span>
            </Lines>

            <Fade delay={0.15} className="mt-12">
              <dl className="grid gap-5">
                {[
                  ['Studio', <a key="m" className="hover:text-ember" href="mailto:studio@cedarstonearchitecture.co.za">studio@cedarstonearchitecture.co.za</a>],
                  ['Telephone', <a key="t" className="hover:text-ember" href="tel:+27820613598">+27 82 061 3598</a>],
                  ['Address', '14 Sherborne Road, Parktown, Johannesburg'],
                  ['Hours', 'Monday to Thursday, 08:00 – 17:00']
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line pb-4">
                    <dt className="label w-28 shrink-0">{k}</dt>
                    <dd className="text-[15px] text-bone">{v}</dd>
                  </div>
                ))}
              </dl>
            </Fade>
          </div>

          <Fade delay={0.1}>
            <form onSubmit={submit} noValidate className="grid gap-7 border border-line bg-ink/60 p-7 backdrop-blur-sm sm:p-10">
              {FIELDS.map(f => (
                <label key={f.id} className="group block border-b border-line pb-3 focus-within:border-ember transition-colors duration-500">
                  <span className="label mb-3 block group-focus-within:text-ember">{f.label}</span>
                  <input
                    name={f.id} type={f.type} autoComplete={f.auto}
                    className="w-full bg-transparent text-[15px] text-bone outline-none placeholder:text-dim"
                    placeholder="—"
                  />
                </label>
              ))}
              <label className="group block border-b border-line pb-3 focus-within:border-ember transition-colors duration-500">
                <span className="label mb-3 block group-focus-within:text-ember">The brief, in a sentence</span>
                <textarea
                  name="brief" rows={3}
                  className="w-full resize-none bg-transparent text-[15px] text-bone outline-none placeholder:text-dim"
                  placeholder="—"
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-5 pt-2">
                <button type="submit" className="btn btn-solid">
                  Send enquiry
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden="true">
                    <path d="M0 4h14M11 1l3 3-3 3" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
                <p className="label max-w-[24ch] normal-case tracking-normal text-dim" role="status">{note}</p>
              </div>
            </form>
          </Fade>
        </div>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-4 px-6 py-8 sm:px-10">
          <span className="label">© {new Date().getFullYear()} Cedarstone Architecture Group</span>
          <span className="label">Johannesburg · South Africa</span>
        </div>
      </footer>
    </section>
  );
}
