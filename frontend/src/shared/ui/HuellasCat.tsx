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
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path className="huellas-cat__tail" d="M143 157c48 8 46-40 23-40-17 0-17 20-4 20" />
        <path className="huellas-cat__fur" d="M62 115c-9 12-14 35-12 50h100c2-22-5-39-15-51" />
        <g className="huellas-cat__head">
          <path className="huellas-cat__fur" d="M49 66 42 17c-1-7 4-8 9-4l33 23c11-3 23-3 35 0l31-24c6-4 10-1 9 5l-4 51c9 11 13 23 9 37-5 21-30 31-64 31s-58-11-63-31c-3-14 1-26 12-39Z" />
          <path className="huellas-cat__patch" d="m52 28 6 34 17-17Zm96 0-23 18 18 15Z" stroke="none" />
          <path d="m90 39 3 12m9-14v13m11-10-3 11" />
          <g className="huellas-cat__gaze">
            <g className="huellas-cat__eye"><ellipse cx="77" cy="83" rx="7" ry="10" fill="currentColor" stroke="none" /><circle cx="79" cy="80" r="2" className="huellas-cat__glint" stroke="none" /></g>
            <g className="huellas-cat__eye"><ellipse cx="126" cy="83" rx="7" ry="10" fill="currentColor" stroke="none" /><circle cx="128" cy="80" r="2" className="huellas-cat__glint" stroke="none" /></g>
          </g>
          <path className="huellas-cat__patch" d="m95 99 6 5 6-5Z" />
          <path d="M101 105v5m-12 0q6 9 12 0 6 9 12 0M49 94l-22-5m22 14-23 4m128-13 22-5m-23 14 24 4" strokeWidth="2" />
        </g>
        <path className="huellas-cat__collar" d="M70 130q30 12 60 0l-2 11q-28 10-56-1Z" />
        <path className="huellas-cat__tag" d="M101 143c-8-8-14 4 0 12 14-8 8-20 0-12Z" strokeWidth="2" />
        <g className="huellas-cat__arm huellas-cat__arm--left">
          <path className="huellas-cat__fur" d="M53 120c-13 8-17 23-12 38l5 9c7 10 29 6 31-5 3-13-1-29-10-38" />
          <g className="huellas-cat__paw huellas-cat__paw--left">
            <ellipse className="huellas-cat__fur" cx="60" cy="159" rx="18" ry="15" />
            <path d="M50 159v8m10-7v10m10-11v8" strokeWidth="2" />
          </g>
        </g>
        <g className="huellas-cat__arm huellas-cat__arm--right">
          <path className="huellas-cat__fur" d="M147 120c13 8 17 23 12 38l-5 9c-7 10-29 6-31-5-3-13 1-29 10-38" />
          <g className="huellas-cat__paw huellas-cat__paw--right">
            <ellipse className="huellas-cat__fur" cx="140" cy="159" rx="18" ry="15" />
            <path d="M130 159v8m10-7v10m10-11v8" strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  );
}
