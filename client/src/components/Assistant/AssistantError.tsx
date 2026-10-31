import { CircleAlert, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useNetworkMode } from '../../hooks/useNetworkMode';
import { useTranslation } from '../../i18n';
import { chatOf, useAssistantStore } from '../../store/assistantStore';
import { type AssistantErrorActionKind, connectionErrorOf, errorView } from './assistantModel';
import { AI_SETTINGS_PATH } from './assistantParts';
import { CHATGPT_USAGE_URL, providerLabel } from './providerCatalog';

/**
 * Why the assistant cannot go on, as one line above the composer with at
 * most one thing to do about it: try again, continue, sign in again, and so
 * on. Offline needs no button; the line says why the composer is off.
 */
export default function AssistantError({ tripId }: { tripId: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offline } = useNetworkMode();
  const error = useAssistantStore((s) => chatOf(s, tripId).error);
  const interrupted = useAssistantStore((s) => {
    const chat = chatOf(s, tripId);
    const last = chat.messages[chat.messages.length - 1];
    return !chat.loading && !chat.isRunning && last?.role === 'assistant' && last.status === 'aborted';
  });
  const status = useAssistantStore((s) => s.status);
  const retry = useAssistantStore((s) => s.retry);
  const continueHere = useAssistantStore((s) => s.continueHere);
  const send = useAssistantStore((s) => s.send);

  const code = offline ? 'offline' : (error ?? connectionErrorOf(status));
  if (!code && !interrupted) return null;

  const effective = status?.effective;
  const provider = effective ? providerLabel(effective.kind, effective.host) : '';
  const view = code
    ? errorView(code, { canConnectOwn: status?.canConnectOwn ?? false, provider })
    : {
        messageKey: 'assistant.error.interrupted',
        action: { kind: 'continue' as const, labelKey: 'assistant.errorAction.continue' },
      };

  const run = (kind: AssistantErrorActionKind) => {
    if (kind === 'retry') void retry(tripId);
    else if (kind === 'continueHere') void continueHere(tripId);
    else if (kind === 'continue') void send(tripId, t('assistant.errorAction.continue'));
    else if (kind === 'openSettings') void navigate(AI_SETTINGS_PATH);
    else window.open(CHATGPT_USAGE_URL, '_blank', 'noopener,noreferrer');
  };

  const { action } = view;
  const Icon = code === 'offline' ? WifiOff : CircleAlert;
  return (
    <div
      role="status"
      className="trek-assistant-enter flex items-center gap-2.5 rounded-lg bg-surface-secondary px-3 py-2 text-caption text-content-secondary"
    >
      <Icon size={14} aria-hidden="true" className="flex-shrink-0 text-warning" />
      <span className="min-w-0 flex-1">{t(view.messageKey, { provider })}</span>
      {action && (
        <button
          type="button"
          onClick={() => run(action.kind)}
          className="min-h-11 min-w-11 flex-shrink-0 rounded-md px-2 py-1 text-caption font-medium text-accent-on hover:bg-surface-hover"
        >
          {t(action.labelKey)}
        </button>
      )}
    </div>
  );
}
