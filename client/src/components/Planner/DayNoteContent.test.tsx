import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../../tests/helpers/render';
import { DayNoteContent } from './DayNoteContent';

afterEach(() => vi.restoreAllMocks());

function overflow() {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(54);
}

describe('DayNoteContent', () => {
  it('keeps legacy AI prose in the body and expands without activating the edit row', () => {
    overflow();
    const edit = vi.fn();
    const prose = '10:30 成都出发，午饭后休息。'.repeat(12) + '第二天 15:00 返回成都。';
    render(
      <div onClick={edit}>
        <DayNoteContent text={prose} />
      </div>
    );
    expect(screen.getByText('Daily Note')).toBeInTheDocument();
    expect(screen.getByText(prose)).not.toHaveClass('font-semibold');
    const expand = screen.getByRole('button', { name: 'Show more' });
    const body = document.getElementById(expand.getAttribute('aria-controls') ?? '');
    expect(body).toHaveClass('line-clamp-3');
    fireEvent.click(expand);
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
    expect(body).not.toHaveClass('line-clamp-3');
    expect(body).toHaveTextContent(prose);
    expect(edit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(body).toHaveClass('line-clamp-3');
  });

  it('keeps hidden links out of keyboard navigation until the full note is opened', () => {
    overflow();
    render(<DayNoteContent text="Daily plan" detail={'- Lunch\n- Rest\n- [Tickets](https://example.com/tickets)'} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getByRole('link', { name: 'Tickets' })).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('leaves short notes and their links directly readable, and keeps multiline text', () => {
    render(<DayNoteContent text={'Lunch\nMeet at the gate'} detail="[Map](https://example.com/map)" />);
    expect(screen.getByText('Lunch')).toHaveClass('font-semibold');
    expect(screen.getByText('Meet at the gate')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Map' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
