// XRechnung / ZUGFeRD / Factur-X auslesen (Syntax CII und UBL), ohne KI
import { XMLParser } from 'fast-xml-parser';
import { BelegFelder, LEERE_FELDER } from './types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true, // rsm:, ram:, cbc: … entfernen
  parseTagValue: false, // Werte als String lassen (führende Nullen, Beträge)
  textNodeName: '#text',
});

type Node = unknown;

// Weg durch das XML gehen; bei Arrays jeweils das erste Element nehmen
const get = (node: Node, ...pfad: string[]): Node => {
  let n: Node = node;
  for (const teil of pfad) {
    if (Array.isArray(n)) n = n[0];
    if (n == null || typeof n !== 'object') return undefined;
    n = (n as Record<string, Node>)[teil];
  }
  return Array.isArray(n) ? n[0] : n;
};

const alle = (node: Node, ...pfad: string[]): Node[] => {
  const letzter = pfad.pop()!;
  const eltern = get(node, ...pfad);
  if (eltern == null || typeof eltern !== 'object') return [];
  const wert = (eltern as Record<string, Node>)[letzter];
  return wert == null ? [] : Array.isArray(wert) ? wert : [wert];
};

const text = (node: Node): string | null => {
  if (node == null) return null;
  if (typeof node === 'string' || typeof node === 'number') return String(node).trim() || null;
  if (typeof node === 'object' && '#text' in (node as object)) return text((node as Record<string, Node>)['#text']);
  return null;
};

const zahl = (node: Node): number | null => {
  const t = text(node);
  if (t == null) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const satz = (prozent: number | null) => (prozent == null ? null : Math.round(prozent * 100) / 10000);

// Datum aus CII-Format 102 (YYYYMMDD) oder ISO
const datum = (t: string | null) => {
  if (!t) return null;
  if (/^\d{8}$/.test(t)) return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  return null;
};

// Ein eindeutiger Steuersatz; bei gemischten Sätzen null (Positionen dann manuell prüfen)
const eindeutig = (werte: (number | null)[]) => {
  const set = [...new Set(werte.filter((w): w is number => w != null))];
  return set.length === 1 ? set[0] : null;
};

function parseCII(root: Node): BelegFelder {
  const tx = get(root, 'SupplyChainTradeTransaction');
  const agreement = get(tx, 'ApplicableHeaderTradeAgreement');
  const settlement = get(tx, 'ApplicableHeaderTradeSettlement');
  const summen = get(settlement, 'SpecifiedTradeSettlementHeaderMonetarySummation');
  const seller = get(agreement, 'SellerTradeParty');

  const ustId = alle(seller, 'SpecifiedTaxRegistration')
    .map((r) => get(r, 'ID'))
    .find((id) => typeof id === 'object' && (id as Record<string, string>)['@_schemeID'] === 'VA');

  // TaxTotalAmount kann mehrfach vorkommen (z. B. Rechnungs- und Buchungswährung)
  const waehrung = text(get(settlement, 'InvoiceCurrencyCode'));
  const steuerSummen = alle(summen, 'TaxTotalAmount');
  const steuern =
    steuerSummen.find((s) => typeof s === 'object' && (s as Record<string, string>)['@_currencyID'] === waehrung) ??
    steuerSummen[0];

  return {
    ...LEERE_FELDER,
    lieferant: text(get(seller, 'Name')),
    rechnungsnummer: text(get(root, 'ExchangedDocument', 'ID')),
    datum: datum(text(get(root, 'ExchangedDocument', 'IssueDateTime', 'DateTimeString'))),
    betrag_netto: zahl(get(summen, 'TaxBasisTotalAmount')),
    betrag_steuern: zahl(steuern),
    betrag_brutto: zahl(get(summen, 'GrandTotalAmount')),
    steuersatz: eindeutig(alle(settlement, 'ApplicableTradeTax').map((t) => satz(zahl(get(t, 'RateApplicablePercent'))))),
    waehrung,
    ust_id: text(ustId),
    iban: text(get(settlement, 'SpecifiedTradeSettlementPaymentMeans', 'PayeePartyCreditorFinancialAccount', 'IBANID')),
  };
}

function parseUBL(root: Node): BelegFelder {
  const party = get(root, 'AccountingSupplierParty', 'Party');
  const summen = get(root, 'LegalMonetaryTotal');
  const steuerTotal = get(root, 'TaxTotal');

  return {
    ...LEERE_FELDER,
    lieferant: text(get(party, 'PartyLegalEntity', 'RegistrationName')) ?? text(get(party, 'PartyName', 'Name')),
    rechnungsnummer: text(get(root, 'ID')),
    datum: datum(text(get(root, 'IssueDate'))),
    betrag_netto: zahl(get(summen, 'TaxExclusiveAmount')),
    betrag_steuern: zahl(get(steuerTotal, 'TaxAmount')),
    betrag_brutto: zahl(get(summen, 'TaxInclusiveAmount')) ?? zahl(get(summen, 'PayableAmount')),
    steuersatz: eindeutig(alle(steuerTotal, 'TaxSubtotal').map((s) => satz(zahl(get(s, 'TaxCategory', 'Percent'))))),
    waehrung: text(get(root, 'DocumentCurrencyCode')),
    ust_id: text(get(party, 'PartyTaxScheme', 'CompanyID')),
    iban: text(get(root, 'PaymentMeans', 'PayeeFinancialAccount', 'ID')),
  };
}

/** Gibt die Felder zurück oder null, wenn das XML keine bekannte E-Rechnung ist. */
export function parseERechnung(xml: string): BelegFelder | null {
  let doc: Record<string, Node>;
  try {
    doc = parser.parse(xml);
  } catch {
    return null;
  }
  if (doc.CrossIndustryInvoice) return parseCII(doc.CrossIndustryInvoice);
  if (doc.Invoice) return parseUBL(doc.Invoice);
  if (doc.CreditNote) return parseUBL(doc.CreditNote);
  return null;
}

// Dateinamen eingebetteter XML-Dateien in ZUGFeRD/Factur-X-PDFs
export const ZUGFERD_DATEINAMEN = ['factur-x.xml', 'zugferd-invoice.xml', 'xrechnung.xml', 'zugferd_invoice.xml'];