import { afterEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../tests/helpers/render';
import { seedStore } from '../../../tests/helpers/store';
import { assistantRepo } from '../../repo/assistantRepo';
import { chatOf, useAssistantStore } from '../../store/assistantStore';
import { _resetNetworkMode, setForcedOffline } from '../../sync/networkMode';
import { useNewTripPlanning } from './useNewTripPlanning';

const initial = useAssistantStore.getState();
afterEach(() => {
  useAssistantStore.setState(initial, true);
  _resetNetworkMode();
  vi.restoreAllMocks();
});

function Entry({ manual }: { manual: () => void }) {
  const planning = useNewTripPlanning(manual);
  return (
    <>
      <button
        onClick={() => {
          void planning.start();
        }}
      >
        New trip
      </button>
      <button onClick={planning.manual}>Manual</button>
    </>
  );
}

describe('useNewTripPlanning', () => {
  it('opens a fresh home conversation without sending a fabricated prompt', async () => {
    seedStore(useAssistantStore, { status: { available: true } });
    useAssistantStore.getState().setDraft(0, 'Old unsent request');
    const send = vi.spyOn(assistantRepo, 'send');
    const manual = vi.fn();
    render(<Entry manual={manual} />);
    fireEvent.click(screen.getByRole('button', { name: 'New trip' }));
    const state = useAssistantStore.getState();
    expect(state.window.open).toBe(true);
    expect(chatOf(state, 0)).toMatchObject({ threadId: null, fresh: true, draft: '', messages: [] });
    expect(send).not.toHaveBeenCalled();
    expect(manual).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
    expect(manual).toHaveBeenCalledOnce();
  });

  it('loads unknown availability once and falls back to the manual form when unavailable', async () => {
    useAssistantStore.setState({ status: null });
    const load = vi.spyOn(useAssistantStore.getState(), 'loadStatus').mockResolvedValue(undefined);
    const manual = vi.fn();
    render(<Entry manual={manual} />);
    fireEvent.click(screen.getByRole('button', { name: 'New trip' }));
    fireEvent.click(screen.getByRole('button', { name: 'New trip' }));
    await waitFor(() => expect(manual).toHaveBeenCalledOnce());
    expect(load).toHaveBeenCalledOnce();
    expect(useAssistantStore.getState().window.open).toBe(false);
  });

  it('offers the manual route offline and after a status failure', async () => {
    seedStore(useAssistantStore, { status: { available: true } });
    setForcedOffline(true);
    const manual = vi.fn();
    render(<Entry manual={manual} />);
    fireEvent.click(screen.getByRole('button', { name: 'New trip' }));
    expect(manual).toHaveBeenCalledOnce();
    setForcedOffline(false);
    useAssistantStore.setState({ status: null });
    vi.spyOn(useAssistantStore.getState(), 'loadStatus').mockRejectedValue(new Error('offline'));
    fireEvent.click(screen.getByRole('button', { name: 'New trip' }));
    await waitFor(() => expect(manual).toHaveBeenCalledTimes(2));
  });
});
