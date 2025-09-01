/**
 * Branded CTA pill button used in hero.
 * Uses Huellas palette and accessible focus styles.
 * Ensures solid background even over images via CSS var fallback + z-index.
 */

import type { FC } from "react";

type Props = {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const CTAButton: FC<Props> = ({ label, href, onClick, className }) => {
  const base =
    "inline-flex items-center justify-center rounded-full px-8 py-6 text-base md:text-lg font-semibold shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 z-10" +
    " mt-8 mx-auto"; 
  const colors =
    'bg-[#BCAAA4] hover:bg-[#51344D] text-white hover:!text-white focus-visible:ring-[--huellas-eggplant] ring-1 ring-black/10 dark:ring-white/20'; 
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`${base} ${colors} ${className ?? ""}`}
      >
          {label} {" "}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${colors} ${className ?? ""}`}
    >
       {label} {" "}
    </button>
  );
};

export default CTAButton;
