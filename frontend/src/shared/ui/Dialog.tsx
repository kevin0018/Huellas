import { useTranslation } from '../../i18n/hooks/hook';
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';

interface DialogProps {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onClose: () => void;
  preventClose?: boolean;
  size?: 'medium' | 'large';
  title: string;
}

export function Dialog({
  children,
  closeLabel,
  description,
  initialFocusRef,
  isOpen,
  onClose,
  preventClose = false,
  size = 'medium',
  title,
}: DialogProps) {
  const { translate } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
      queueMicrotask(() => {
        const firstControl = initialFocusRef?.current
          ?? dialog.querySelector<HTMLElement>('[data-dialog-initial-focus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]):not(.dialog__close)');
        firstControl?.focus();
      });
      return;
    }

    if (!isOpen && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [initialFocusRef, isOpen]);

  useEffect(() => () => {
    returnFocusRef.current?.focus();
  }, []);

  const requestClose = () => {
    if (!preventClose) onClose();
  };

  return (
    <dialog
      aria-busy={preventClose || undefined}
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="dialog"
      data-size={size}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const outsideSurface = event.clientX < bounds.left
          || event.clientX > bounds.right
          || event.clientY < bounds.top
          || event.clientY > bounds.bottom;
        if (outsideSurface) requestClose();
      }}
      ref={dialogRef}
    >
      <div className="dialog__surface">
        <header className="dialog__header">
          <div className="dialog__heading">
            <h2 className="dialog__title" id={titleId}>{title}</h2>
            {description && <p className="dialog__description" id={descriptionId}>{description}</p>}
          </div>
          <button
            aria-label={closeLabel ?? translate('close')}
            className="dialog__close"
            disabled={preventClose}
            onClick={requestClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </header>
        <div className="dialog__body">{children}</div>
      </div>
    </dialog>
  );
}
