import type { ReactNode } from 'react';

const drawings: Record<'paw' | 'book' | 'calendar' | 'arrow', ReactNode> = {
  paw: <g fill="currentColor" stroke="none"><path d="M5.7 15.2c1.7-2.2 3.3-5.2 6.3-5.2s4.7 3.1 6.3 5.2c2.1 2.8.7 5.7-2.6 5.2-1.8-.3-2.4-.9-3.7-.9s-2 .6-3.7.9c-3.3.5-4.7-2.4-2.6-5.2Z"/><ellipse cx="4.2" cy="10" rx="2.2" ry="3" transform="rotate(-27 4.2 10)"/><ellipse cx="9" cy="5.7" rx="2.3" ry="3.3" transform="rotate(-12 9 5.7)"/><ellipse cx="15" cy="5.7" rx="2.3" ry="3.3" transform="rotate(12 15 5.7)"/><ellipse cx="19.8" cy="10" rx="2.2" ry="3" transform="rotate(27 19.8 10)"/></g>,
  book: <><path d="M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM4 18h15M8 3v15m4-9h4m-2-2v4"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5m10-5v5M3 11h18m-13 5 2 2 5-4"/></>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
};

export default function CareIcon({ name }: { name: keyof typeof drawings }) {
  return <svg className="care-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{drawings[name]}</svg>;
}
