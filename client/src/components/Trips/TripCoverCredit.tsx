import { useTranslation } from '../../i18n';

export function TripCoverCredit({ attribution, className = '' }: { attribution?: string | null; className?: string }) {
  const { t } = useTranslation();
  if (!attribution) return null;
  const source = attribution.match(/https:\/\/commons\.wikimedia\.org\/wiki\/\S+$/)?.[0];
  if (!source) {
    return (
      <span
        title={attribution}
        className={`absolute z-10 max-w-[60%] truncate rounded bg-surface px-2 py-1 text-caption text-content ${className}`}
      >
        {attribution}
      </span>
    );
  }
  return (
    <a
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      title={attribution}
      aria-label={attribution}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      className={`absolute z-10 inline-flex min-h-11 min-w-11 max-w-[60%] items-center justify-center truncate rounded bg-surface px-2 py-1 text-caption text-content underline underline-offset-4 focus-visible:outline focus-visible:outline-2 ${className}`}
    >
      {t('tours.provenance.source')}
    </a>
  );
}
