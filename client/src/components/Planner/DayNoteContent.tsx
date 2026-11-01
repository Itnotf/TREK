import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from '../../i18n';
import MarkdownText from '../shared/MarkdownText';

/** Both timelines keep the original note for editing; old AI notes used the title for the whole day's prose. */
export function DayNoteContent({ text, detail, time }: { text: string; detail?: string | null; time?: ReactNode }) {
  const { t } = useTranslation();
  const [firstLine, ...rest] = text.split('\n');
  const proseTitle = firstLine.length > 80;
  const title = proseTitle ? t('dayplan.noteSubtitle') : firstLine;
  const body = [proseTitle ? text : rest.join('\n'), detail].filter(Boolean).join('\n\n');
  const [expandedBody, setExpandedBody] = useState<string | null>(null);
  const expanded = expandedBody === body;
  const [overflows, setOverflows] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyId = useId();

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [body, expanded]);

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-1.5">
        {time}
        <span className="text-body font-semibold text-content [overflow-wrap:anywhere]">{title}</span>
      </div>
      {body && (
        <>
          <div ref={bodyRef} id={bodyId} className={expanded ? '' : 'line-clamp-3'}>
            <MarkdownText
              disableLinks={overflows && !expanded}
              className="mt-1 text-caption font-normal leading-relaxed text-content-muted [overflow-wrap:anywhere]"
            >
              {body}
            </MarkdownText>
          </div>
          {(overflows || expanded) && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={bodyId}
              onClick={(event) => {
                event.stopPropagation();
                setExpandedBody(expanded ? null : body);
              }}
              className="mt-1 rounded py-1 text-caption font-medium text-content underline underline-offset-4 hover:text-content-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t(expanded ? 'common.showLess' : 'common.showMore')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
