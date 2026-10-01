// app/components/pdf/InvoicePDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, InvoiceItem, User } from '@/app/types/Database';
import { formatCurrency, formatDate } from '@/app/utils/formats';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontSize: 22, fontWeight: 'bold' },
  section: { marginBottom: 16 },
  table: { marginTop: 16 },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: '#eee',
    paddingVertical: 6,
  },
  tableHeader: { backgroundColor: '#f4f7fe' },
  col1: { width: '5%' },
  col2: { width: '45%' },
  col3: { width: '15%' },
  col4: { width: '17%' },
  col5: { width: '18%', textAlign: 'right' },
  paragraph: { marginBottom: 16 },
  textSection: { marginTop: 32 },
  totals: { marginTop: 16, alignItems: 'flex-end' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 220,
    paddingVertical: 3,
  },
  bold: { fontWeight: 'bold' },
});

interface Props {
  invoice: Invoice;
  items: InvoiceItem[];
  recipient: User;
}

export function InvoicePDF({ invoice, items, recipient }: Props) {
  const gross = invoice.invoice_total_gross;
  const net = invoice.invoice_total_net;
  const tax = invoice.tax_amount;

  const dueDate = invoice.invoice_date_due
    ? new Date(invoice.invoice_date_due)
    : new Date(new Date(invoice.invoice_date ?? new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4b39ef' }}>CONEK</Text>
            <Text style={{ fontSize: 9, color: '#888', marginTop: 4 }}>
              CONEK UG (haftungsbeschränkt)
            </Text>
            <Text style={{ fontSize: 9, color: '#888' }}>Haselnussweg 8, 31275 Hämelerwald</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>Rechnung</Text>
            <Text style={{ fontSize: 10, marginTop: 4 }}>Nr. {invoice.invoice_number}</Text>
            <Text style={{ fontSize: 10 }}>
              {invoice.invoice_date
                ? new Date(invoice.invoice_date).toLocaleDateString('de-DE')
                : ''}
            </Text>
          </View>
        </View>

        {/* Recipient */}
        <View style={styles.section}>
          <Text style={{ fontSize: 9, color: '#888', marginBottom: 4 }}>RECHNUNGSEMPFÄNGER</Text>
          <Text style={styles.bold}>
            {recipient.user_name_first} {recipient.user_name_last}
          </Text>
          {recipient.anschrift && <Text style={{ fontSize: 10 }}>{recipient.anschrift}</Text>}
          {recipient.plz && (
            <Text style={{ fontSize: 10 }}>
              {recipient.plz} {recipient.city}
            </Text>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Beschreibung</Text>
            <Text style={styles.col3}>Menge</Text>
            <Text style={styles.col4}>Einzelpreis</Text>
            <Text style={styles.col5}>Gesamt</Text>
          </View>
          {items.map((item, i) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.col1}>{i + 1}</Text>
              <Text style={styles.col2}>{item.description || '–'}</Text>
              <Text style={styles.col3}>{item.quantity}</Text>
              <Text style={styles.col4}>{formatCurrency(item.price_single || 0)}</Text>
              <Text style={styles.col5}>{formatCurrency(item.price_total || 0)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Netto</Text>
            <Text>{formatCurrency(net)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>MwSt. ({(invoice.tax_rate * 100).toFixed(0)}%)</Text>
            <Text>{formatCurrency(tax)}</Text>
          </View>
          <View
            style={[
              styles.totalRow,
              { borderTopWidth: 1, borderColor: '#4b39ef', marginTop: 4, paddingTop: 4 },
            ]}
          >
            <Text style={styles.bold}>Gesamt</Text>
            <Text style={styles.bold}>{formatCurrency(gross)}</Text>
          </View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.paragraph}>
            Die Rechnung enthält die Mehrwertsteuer in Höhe von 19 %. Bitte überweisen Sie den
            Rechnungsbetrag bis zum {formatDate(dueDate)} an das untenstehende Konto.
          </Text>
          <Text style={styles.paragraph}>Mit freundlichen Grüßen</Text>
          <Text style={styles.paragraph}>Ihr Team von CONEK</Text>
        </View>

        {/* FOOTER */}
        <View style={{ position: 'absolute', bottom: 40, left: 40, right: 40 }}>
          <View style={{ borderTopWidth: 0.5, borderColor: '#eee', paddingTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 8, color: '#aaa' }}>CONEK UG (haftungsbeschränkt)</Text>
                <Text style={{ fontSize: 8, color: '#aaa' }}>Haselnussweg 8</Text>
                <Text style={{ fontSize: 8, color: '#aaa' }}>31275 Hämelerwald</Text>
              </View>
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 8, color: '#aaa' }}>Tel.: 0176 / 845 076 32</Text>
                <Text style={{ fontSize: 8, color: '#aaa' }}>info@conek.de</Text>
                <Text style={{ fontSize: 8, color: '#aaa' }}>www.conek.de</Text>
              </View>
              <View style={{ alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 8, color: '#aaa' }}>
                  IBAN: DE66 2504 0066 0202 7621 00
                </Text>
                <Text style={{ fontSize: 8, color: '#aaa' }}>USt-IdNr.: DE450331164</Text>
                <Text style={{ fontSize: 8, color: '#aaa' }}>Handelsreg.: HRB 209721</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
