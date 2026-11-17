import type { ButtonHTMLAttributes } from 'react';
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'number' | 'utility' | 'operator' | 'equals';
  wide?: boolean;
}
export function CalculatorButton({
  tone = 'number',
  wide,
  className = '',
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`key key--${tone} ${wide ? 'key--wide' : ''} ${className}`}
      {...props}
    />
  );
}
