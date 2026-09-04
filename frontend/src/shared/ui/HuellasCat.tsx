import type { CSSProperties } from 'react';
import './HuellasCat.css';

export type CatMood = 'idle' | 'hiding' | 'watching';

/** Decorative artwork. Only interaction state reaches the cat, never credentials. */
export default function HuellasCat({ mood = 'idle', lookX = 0 }: { mood?: CatMood; lookX?: number }) {
  return (
    <svg className="huellas-cat" data-mood={mood} style={{ '--cat-look-x': `${lookX}px` } as CSSProperties} viewBox="0 0 200 180" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path className="huellas-cat__tail" d="M143 157c48 8 46-40 23-40-17 0-17 20-4 20" />
        <path className="huellas-cat__fur" d="M62 115c-9 12-14 35-12 50h100c2-22-5-39-15-51" />
        <path className="huellas-cat__fur" d="M49 66 42 17c-1-7 4-8 9-4l33 23c11-3 23-3 35 0l31-24c6-4 10-1 9 5l-4 51c9 11 13 23 9 37-5 21-30 31-64 31s-58-11-63-31c-3-14 1-26 12-39Z" />
        <path className="huellas-cat__patch" d="m52 28 6 34 17-17Zm96 0-23 18 18 15Z" stroke="none" />
        <path d="m90 39 3 12m9-14v13m11-10-3 11" />
        <g className="huellas-cat__gaze">
          <g className="huellas-cat__eye"><ellipse cx="77" cy="83" rx="7" ry="10" fill="currentColor" stroke="none" /><circle cx="79" cy="80" r="2" className="huellas-cat__glint" stroke="none" /></g>
          <g className="huellas-cat__eye"><ellipse cx="126" cy="83" rx="7" ry="10" fill="currentColor" stroke="none" /><circle cx="128" cy="80" r="2" className="huellas-cat__glint" stroke="none" /></g>
        </g>
        <path className="huellas-cat__patch" d="m95 99 6 5 6-5Z" />
        <path d="M101 105v5m-12 0q6 9 12 0 6 9 12 0M49 94l-22-5m22 14-23 4m128-13 22-5m-23 14 24 4" strokeWidth="2" />
        <path className="huellas-cat__collar" d="M70 130q30 12 60 0l-2 11q-28 10-56-1Z" />
        <path className="huellas-cat__tag" d="M101 143c-8-8-14 4 0 12 14-8 8-20 0-12Z" strokeWidth="2" />
        <g className="huellas-cat__paw huellas-cat__paw--left">
          <path className="huellas-cat__fur" d="M57 163v-21c0-18 29-18 29 0v21q-14 8-29 0Z" />
          <path d="M67 155v10m9-10v10" strokeWidth="2" />
        </g>
        <g className="huellas-cat__paw huellas-cat__paw--right">
          <path className="huellas-cat__fur" d="M117 163v-21c0-18 29-18 29 0v21q-14 8-29 0Z" />
          <path d="M127 155v10m9-10v10" strokeWidth="2" />
        </g>
      </g>
    </svg>
  );
}
