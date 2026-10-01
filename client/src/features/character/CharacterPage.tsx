import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { HAIR_STYLES, SHIRT_COLORS, characterShirt, type HairStyle, type PublicUser, type ShirtColor } from '@adda/shared';
import { PageHead, Panel } from '../../components/ui';
import { api } from '../../lib/api';
import { keys, queryClient } from '../../lib/queryClient';
import { drawAvatar } from '../campus/render';
import './character.css';

export function PixelAvatar({ color, hairStyle }: { color: string; hairStyle: HairStyle }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 24, 24);
    drawAvatar(ctx, 12, 20, color, 'down', false, 0, { hairStyle });
  }, [color, hairStyle]);
  return <canvas ref={ref} width={24} height={24} className="character__avatar" role="img" aria-label={`Character preview, ${hairStyle === 'hair01' ? 'Hair 01' : 'Hair 02'}`} />;
}

export function CharacterPage({ user, onLogout }: { user: PublicUser; onLogout: () => void }) {
  return (
    <div className="character">
      <PageHead title="CREATE YOUR CHARACTER" sub="Pick your hair and T-shirt. Make yourself at home on campus.">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onLogout}>QUIT</button>
      </PageHead>
      <CharacterEditor key={user.id} user={user} onboarding />
    </div>
  );
}

export function CharacterEditor({ user, onboarding = false }: { user: PublicUser; onboarding?: boolean }) {
  const [shirtColor, setShirtColor] = useState<ShirtColor | null>(user.shirtColor ?? null);
  const [hairStyle, setHairStyle] = useState<HairStyle>(user.hairStyle ?? 'hair01');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const color = characterShirt({ color: user.color, shirtColor });

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      const next = await api.auth.updateCharacter({ shirtColor, hairStyle });
      // Set destination before completing the guard, so setup never flashes a dashboard.
      if (onboarding) navigate('/', { replace: true });
      queryClient.setQueryData<PublicUser>(keys.me, (current) => current ? {
        ...current,
        shirtColor: next.shirtColor,
        hairStyle: next.hairStyle,
        characterSetupComplete: next.characterSetupComplete,
      } : next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your character. Try again.');
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <Panel title={onboarding ? 'PLAYER PREVIEW' : 'CHARACTER'} tone="cyan">
      <form className={`character__editor${onboarding ? '' : ' character__editor--embedded'}`} onSubmit={save} aria-busy={busy}>
        <div className="character__preview">
          <p className="px-xs c-yellow">YOU</p>
          <PixelAvatar color={color} hairStyle={hairStyle} />
          <p className="upper">{user.name}</p>
          <p className="muted">{hairStyle === 'hair01' ? 'HAIR 01' : 'HAIR 02'} · {shirtColor?.toUpperCase() ?? 'ORIGINAL'} SHIRT</p>
        </div>
        <div className="stack">
          <fieldset className="character__choices" disabled={busy}>
            <legend className="field__label">HAIR</legend>
            <div className="character__options">
              {HAIR_STYLES.map((hair, index) => (
                <button key={hair} type="button" className="btn btn--ghost" aria-pressed={hairStyle === hair}
                  onClick={() => { setHairStyle(hair); setSaved(false); }}>
                  {hairStyle === hair && <span aria-hidden="true">▶</span>} HAIR 0{index + 1}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="character__choices" disabled={busy}>
            <legend className="field__label">T-SHIRT</legend>
            <div className="character__options">
              {(Object.keys(SHIRT_COLORS) as ShirtColor[]).map((shirt) => (
                <button key={shirt} type="button" className="btn btn--ghost btn--sm" aria-label={`${shirt} shirt`} aria-pressed={shirtColor === shirt}
                  onClick={() => { setShirtColor(shirt); setSaved(false); }}>
                  <span className="character__swatch" style={{ background: SHIRT_COLORS[shirt] }} aria-hidden="true" />
                  {shirtColor === shirt && <span aria-hidden="true">▶</span>}{shirt}
                </button>
              ))}
              {user.shirtColor == null && (
                <button type="button" className="btn btn--ghost btn--sm" aria-pressed={shirtColor === null}
                  onClick={() => { setShirtColor(null); setSaved(false); }}>
                  {shirtColor === null && <span aria-hidden="true">▶</span>} ORIGINAL
                </button>
              )}
            </div>
          </fieldset>
          <p className="muted">Preview changes here. Save when you're ready.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn" disabled={busy}>{busy ? 'SAVING...' : onboarding ? 'SAVE / ENTER CAMPUS' : 'SAVE CHANGES'}</button>
          <p role="status" className="c-green">{saved ? 'CHARACTER SAVED' : ''}</p>
        </div>
      </form>
    </Panel>
  );
}
