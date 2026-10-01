export const toLocalTime = (date: Date) => {
   return new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).toISOString();
};