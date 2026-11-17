import Decimal from 'decimal.js';
export function formatResult(value: Decimal): string {
  const rounded = value.toDecimalPlaces(10, Decimal.ROUND_HALF_UP);
  return rounded.isZero() ? '0' : rounded.toFixed();
}
export function displayNumber(value: string): string {
  const [integer, fraction] = value.split('.');
  return (
    integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
    (fraction === undefined ? '' : `.${fraction}`)
  );
}
