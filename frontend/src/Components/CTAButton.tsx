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
    "ui-action ui-action--primary rounded-full px-8 py-6 text-base md:text-lg shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 z-10" +
    " mt-8 mx-auto";
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`${base} ${className ?? ""}`}
      >
          {label} {" "}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${className ?? ""}`}
    >
       {label} {" "}
    </button>
  );
};

export default CTAButton;
