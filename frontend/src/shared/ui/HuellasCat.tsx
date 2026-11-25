import { useRef } from 'react';
import { useCatGaze } from './useCatGaze';
import './HuellasCat.css';

export type CatMood = 'idle' | 'hiding' | 'watching';

/** Decorative artwork. Gaze uses element geometry, never input values. */
export default function HuellasCat({ mood = 'idle', followPointer = false, lookAt = null }: { mood?: CatMood; followPointer?: boolean; lookAt?: HTMLElement | null }) {
  const cat = useRef<SVGSVGElement>(null);
  useCatGaze(cat, mood, followPointer, lookAt);
  return (
    <svg className="huellas-cat" data-mood={mood} ref={cat} viewBox="0 0 200 180" fill="none" aria-hidden="true" focusable="false">
      <g stroke="var(--cat-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path className="huellas-cat__tail" d="M132 157c33 3 47-10 42-28-3-12-13-17-11-31" />
        <path className="huellas-cat__tail-fur" d="M132 157c33 3 47-10 42-28-3-12-13-17-11-31" />
        <path d="m166 115 9-4m-5 20 9-2m-9 18 7 4" stroke="var(--cat-stripe)" strokeWidth="5"/>
        <path className="huellas-cat__fur" d="M68 108c-11 12-29 41-20 54 10 14 83 15 100 2 12-9-1-43-18-57Z"/>
        <path fill="var(--cat-cream)" stroke="none" d="M77 111q24 9 47-1c0 28-7 48-23 58-16-5-24-30-24-57Z"/>
        <g className="huellas-cat__head">
          <path className="huellas-cat__fur" d="M46 66c-1-15-3-36-2-50 0-6 4-7 9-3l29 22c13-3 24-3 36 0l32-23c5-4 9-2 9 4l-4 49 8 14-6 1 7 9-8 2c-2 25-27 43-57 43-32 0-55-16-59-40l-8-2 7-10-6-1Z"/>
          <path fill="var(--cat-pink)" stroke="none" d="m51 22 5 34 16-15Zm99 0-23 19 18 14Z"/>
          <path fill="var(--cat-stripe)" stroke="none" d="M81 36q1 12 10 18l-2-20Zm15-3q2 16 8 21l4-21Zm18 2-5 20q9-6 13-17ZM40 78l20 6-21 1Zm0 13 20-1-17 8Zm115-14-17 6 20-1Zm2 13-18 1 15 7Z"/>
          <path fill="var(--cat-cream)" stroke="none" d="M65 95q10-9 22-4 7 4 14-1 6-5 14 0 14-6 23 6 4 18-20 25-13 7-29 0-25-5-24-26Z"/>
          <g className="huellas-cat__gaze" fill="var(--cat-line)" stroke="none">
            {[78, 123].map(x => <g key={x} className="huellas-cat__eye"><ellipse cx={x} cy="81" rx="5.5" ry="8"/><circle cx={x + 1} cy="78" r="1.8" fill="var(--cat-cream)"/></g>)}
          </g>
          <path d="M92 96q8-5 16 0l-7 6Z" fill="var(--cat-line)"/>
          <path d="M101 102v4q-4 7-10 2m10-2q5 7 11 1M57 99l-24-4m25 10-21 4m108-10 23-5m-23 11 20 3" strokeWidth="1.8"/>
          <g fill="var(--cat-stripe)" stroke="none"><circle cx="76" cy="100" r="1.5"/><circle cx="81" cy="104" r="1.5"/><circle cx="127" cy="99" r="1.5"/><circle cx="122" cy="103" r="1.5"/></g>
        </g>
        <path fill="var(--cat-scarf)" d="M66 123q35 16 69-1l-3 10-36 23-26-24Z"/>
        <path d="m76 132 20 16 28-17" fill="none" stroke="var(--cat-cream)" strokeDasharray="2 4" strokeWidth="1.3"/>
        {(['left', 'right'] as const).map(side => {
          const x = side === 'left' ? 60 : 140;
          return <g key={side} className={`huellas-cat__arm huellas-cat__arm--${side}`}>
            <path className="huellas-cat__fur" d={`M${x - 9} 129q-6 14-5 29h27q2-14-3-28`}/>
            <g className={`huellas-cat__paw huellas-cat__paw--${side}`}>
              <path fill="var(--cat-cream)" d={`M${x - 17} 159q1-12 16-12 16-1 18 12 1 10-15 11-21 1-19-11Z`}/>
              <path d={`M${x - 6} 161q-2 3-1 7m8-7q-1 3 0 7`} strokeWidth="1.5"/>
            </g>
          </g>;
        })}
      </g>
    </svg>
  );
}
