import { useRef } from 'react';

import { useTranslation } from '../../i18n';
import { HOME_CHAT_KEY } from '../../store/assistantChatKey';
import { useAssistantStore } from '../../store/assistantStore';
import { isEffectivelyOffline } from '../../sync/networkMode';
import { useToast } from '../shared/Toast';

/** The same entry for the dashboard buttons and the phone's create shortcut. */
export function useNewTripPlanning(onManual: () => void) {
  const available = useAssistantStore((state) => state.status?.available === true);
  const starting = useRef(false);
  const toast = useToast();
  const { t } = useTranslation();

  const start = async () => {
    if (starting.current) return;
    starting.current = true;
    try {
      if (!useAssistantStore.getState().status && !isEffectivelyOffline()) {
        await useAssistantStore.getState().loadStatus();
      }
      const assistant = useAssistantStore.getState();
      if (!assistant.status?.available || isEffectivelyOffline()) {
        toast.info(t('assistant.plan.unavailable'));
        onManual();
        return;
      }
      assistant.newThread(HOME_CHAT_KEY);
      assistant.setDraft(HOME_CHAT_KEY, '');
      assistant.openWith(HOME_CHAT_KEY, null);
    } catch {
      toast.info(t('assistant.plan.unavailable'));
      onManual();
    } finally {
      starting.current = false;
    }
  };

  return { available, start, manual: onManual };
}
