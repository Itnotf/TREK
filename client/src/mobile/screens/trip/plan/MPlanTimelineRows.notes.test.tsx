import en from '@trek/shared/i18n/en';
import { afterEach, expect, it, vi } from 'vitest';
import { buildDayNote } from '../../../../../tests/helpers/factories';
import { fireEvent, render, screen } from '../../../../../tests/helpers/render';
import { NoteRow } from './MPlanTimelineRows';

afterEach(() => vi.restoreAllMocks());

it('expands a long note in the phone timeline without opening its editor, then still permits editing', () => {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(54);
  const onEdit = vi.fn();
  render(
    <NoteRow
      note={buildDayNote({ text: '成都慢游', time: '09:30 公园散步。\n午后休息。'.repeat(10) })}
      chrome={{ editing: true, t: (key: string) => en[key] ?? key, language: 'en', timeFormat: '24h' }}
      reorder={null}
      onEdit={onEdit}
    />
  );
  expect(screen.getByText('09:30')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
  expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  expect(onEdit).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText('成都慢游'));
  expect(onEdit).toHaveBeenCalledOnce();
});
