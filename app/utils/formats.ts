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
    year: 'numeric'
  });

  return `${dayPart}`;
}

export function formatYear(str: string | Date) {
  const date = new Date(str);
  const dayPart = date.toLocaleDateString('de-DE', {
    year: 'numeric'
  });

  return `${dayPart}`;
}

export function stripHtml(html: string) {
  const formattedText = html?.replace(/<[^>]*>/g, '') ?? '';

  return formattedText;
}
