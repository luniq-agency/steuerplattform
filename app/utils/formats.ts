export const parseDate = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function formatCurrency(number: number) {
  const formattedNumber = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(number);

  return formattedNumber;
}

export function formatDate(str: string | Date) {
  const date = new Date(str);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateWithTime(str: string | Date) {
  const date = new Date(str);
  const dayPart = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const hourPart = date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dayPart} | ${hourPart}`;
}

export function formatDateMonthYear(str: string | Date) {
  const date = new Date(str);
  return date.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatMonth(str: string | Date) {
  const date = new Date(str);
  const dayPart = date.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return `${dayPart}`;
}

export function formatYear(str: string | Date) {
  const date = new Date(str);
  const dayPart = date.toLocaleDateString('de-DE', {
    year: 'numeric',
  });

  return `${dayPart}`;
}

export const monatKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export function stripHtml(html: string) {
  const formattedText = html?.replace(/<[^>]*>/g, '') ?? '';

  return formattedText;
}

export const toDateString = (date?: Date | string | null): string | null => {
  const d = parseDate(date);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
