export function formatCompactNumber(num: number | undefined | null): string {
  if (num === null || num === undefined) {
    return '0';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1, 
  });

  return formatter.format(num).toLowerCase(); 
}