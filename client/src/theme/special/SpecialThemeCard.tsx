import { Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';
import type { SpecialTheme } from '../schemes';
import { Cobweb } from './halloween/art';
import Sprite from './halloween/Sprite';
import { SPRITES } from './halloween/sprites';
import './specialThemeCard.css';

/**
 * The picker tile for a special theme, shared by the desktop tab and the phone
 * screen. Larger than a scheme swatch on purpose: it previews the theme itself,
 * a moonlit night with webs, bats and a lantern, and wakes up on hover.
 *
 * The --hw-* tokens it paints with are only defined while the theme is on, so
 * the card sets them on itself (specialThemeCard.css) and looks the same before
 * and after it is chosen.
 */
export default function SpecialThemeCard({
  theme,
  active,
  onSelect,
}: {
  theme: SpecialTheme;
  active: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={`stc stc--${theme.id} ${active ? 'stc--active' : ''}`}
    >
      <span className="stc-border" aria-hidden="true" />
      <span className="stc-sky" aria-hidden="true">
        <span className="stc-aurora" />
        <span className="stc-moon" />
        <span className="stc-fog" />
        <Cobweb size={58} seed={7} className="stc-web stc-web--l" />
        <Cobweb size={44} seed={19} className="stc-web stc-web--r" />
        <span className="stc-bats">
          <Sprite sheet={SPRITES.bat} height={17} offset={0} className="stc-bat stc-bat--1" />
          <Sprite sheet={SPRITES.bat} height={12} offset={0.4} className="stc-bat stc-bat--2" />
          <Sprite sheet={SPRITES.bat} height={14} offset={0.7} className="stc-bat stc-bat--3" />
        </span>
        <Sprite sheet={SPRITES.ghost} height={44} className="stc-ghost" />
        <span className="stc-pumpkins">
          <Sprite sheet={SPRITES.pumpkin} height={34} className="stc-pumpkin stc-pumpkin--1" />
          <Sprite sheet={SPRITES.pumpkin} height={24} offset={0.5} className="stc-pumpkin stc-pumpkin--2" />
        </span>
      </span>
      <span className="stc-copy">
        <span className="stc-title">{t(`settings.appearance.scheme.${theme.id}`)}</span>
        <span className="stc-hint">{t(`settings.appearance.special.${theme.id}.hint`)}</span>
      </span>
      <span className={`stc-badge ${active ? 'stc-badge--on' : ''}`}>
        <Sparkles size={12} strokeWidth={2.2} />
        {active ? t('settings.appearance.special.active') : t('settings.appearance.special.try')}
      </span>
    </button>
  );
}
