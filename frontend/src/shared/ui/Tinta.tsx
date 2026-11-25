import { useId, useRef } from 'react';
import { useMascotGaze } from './useMascotGaze';
import './Tinta.css';

export type MascotMood = 'idle' | 'hiding' | 'watching';

const leftEye = 'M66 84c-6-2-7-10-4-16 3-6 9-9 14-6 5 3 6 12 3 18-3 5-8 7-13 4Z';
const rightEye = 'M104 82c-7-4-8-13-4-21 4-7 12-11 18-7 7 4 8 14 4 22-4 7-12 10-18 6Z';

type TintaProps = {
  mood?: MascotMood;
  followPointer?: boolean;
  lookAt?: HTMLElement | null;
};

/** Tinta carries the family health book. Both arms rotate around their shoulders. */
export default function Tinta({ mood = 'idle', followPointer = false, lookAt = null }: TintaProps) {
  const illustration = useRef<SVGSVGElement>(null);
  const eyeClip = useId();
  useMascotGaze(illustration, mood, followPointer, lookAt);
  return (
    <svg ref={illustration} className="tinta" data-mood={mood} viewBox="14 5 260 260" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={eyeClip}><path d={leftEye}/><path d={rightEye}/></clipPath>
      </defs>
      <ellipse className="tinta__shadow" cx="132" cy="252" rx="73" ry="4.5"/>
      <g stroke="var(--fur-ink)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
        {/* The tapered tail curves back towards the pencil, keeping the silhouette open. */}
        <path fill="var(--fur-sable)" d="M151 188c31 15 61 9 75-10 17-23 8-47-4-66-4-7-2-10 5-6 36 19 48 58 27 91-17 28-56 44-91 31Z"/>
        <path fill="var(--fur-mask)" stroke="none" d="M222 112c-3-6-2-9 5-5 26 14 40 39 36 63-5-11-12-14-16-15l2 8c-4-7-8-12-13-15-2-14-8-26-14-36Z"/>
        <path d="M176 215c34 7 63-12 72-31" stroke="var(--fur-light)" strokeWidth="3"/>
        {/* The lifted back foot and planted front foot give the messenger a walking pose. */}
        <path fill="var(--fur-mask)" d="M148 206c9 0 17-4 24-9l10 12 13-8c6-4 6-13 14-12 8 1 10 8 8 15-4 13-22 28-33 31-8 2-20-5-28-12Z"/>
        <path fill="var(--fur-shadow)" stroke="none" d="M179 221q6 7 20-4c9-7 12-14 18-18 1 13-18 31-32 35-7 2-16-4-22-9Z"/>
        <path fill="var(--fur-sable)" d="M86 108c-7 19-9 39-2 59 7 19 22 30 25 44 2 7-3 16-4 21-13 0-26 2-30 10-3 6 0 10 9 11l34-1c8-1 13-5 14-12l4-14c18 2 37-1 45-13 9-14 2-34-9-48-14-18-21-29-22-48Z"/>
        <path fill="var(--fur-light)" stroke="none" d="M91 115c-7 26-3 44 13 60 12 12 23 18 26 34 10-19 11-37-2-57l-13-29Z"/>
        <path fill="var(--fur-shadow)" stroke="none" d="M151 130c6 20 21 35 27 54 6 20-6 34-24 37l-17 3c21 4 40-1 45-15 5-14-1-30-12-44-11-14-16-23-19-35Z"/>
        <path fill="var(--fur-mask)" d="M104 231q13 5 29-2l-2 13c-1 6-6 9-14 10l-33 1c-11-1-12-9-4-15 6-5 16-7 24-7Z"/>
        <path d="M85 240q-6 4-5 8m13-9q-5 3-5 8" stroke="var(--fur-shadow)" strokeWidth="2"/>

        <g className="tinta__head">
          {/* Rounded ears, a swept crown and the sharp eye mask are the ferret's identifying marks. */}
          <path fill="var(--fur-sable)" d="M63 54c-14-4-20-20-12-30 7-8 21-6 29 8l3 16Z"/>
          <path fill="var(--ear)" stroke="none" d="M58 40c-8-14 2-20 11-10 3 4 4 9 4 13Z"/>
          <path fill="var(--fur-light)" d="M44 79c5-23 25-40 52-45l-8-4q11-6 25-2l-4-8q14-1 24 12c18 4 29 15 36 31 6 14 8 21 17 28l-10 2 7 7c-13 2-20 9-32 16-16 10-33 16-54 12-14-3-24-12-33-17-14-6-25-10-27-21Z"/>
          <path fill="var(--fur-sable)" stroke="none" d="M127 37c18 15 22 28 21 46-2 21-18 34-38 44 14 3 35-8 47-15 10-7 15-11 24-13l-9-7 10-2c-12-12-11-26-22-39q-13-13-33-14Z"/>
          <g transform="rotate(40 160 43)" strokeWidth="1.8">
            <path fill="var(--ribbon)" d="M156 7q4-3 8 0v47l-4 9-4-9Z"/>
            <path fill="var(--seal)" d="M156 11h8v5h-8Zm0 42h8l-4 10Z"/>
            <path d="m159 9 1-1m0 11v29" stroke="var(--ear)" strokeWidth="1.5"/>
          </g>
          <path fill="var(--fur-sable)" d="M139 49c-2-9 1-19 8-24 10-8 24-5 28 6 4 12-5 24-17 29"/>
          <path fill="var(--ear)" stroke="none" d="M146 46c-1-7 2-14 8-16 7-3 14 0 14 6 0 7-6 13-14 15Z"/>
          <path d="M151 43c2-5 5-7 9-7" stroke="var(--fur-shadow)" strokeWidth="2"/>
          <path fill="var(--fur-mask)" stroke="none" d="M43 80c4-10 13-17 24-20 12-3 18 2 28-1 11-4 16-11 30-12 10 0 16 4 23 3-3 8-7 14-5 23 2 12-6 22-18 26-12 4-23-2-32-6-7-4-13-2-19 2-11 6-21 5-32-1Z"/>
          <g fill="var(--fur-cream)" strokeWidth="1.8">
            <g className="tinta__eye">
              <path d={leftEye}/>
            </g>
            <g className="tinta__eye">
              <path d={rightEye}/>
            </g>
          </g>
          <g clipPath={`url(#${eyeClip})`}>
            <g className="tinta__gaze" fill="var(--fur-ink)" stroke="none">
              <g className="tinta__pupils">
                <ellipse cx="70" cy="74" rx="4.8" ry="7.4"/><circle cx="68.8" cy="71.4" r="1.7" fill="var(--fur-cream)"/>
                <ellipse cx="110" cy="69.5" rx="6" ry="8.8"/><circle cx="108.4" cy="66.4" r="2.2" fill="var(--fur-cream)"/>
              </g>
            </g>
          </g>
          <path d="M60 58q5-7 12-7m31-8q8-6 16-4" strokeWidth="3.8"/>
          {/* A projecting muzzle and open, off-centre smile read even at thumbnail size. */}
          <path fill="var(--fur-cream)" stroke="none" d="M37 83c5-7 17-9 28-4 9 5 14 9 25 8 17-1 23-8 34-3 13 7 7 20-8 29-14 9-25 11-41 6-13-5-16-10-26-16-11-6-18-12-12-20Z"/>
          <path fill="var(--fur-ink)" d="M58 94c6 6 17 8 28 6 6-1 10-4 13-7-1 12-12 23-23 21-9-1-17-10-18-20Z"/>
          <path fill="var(--ear)" stroke="none" d="M73 110q8-7 17-7-5 10-14 10Z"/>
          <path fill="var(--fur-cream)" stroke="none" d="m65 98 7 2-3 4Z"/>
          <path d="M56 88q0 5 4 9m34-6q6-1 9 3" strokeWidth="2"/>
          <path fill="var(--fur-ink)" d="M33 80c-1-6 8-9 18-9 6 0 11 2 11 6 0 6-6 13-12 13-8-1-16-5-17-10Z"/>
          <path d="M39 77q5-3 10-2" stroke="var(--nose-glint)" strokeWidth="2.7"/>
          <path d="M37 86c3 10 12 14 22 19" strokeWidth="2.1"/>
          <path d="m119 91 10-3m-9 8 8-1" stroke="var(--ear)" strokeWidth="2.6"/>
        </g>

        {/* Cross-body binding strap and pocket-sized field book. */}
        <path fill="var(--strap)" d="M138 118q6 0 11 5c-8 21-23 38-42 50l-6-8c18-12 29-26 37-47Z"/>
        <path d="M139 129q-12 23-31 36" stroke="var(--fur-cream)" strokeDasharray="2 4" strokeWidth="1.2"/>
        <g transform="rotate(-13 113 184)">
          <path fill="var(--cover-dark)" d="M86 162h53q4 0 4 5v43q0 4-5 4H86q-5 0-5-6v-40q0-6 5-6Z"/>
          <path fill="var(--fur-cream)" d="M85 162h53v45H86q-5 0-4-5v-36Z"/>
          <path fill="var(--ribbon)" strokeWidth="1.6" d="M121 202h8v17l-4-4-4 3Z"/>
          <rect x="79" y="157" width="59" height="47" rx="4" fill="var(--book)"/>
          <path d="M86 159v43" stroke="var(--cover-dark)" strokeWidth="2"/>
          <text className="tinta__signature" x="109" y="198" textAnchor="middle" fill="var(--seal)" stroke="none">TINTA</text>
          <g fill="var(--seal)" stroke="none">
            <path d="M101 184c1-3 3-4 5-7 2-3 5-3 8 0 2 3 6 5 6 8 0 5-6 4-9 3-3-1-8 3-10 0q-1-2 0-4Z"/>
            <ellipse cx="101" cy="177" rx="2" ry="3.2" transform="rotate(-32 101 177)"/><ellipse cx="106" cy="171" rx="2.3" ry="3.2"/>
            <ellipse cx="113" cy="171" rx="2.3" ry="3.2"/><ellipse cx="119" cy="176" rx="2" ry="3.2" transform="rotate(26 119 176)"/>
          </g>
        </g>
        <g className="tinta__arm tinta__arm--left">
          <path fill="var(--fur-sable)" d="M94 127c-8-4-12 1-16 9-5 10-14 11-23 8l-6 12c19 14 40 5 49-12"/>
          <path d="M78 144q6-3 8-8" stroke="var(--fur-light)" strokeWidth="1.8"/>
          <g className="tinta__paw tinta__paw--left">
            <path fill="var(--fur-mask)" d="M61 153c2-5 0-12-5-16 5-4 5-10 2-12-4-2-8 4-11 8-7-2-10-6-17-7-6-1-8 4-4 8l6 5c-7-2-11 1-9 5 1 4 7 6 10 8-3 0-5 3-2 6 4 4 11 4 17 5 6 1 11-3 13-10Z"/>
            <path d="m32 139 9 4m-7 9 7 2" stroke="var(--paw-light)" strokeWidth="1.8"/>
          </g>
        </g>
        <g className="tinta__arm tinta__arm--right">
          <path fill="var(--fur-sable)" d="M146 122c13 1 20 14 23 28 4 17 1 31-8 42l-16-6c7-16 8-30-3-39"/>
          <g className="tinta__paw tinta__paw--right">
            <path fill="var(--fur-mask)" d="M160 177c6 3 8 9 6 16-2 6-5 12-10 15-3 2-6 0-6-3-2 4-7 4-9 1-2 1-5 0-6-3-3-3-1-8 0-12-3 4-7 4-9 1-2-4 4-12 10-16 6-3 9-1 12 1 4-2 8-2 12 0Z"/>
            <path d="m143 198-3 6m12-5-2 6" stroke="var(--paw-light)" strokeWidth="1.8"/>
          </g>
        </g>
      </g>
    </svg>
  );
}
