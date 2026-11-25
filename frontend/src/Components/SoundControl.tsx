import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/hooks/hook';
import CareIcon from '../shared/ui/CareIcon';

const storageKey = 'huellas.interfaceSounds';

function readPreference() {
  try { return localStorage.getItem(storageKey) === 'on'; }
  catch { return false; }
}

// Keep a navigation chime alive when the current view unmounts.
let context: AudioContext | null = null;

async function chime() {
  if (!window.AudioContext) return;
  try {
    const audio = context ??= new AudioContext();
    if (audio.state === 'suspended') await audio.resume();
    if (audio.state !== 'running') return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.09);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now);
    oscillator.stop(now + 0.13);
  } catch { /* Audio may be unavailable while the document is inactive. */ }
}

export default function SoundControl() {
  const { translate } = useTranslation();
  const [enabled, setEnabled] = useState(readPreference);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || toggle.current?.contains(event.target)) return;
      if (event.target.closest('.ui-action, .ui-button:not(:disabled), [role="tab"], .care-pet-card, .care-pet-book, .pet-book-nav a')) void chime();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  if (typeof window.AudioContext !== 'function') return null;
  return <button ref={toggle} type="button" className="nav-sound" aria-label={translate('interfaceSounds')} title={translate('interfaceSounds')} aria-pressed={enabled}
    onClick={() => {
      const next = !enabled;
      setEnabled(next);
      try { localStorage.setItem(storageKey, next ? 'on' : 'off'); } catch { /* Keep the current session preference. */ }
      if (next) void chime();
      else if (context) {
        void context.close().catch(() => {});
        context = null;
      }
    }}>
    <CareIcon name={enabled ? 'sound' : 'mute'}/>
  </button>;
}
