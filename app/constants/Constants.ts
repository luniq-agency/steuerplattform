export const agent_status = [
  {
    label: 'Eingeladen',
    severity: 'warning',
    value: 'invited',
  },
  {
    label: 'Aktiv',
    severity: 'success',
    value: 'active',
  },
];

export const client_status = [
  {
    bg: '#F0F1F2',
    color: '#505258',
    label: 'Ausstehend',
    severity: 'warning',
    value: 'pending',
  },
  {
    bg: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    label: 'Wird überprüft',
    severity: 'contrast',
    value: 'in_review',
  },
  {
    bg: '#1F845A',
    color: 'white',
    label: 'Aktiv',
    severity: 'info',
    value: 'approved',
  },
  {
    bg: '#964AC0',
    color: '#white',
    label: 'Wiedervorlage',
    severity: 'contrast',
    value: 'on_hold',
  },
  {
    bg: 'var(--success-text)',
    color: 'white',
    label: 'Abgeschlossen',
    severity: 'success',
    value: 'completed',
  },
];

export const document_options = [
  {
    bg: '#01c785',
    label: 'Bild',
    icon: '/icons/image.svg',
    value: 'image',
  },
  {
    bg: '',
    label: 'Excel-Datei (XLS)',
    icon: '/icons/xls.svg',
    value: 'xls',
  },
  {
    bg: '',
    label: 'Excel-Datei (XLSX)',
    icon: '/icons/xls.svg',
    value: 'xlsx',
  },
  {
    bg: '#e5242a',
    label: 'PDF',
    icon: '/icons/pdf.svg',
    value: 'pdf',
  },
  {
    bg: '',
    label: 'Word-Dokument (DOC)',
    icon: '/icons/doc.svg',
    value: 'doc',
  },
  {
    bg: '',
    label: 'Word-Dokument (DOCX)',
    icon: '/icons/doc.svg',
    value: 'docx',
  },
  {
    bg: '#fe7130',
    label: 'ZIP',
    icon: '/icons/zip.svg',
    value: 'zip',
  },
];

export const family_options = [
  {
    label: 'Ledig',
    value: 'single',
  },
  {
    label: 'Verheiratet',
    value: 'married',
  },
  {
    label: 'Geschieden',
    value: 'divorced',
  },
  {
    label: 'Unbekannt',
    value: 'unkown',
  },
];

export const invoice_status = [
  {
    label: 'Entwurf',
    severity: 'primary',
    value: 'draft',
  },
  {
    bg: '#EED7FC',
    color: '#50253F',
    label: 'Gesendet',
    severity: 'warning',
    value: 'sent',
  },
  {
    bg: 'green',
    color: 'white',
    label: 'Bezahlt',
    severity: 'success',
    value: 'paid',
  },
  {
    bg: 'red',
    color: 'white',
    label: 'Überfällig',
    severity: 'danger',
    value: 'overdue',
  },
];

export const job_categories = [
  {
    bg: '#124559',
    label: 'Angestellt',
    color: 'white',
    value: 'employed',
  },
  {
    bg: '#FCEC52',
    label: 'Freelancer',
    color: 'black',
    value: 'freelancer',
  },
  {
    bg: '#EF709D',
    label: 'Selbstständig',
    color: 'white',
    value: 'self-employed',
  },
];

export const notification_types = [
  {
    value: 'client',
  },
  {
    value: 'task',
  },
];

export const priority_options = [
  {
    bg: 'var(--success-bg)',
    color: 'var(--success-text)',
    label: 'Gering',
    value: 'low',
  },
  {
    bg: 'var(--warning-bg)',
    color: 'var(--warning-text)',
    label: 'Mittel',
    value: 'medium',
  },
  {
    bg: 'var(--error-bg)',
    color: 'var(--error-text)',
    label: 'Hoch',
    value: 'high',
  },
];

export const service_options = [
  {
    label: 'Behördenkommunikation',
  },
  {
    label: 'Gewerbeanmeldung',
  },
  {
    label: 'Buchhaltung',
  },
  {
    label: 'Steuererklärung',
  },
  {
    label: 'Anderes',
  },
];

export const task_status = [
  {
    bg: '#FEF7C8',
    color: '#7F5F01',
    label: 'Offen',
    severity: 'primary',
    value: 'open',
  },
  {
    bg: 'var(--success-text)',
    color: 'white',
    label: 'Geschlossen',
    severity: 'success',
    value: 'closed',
  },
  {
    bg: 'var(--error-text)',
    color: 'white',
    label: 'Überfällig',
    severity: 'error',
    value: 'overdue',
  },
  {
    bg: 'var(--warning-bg)',
    color: 'black',
    label: 'Wiedervorlage',
    severity: 'info',
    value: 'on_hold',
  },
];

export const tax_rates = [
  {
    label: 'Brutto (19% inbegriffen)',
    multiplier: 19,
    value: 'gross',
  },
  {
    label: 'Netto (19% obendrauf)',
    multiplier: 19,
    value: 'net',
  },
];

export const ticket_options = [
  {
    description: 'Brief vom Finanzamt etc.',
    label: 'Behördenkommunikation',
    value: 'official',
  },
  {
    description: 'Änderungswünsche, Verbesserungsvorschläge etc.',
    label: 'Frage zu CONEK',
    value: 'general',
  },
  {
    description: 'Technische Probleme, Bugs & Fehler etc.',
    label: 'Technischer Support',
    value: 'tech_support',
  },
  {
    description: 'Allgemeine Anliegen',
    label: 'Sonstiges',
    value: 'other'
  }
];

export const ticket_status = [
  {
    label: 'Neu',
    severity: 'info',
    value: 'new',
  },
  {
    label: 'Geöffnet',
    severity: 'primary',
    value: 'opened',
  },
  {
    label: 'Warten auf Antwort',
    severity: 'warning',
    value: 'answered',
  },
  {
    label: 'Geschlossen',
    severity: 'Success',
    value: 'closed',
  },
];
