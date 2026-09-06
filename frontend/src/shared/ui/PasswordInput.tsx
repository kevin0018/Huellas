import { createContext, useContext, useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useTranslation } from '../../i18n/hooks/hook';
import HuellasCat, { type CatMood } from './HuellasCat';
import './PasswordInput.css';

const CompanionContext = createContext<((mood: CatMood, input: HTMLInputElement | null) => void) | null>(null);

/** One companion can respond to several independent password fields. */
export function PasswordCompanion({ children }: { children: ReactNode }) {
  const [pose, setPose] = useState<{ mood: CatMood; lookAt: HTMLInputElement | null }>({ mood: 'idle', lookAt: null });

  function reactToInput(mood: CatMood, input: HTMLInputElement | null) {
    setPose({ mood, lookAt: mood === 'watching' ? input : null });
  }

  return (
    <CompanionContext.Provider value={reactToInput}>
      <div className="password-companion"><HuellasCat {...pose} followPointer /></div>
      {children}
    </CompanionContext.Provider>
  );
}

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> & {
  id: string;
  /** Disambiguates controls when a form has several passwords. */
  toggleLabel?: string;
};

export default function PasswordInput({ id, toggleLabel, className = '', disabled, onFocus, onChange, ...props }: PasswordInputProps) {
  const { translate } = useTranslation();
  const [visible, setVisible] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const selection = useRef<{ start: number; end: number; direction: 'forward' | 'backward' | 'none' } | null>(null);
  const reactToInput = useContext(CompanionContext);
  const action = translate(visible ? 'hidePassword' : 'showPassword');

  // Restore after React finishes reconciling the controlled input for this event.
  useLayoutEffect(() => {
    if (selection.current) {
      const { start, end, direction } = selection.current;
      const field = input.current;
      queueMicrotask(() => {
        if (field && input.current === field) {
          // Initialize the new native editor before restoring its selection.
          field.getBoundingClientRect();
          field.setSelectionRange(start, end, direction);
        }
      });
      selection.current = null;
    }
  }, [visible]);

  function toggleVisibility() {
    const field = input.current;
    if (field && field.selectionStart !== null && field.selectionEnd !== null) {
      selection.current = { start: field.selectionStart, end: field.selectionEnd, direction: field.selectionDirection ?? 'none' };
    }
    setVisible(!visible);
    reactToInput?.(visible ? 'hiding' : 'watching', field);
  }

  return (
    <div className="password-input" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget) && !visible) reactToInput?.('idle', input.current);
    }}>
      <input {...props} id={id} ref={input} type={visible ? 'text' : 'password'} disabled={disabled} className={`${className} password-input__control`}
        onFocus={event => { reactToInput?.(visible ? 'watching' : 'hiding', input.current); onFocus?.(event); }}
        onChange={event => { reactToInput?.(visible ? 'watching' : 'hiding', input.current); onChange?.(event); }}
      />
      <button className="password-input__toggle" type="button" disabled={disabled} aria-label={toggleLabel ? `${action}: ${toggleLabel}` : action} aria-controls={id} aria-pressed={visible}
        onPointerDown={event => event.preventDefault()}
        onFocus={() => reactToInput?.(visible ? 'watching' : 'hiding', input.current)}
        onClick={toggleVisibility}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
          {visible && <path d="m3 3 18 18" />}
        </svg>
      </button>
    </div>
  );
}
