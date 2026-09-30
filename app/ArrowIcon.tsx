type Direction = 'up-right' | 'down' | 'right';

const paths: Record<Direction, string> = {
  'up-right': 'M7 17 17 7M8 7h9v9',
  down: 'M12 5v14M5 12l7 7 7-7',
  right: 'M5 12h14M12 5l7 7-7 7',
};

/**
 * Seta vetorial usada nos CTAs. Substitui os glifos ↗ ↓ → que o iOS renderiza como emoji.
 */
export default function ArrowIcon({ direction = 'up-right', className }: { direction?: Direction; className?: string }) {
  return (
    <svg className={className ? `arrow-icon ${className}` : 'arrow-icon'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={paths[direction]} />
    </svg>
  );
}
