import type { TripPlanningState } from '@trek/shared';
import { useState } from 'react';

import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../store/authStore';

export function TripPlanningMembers({
  state,
  disabled,
  save,
}: {
  state: TripPlanningState;
  disabled: boolean;
  save: (userIds: number[]) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [selection, setSelection] = useState<number[] | null>(null);
  if (!state.is_owner) return null;
  const members = state.members.filter((member) => member.id !== user?.id);
  const selected = selection ?? state.collaborators;
  const changed = members.some((member) => selected.includes(member.id) !== state.collaborators.includes(member.id));
  return (
    <details className="mt-6 border-t border-edge-faint pt-3">
      <summary className="min-h-11 cursor-pointer content-center rounded text-body font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
        {t('tripPlanning.collaborators')}
      </summary>
      <p className="mt-2 text-caption leading-relaxed text-content-secondary">{t('tripPlanning.collaboratorsHelp')}</p>
      {members.length ? (
        <fieldset disabled={disabled} className="mt-3">
          <legend className="sr-only">{t('tripPlanning.collaborators')}</legend>
          {members.map((member) => (
            <label
              key={member.id}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-body hover:bg-surface-secondary"
            >
              <input
                type="checkbox"
                checked={selected.includes(member.id)}
                className="h-4 w-4 accent-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onChange={(event) => {
                  setSelection(
                    event.target.checked
                      ? [...selected.filter((id) => id !== member.id), member.id]
                      : selected.filter((id) => id !== member.id)
                  );
                }}
              />
              <span className="min-w-0 [overflow-wrap:anywhere]">{member.username}</span>
            </label>
          ))}
          <button
            type="button"
            disabled={disabled || !changed}
            onClick={() => {
              void save(selected.filter((id) => members.some((member) => member.id === id))).then((saved) => {
                if (saved) setSelection(null);
              });
            }}
            className="mt-3 min-h-11 rounded-lg border border-edge px-3 text-body font-medium hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('tripPlanning.saveCollaborators')}
          </button>
        </fieldset>
      ) : (
        <p className="mt-3 text-body text-content-muted">{t('tripPlanning.noOtherMembers')}</p>
      )}
    </details>
  );
}
