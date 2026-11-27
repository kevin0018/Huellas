import { useEffect, type RefObject } from 'react';
import type { MascotMood } from './Tinta';

/** Aim with geometry only. Pointer frames update the SVG, never the form state. */
export function useMascotGaze(ref: RefObject<SVGSVGElement | null>, mood: MascotMood, followPointer: boolean, lookAt: HTMLElement | null) {
  useEffect(() => {
    const mascot = ref.current;
    if (!mascot || typeof window.matchMedia !== 'function') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(any-pointer: fine)');
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    function aim() {
      frame = 0;
      if (!mascot) return;
      const bounds = mascot.getBoundingClientRect();
      let target = mood === 'idle' && followPointer && finePointer.matches && !reducedMotion.matches ? pointer : null;
      if (lookAt && (mood === 'watching' || (mood === 'idle' && !reducedMotion.matches))) {
        const field = lookAt.getBoundingClientRect();
        target = { x: field.left + field.width / 2, y: field.top + field.height / 2 };
      }
      const x = target ? Math.max(-1, Math.min(1, (target.x - bounds.left - bounds.width / 2) / Math.max(1, bounds.width))) : 0;
      const y = target ? Math.max(-1, Math.min(1, (target.y - bounds.top - bounds.height * 0.46) / Math.max(1, bounds.height))) : 0;
      mascot.style.setProperty('--gaze-x', `${x * 7}px`);
      mascot.style.setProperty('--gaze-y', `${y * 6}px`);
      mascot.style.setProperty('--head-x', `${x * 3}px`);
      mascot.style.setProperty('--head-y', `${y * 2}px`);
      mascot.style.setProperty('--head-turn', `${x * 5}deg`);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(aim);
    }
    function move(event: PointerEvent) {
      if (event.pointerType === 'touch' || mood !== 'idle' || !followPointer) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!reducedMotion.matches && finePointer.matches) schedule();
    }
    function rest() { pointer = null; schedule(); }
    function leave(event: PointerEvent) { if (!event.relatedTarget) rest(); }

    aim();
    if (!followPointer && !lookAt) return;
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave, { passive: true });
    window.addEventListener('blur', rest);
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    reducedMotion.addEventListener('change', schedule);
    finePointer.addEventListener('change', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('blur', rest);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      reducedMotion.removeEventListener('change', schedule);
      finePointer.removeEventListener('change', schedule);
    };
  }, [ref, mood, followPointer, lookAt]);
}
