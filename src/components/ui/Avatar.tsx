import { cn } from '@/lib/cn';

type AvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
};

function toneFor(name: string): number {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  }
  return hash % 5;
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('');

  return (
    <span
      className={cn('avatar', `avatar--${size}`, `avatar--tone-${toneFor(name)}`)}
      aria-hidden="true"
    >
      {Array.from(initials).map((char, index) => (
        <span key={`${char}-${index}`}>{char}</span>
      ))}
    </span>
  );
}
