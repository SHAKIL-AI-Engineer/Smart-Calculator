export function validateOperand(value: string): boolean {
  if (value.length > 40 || !/^-?\d+(\.\d*)?$/.test(value)) return false;
  const unsigned = value.replace('-', '');
  const fraction = unsigned.split('.')[1] ?? '';
  const significant = unsigned.replace('.', '').replace(/^0+/, '');
  return fraction.length <= 10 && significant.length <= 16;
}
