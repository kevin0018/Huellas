/**
 * Branded CTA pill button used in hero.
 * Uses Huellas palette and accessible focus styles.
 * Ensures solid background even over images via CSS var fallback + z-index.
 */

import type { FC } from 'react';

type Props = {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const CTAButton: FC<Props> = ({ label, href, onClick, className }) => {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm md:text-base font-semibold shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 z-10';
  const colors =
    '!bg-[--huellas-lavender-1] text-white hover:!bg-[--huellas-lavender-2] focus-visible:ring-[--huellas-eggplant] ring-1 ring-black/10 dark:ring-white/20 bg-opacity-100';
  const style = { backgroundColor: 'var(--huellas-lavender-1, #9886AD)' } as const; // fallback color

  if (href) {
    return (
      <a href={href} onClick={onClick} className={`${base} ${colors} ${className ?? ''}`} style={style}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} ${colors} ${className ?? ''}`} style={style}>
      {label}
    </button>
  );
};

export default CTAButton;