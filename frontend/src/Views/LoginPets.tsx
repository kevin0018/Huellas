import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { MascotMood } from '../shared/ui/Tinta';
import { PasswordCompanion } from '../shared/ui/PasswordInput';
import { animateLoginPets } from './animateLoginPets';
import './LoginPets.css';

export type PetPose = MascotMood | 'attentive';

function LoginPets({ pose }: { pose: PetPose }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const currentPose = useRef(pose);
  const redraw = useRef<() => void>(() => {});

  useEffect(() => {
    currentPose.current = pose;
    redraw.current();
  }, [pose]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const animation = animateLoginPets(element, () => currentPose.current);
    if (!animation) return;
    redraw.current = animation.draw;
    return animation.stop;
  }, []);

  return <canvas className="login-pets" width="1080" height="696" aria-hidden="true" data-pose={pose} ref={canvas} />;
}

export default function AuthPetPanel({ title, children }: { title: ReactNode; children: ReactNode }) {
  const [attentive, setAttentive] = useState(false);

  return (
    <div className="form-surface auth-pet-panel">
      <header className="form-page__header auth-pet-panel__header">{title}</header>
      <PasswordCompanion renderCompanion={({ mood }) => <LoginPets pose={attentive ? 'attentive' : mood} />}>
        <div
          className="auth-pet-panel__fields"
          onFocusCapture={event => setAttentive(event.target.matches('input[type="email"], input[autocomplete="given-name"], input[autocomplete="family-name"], textarea'))}
          onBlurCapture={() => setAttentive(false)}
        >
          {children}
        </div>
      </PasswordCompanion>
    </div>
  );
}
