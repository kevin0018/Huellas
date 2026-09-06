import { useTranslation } from '../i18n/hooks/hook';
import { useCallback, useEffect, useMemo } from "react";
import {type To, useLocation, useNavigate } from "react-router-dom";

/**
 * GoBackButton — botón reutilizable "Atrás" para todas las vistas
 *
 * Características:
 * - navega a la página anterior si existe historial; si no, usa `fallback` (por defecto "/").
 * - opción para ocultar el botón cuando NO hay historial (hideIfNoHistory).
 * - admite atajo de teclado opcional Alt + ArrowLeft (enableHotkey).
 * - personalizable por `variant` y `className`.
*/

export type GoBackButtonProps = {
  /** Ruta alternativa si no existe historial de navegación (por defecto "/"). */
  fallback?: To;
  /** Texto del botón; por defecto "Atrás". */
  label?: string;
  /** Oculta el botón si no hay historial (por ejemplo, en la Home). */
  hideIfNoHistory?: boolean;
  /** Añade un atajo de teclado Alt+Flecha Izquierda para volver atrás. */
  enableHotkey?: boolean;
  /** Apariencia del botón. */
  variant?: "solid" | "ghost" | "outline";
  /** Clases extra para ajustar el estilo/posición. */
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useCanGoBack() {
  // Si idx > 0, podemos volver atrás con seguridad.
  // Fallback: si no existe state, miramos `history.length` (no fiable al 100%, pero útil).
  const canViaIdx = typeof window !== "undefined" && (window.history.state?.idx ?? 0) > 0;
  const canViaLength = typeof window !== "undefined" && window.history.length > 1;
  return canViaIdx || canViaLength;
}

export default function GoBackButton({
  fallback = "/",
  label,
  hideIfNoHistory = false,
  enableHotkey = true,
  variant = "ghost",
  className,
}: GoBackButtonProps) {
  const { translate } = useTranslation();
  const buttonLabel = label ?? translate('back');
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = useCanGoBack();

  const handleClick = useCallback(() => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [canGoBack, navigate, fallback]);

  // Atajo Alt + Flecha izquierda
  useEffect(() => {
    if (!enableHotkey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableHotkey, handleClick]);

  const baseStyles = "ui-action inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = useMemo(() => {
    switch (variant) {
      case "solid":
        return "ui-action--primary";
      case "outline":
        return "ui-action--secondary";
      case "ghost":
      default:
        return "ui-hover-surface text-[var(--color-ink)]";
    }
  }, [variant]);

  if (hideIfNoHistory && !canGoBack) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        canGoBack
          ? translate('backFromPage', { path: location.pathname })
          : translate('goToPage', { path: typeof fallback === 'string' ? fallback : translate('previousPage') })
      }
      title={buttonLabel}
      className={cx(baseStyles, variantStyles, className)}
    >
      <ArrowLeftIcon className="size-6" />
      <span>{buttonLabel}</span>
    </button>
  );
}

/**
 * Icono minimalista para evitar dependencias.
 */
export function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx("shrink-0", className)}
      aria-hidden="true"
    >
      <path d="M12 19l-7-7 7-7" />
      <path d="M19 12H6" />
    </svg>
  );
}
