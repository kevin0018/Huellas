import { useTranslation } from '../i18n/hooks/hook';
import Tinta from '../shared/ui/Tinta';
import CareIcon from '../shared/ui/CareIcon';

/** A cloth-bound record and its companion share the same coordinate system at every size. */
export default function BookCoverArt() {
  const { translate } = useTranslation();
  return <div className="book-art" aria-hidden="true">
    <svg viewBox="0 0 460 330" fill="none" focusable="false">
      <ellipse cx="253" cy="178" rx="161" ry="135" fill="var(--art-halo)"/>
      <ellipse cx="231" cy="295" rx="174" ry="12" fill="var(--art-shadow)"/>
      <g strokeLinecap="round" strokeLinejoin="round">
        <g transform="rotate(-10 195 157)">
          <rect x="96" y="39" width="188" height="242" rx="11" fill="var(--art-book-dark)" stroke="var(--art-ink)" strokeWidth="2.5"/>
          <rect x="94" y="35" width="185" height="242" rx="9" fill="var(--art-paper)" stroke="var(--art-ink)" strokeWidth="2"/>
          <path d="M102 270h166m-169 3h164" stroke="var(--art-gold)"/>
          <path d="M248 266v26l-7-6-7 6v-26" fill="var(--art-ribbon)" stroke="var(--art-ink)" strokeWidth="1.5"/>
          <path d="M272 68h12q5 0 5 5v26h-17" fill="var(--art-apricot)" stroke="var(--art-ink)" strokeWidth="1.7"/>
          <path d="M272 106h12q5 0 5 5v26h-17" fill="var(--art-tab)" stroke="var(--art-ink)" strokeWidth="1.7"/>
          <rect x="90" y="30" width="185" height="238" rx="9" fill="var(--art-book)" stroke="var(--art-ink)" strokeWidth="2.5"/>
          <path d="M106 31v235" stroke="var(--art-book-dark)" strokeWidth="4"/>
          <rect x="116" y="42" width="148" height="213" rx="4" stroke="var(--art-gold)" strokeWidth="1.2" strokeDasharray="3 3"/>
          <g fill="var(--art-gold)" textAnchor="middle">
            <text x="190" y="92" className="book-art__wordmark">Huellas</text>
            <text x="190" y="211" className="book-art__caption">{translate('healthBookTitle')}</text>
          </g>
          <g stroke="var(--art-gold)">
            <path d="M183 106h14m-18 117h22"/>
            <ellipse cx="190" cy="152" rx="32" ry="35"/>
            <ellipse cx="190" cy="152" rx="28" ry="31" strokeDasharray="1 4"/>
          </g>
          <svg x="170" y="132" width="40" height="40" viewBox="0 0 24 24" color="var(--art-gold)"><CareIcon name="paw"/></svg>
        </g>
        <g stroke="var(--art-leaf)" strokeWidth="2.4" fill="var(--art-leaf)">
          <path d="M84 281q-17-14-31-55m23 47q-17-5-24-18" fill="none"/>
          <path d="M62 248q-15-3-21-21 16 2 21 21Zm4 8q-2-19 7-27 6 16-7 27Zm-14-26q-14-8-15-24 14 6 15 24Zm22 40q-20 1-29-11 18-2 29 11Z"/>
        </g>
        <g stroke="var(--art-star)" strokeWidth="2" fill="var(--art-gold)">
          <path d="m56 62 3 10 10 3-10 3-3 10-3-10-10-3 10-3Zm291-17 2 6 7 2-7 2-2 7-2-7-6-2 6-2Z"/>
          <path d="m393 100 4-7m2 14 9-1M43 148l-6-3" fill="none"/>
        </g>
      </g>
    </svg>
    <div className="book-art__mascot"><Tinta followPointer /></div>
  </div>;
}
