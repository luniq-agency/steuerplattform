import { TaxRate } from '../types/internal';

export const taxRates: TaxRate[] = [
  {
    adding: false,
    label: 'Brutto (19% inbegriffen)',
    multiplier: 0.19,
    rate: 0.19,
    value: 'gross',
  },
  {
    adding: true,
    label: 'Netto (19% obendrauf)',
    multiplier: 0.19,
    rate: 0.19,
    value: 'net',
  },
];
