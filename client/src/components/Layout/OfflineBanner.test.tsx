import { act, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from '../../../tests/helpers/render';
import OfflineBanner from './OfflineBanner';

vi.mock('../../sync/mutationQueue', () => ({
  mutationQueue: {
    pendingCount: vi.fn(),
    failedCount: vi.fn(),
    conflictCount: vi.fn(),
  },
}));

import { mutationQueue } from '../../sync/mutationQueue';
import { _resetNetworkMode } from '../../sync/networkMode';

const pendingCount = mutationQueue.pendingCount as ReturnType<typeof vi.fn>;
const failedCount = mutationQueue.failedCount as ReturnType<typeof vi.fn>;
const conflictCount = mutationQueue.conflictCount as ReturnType<typeof vi.fn>;

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
  _resetNetworkMode();
  Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
});

describe('OfflineBanner (B3 surface)', () => {
  it('retries a cache switch without dropping the last known pending count', async () => {
    vi.useFakeTimers();
    const closed = Object.assign(new Error('Database has been closed'), { name: 'DatabaseClosedError' });
    pendingCount.mockResolvedValue(4).mockRejectedValueOnce(closed);
    failedCount.mockResolvedValue(0);
    conflictCount.mockResolvedValue(0);
    await act(async () => {
      render(<OfflineBanner />);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/syncing 4/i);
    pendingCount.mockRejectedValueOnce(closed);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/syncing 4/i);
    pendingCount.mockResolvedValue(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/syncing 1/i);
  });

  it('shows the failed pill when failedCount > 0 while online', async () => {
    pendingCount.mockResolvedValue(0);
    failedCount.mockResolvedValue(2);
    conflictCount.mockResolvedValue(0);

    render(<OfflineBanner />);

    expect(await screen.findByText(/failed to sync: 2/i)).toBeInTheDocument();
  });

  it('shows the conflict pill when conflicts exist while online', async () => {
    pendingCount.mockResolvedValue(0);
    failedCount.mockResolvedValue(0);
    conflictCount.mockResolvedValue(3);

    render(<OfflineBanner />);

    expect(await screen.findByText(/conflicts: 3/i)).toBeInTheDocument();
  });

  it('stays hidden when online with nothing pending, failed or conflicting', async () => {
    pendingCount.mockResolvedValue(0);
    failedCount.mockResolvedValue(0);
    conflictCount.mockResolvedValue(0);

    const { container } = render(<OfflineBanner />);
    // Give the async poll a tick to resolve.
    await waitFor(() => expect(failedCount).toHaveBeenCalled());
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});
