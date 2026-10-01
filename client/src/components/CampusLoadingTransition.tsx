import type { ReactNode } from 'react';
import '../features/auth/auth.css';
import './campus-loading-transition.css';

export type CampusLoadingPhase = 'hidden' | 'pending' | 'exiting';

export function CampusLoadingTransition({ phase, onExited, children }: {
  phase: CampusLoadingPhase;
  onExited: () => void;
  children: ReactNode;
}) {
  const overlayVisible = phase !== 'hidden';

  return (
    <>
      <div className="campus-loading-app" inert={overlayVisible} aria-busy={overlayVisible}>
        {children}
      </div>
      {overlayVisible && (
        <div
          className={`campus-loading${phase === 'exiting' ? ' campus-loading--leaving' : ''}`}
          onAnimationEnd={(event) => {
            if (phase === 'exiting' && event.target === event.currentTarget && event.animationName === 'campus-loading-leave') onExited();
          }}
        >
          <div className="campus-loading__content">
            <div className="campus-loading__brand" aria-hidden="true">
              <p className="auth__logo campus-loading__logo">
                <span className="logo-top">COLLEGE</span>
                ADDA
              </p>
              <p className="px-sm c-cyan">JECRC · JAIPUR</p>
            </div>
            <p className="px-sm campus-loading__status" role="status" aria-live="polite">
              ENTERING CAMPUS...
            </p>
            <div className="campus-loading__meter" aria-hidden="true">
              {Array.from({ length: 7 }, (_, index) => <span key={index} />)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
