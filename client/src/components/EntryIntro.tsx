import { useEffect, useState, type ReactNode } from 'react';
import '../features/auth/auth.css';
import './entry-intro.css';

/** Runs once per fresh app mount; the app keeps loading beneath the overlay. */
export function EntryIntro({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    // Safety net if an animation is cancelled or disabled by browser/user styles.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => setActive(false), reducedMotion ? 400 : 2500);
    return () => window.clearTimeout(timeout);
  }, [active]);

  return (
    <>
      <div className="entry-intro-app" inert={active}>
        {children}
      </div>
      {active && (
        <div
          className="entry-intro"
          aria-label="Welcome to College Adda"
          onAnimationEnd={(event) => {
            // The logo and tagline also emit animation events that bubble here.
            if (event.target === event.currentTarget) setActive(false);
          }}
        >
          <div className="entry-intro__content">
            <div className="entry-intro__brand">
              <p className="auth__logo">
                <span className="logo-top">COLLEGE</span>
                ADDA
              </p>
              <p className="px-sm c-cyan">JECRC · JAIPUR</p>
            </div>
            <p className="px-sm entry-intro__tagline">Your whole campus on one screen.</p>
          </div>
        </div>
      )}
    </>
  );
}
