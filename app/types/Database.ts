export type Agent = {
  clients: Client[];
  created_at: Date;
  email: string;
  firma: string;
  id: string;
  nachname: string;
  status: string;
  vorname: string;
};

export type AgencyStats = {
  client_count: string;
  created_at: Date;
  email: string;
  firma: string;
  id: string;
  user_name_first: string;
  user_name_last: string;
};

export type Certificate = {
  created_at: Date;
  file: string;
  id: string;
  user: string;
  year: string;
};

export type CertificateMonthlyStats = {
  month: string;
  certificate_count: number;
  previous_month_count: number | null;
  change_absolute: number | null;
  change_percent: number | null;
};

export type Client = {
  bearbeiter: string;
  beruf: string;
  berufsstatus: string;
  certificate: string;
  created_at: Date;
  email: string;
  family_status: string;
  geburtsdatum: string;
  iban: string;
  id: string;
  instagram: string;
  kinder: number;
  linkedin: string;
  nachname: string;
  status: string;
  telefon: string;
  user: string;
  user_uuid: string;
  vorname: string;
  website: string;
};

export type ClientMonthlyStats = {
  month: string;
  total_count: number;
  previous_month_total: number | null;
  change_absolute: number | null;
  employed_count: number;
  freelancer_count: number;
  self_employed_count: number;
  previous_employed_count: number | null;
  previous_freelancer_count: number | null;
  previous_self_employed_count: number | null;
};

export type Document = {
  client: string;
  created_at: Date;
  created_by: string;
  id: string;
  document_file: string;
  document_name: string;
  file_type: string;
  folder: string;
  user: string;
};

export type DocumentFolder = {
  created_at: Date;
  id: string;
  name: string;
  parent: string | null;
  user: string;
};

export type Email = {
  body: string;
  from: string;
  from_name: string;
  id: string;
  opened: boolean;
  received_at: string;
  subject: string;
  to: string;
};

export type EmailTemplate = {
  body: string;
  created_at: Date;
  id: string;
  name: string;
  subject: string;
  title: string;
};

export type Invoice = {
  client: string;
  created_at: Date;
  id: string;
  invoice_date: Date | null;
  invoice_date_due: Date | null;
  invoice_date_sent: Date;
  invoice_number: string;
  invoice_recipient_email: string;
  invoice_status: string;
  invoice_total_gross: number;
  invoice_total_net: number;
  payment_url: string;
  recipient: string;
  stripe_invoice_id: string;
  subscription: boolean;
  tax_amount: number;
  tax_category: string;
  tax_rate: number;
  total: number;
  user: string;
};

export type InvoiceMonthlyStats = {
  month: string;
  paid_count: number;
  sent_count: number;
  paid_total: number;
  sent_total: number;
  previous_paid_total: number | null;
  previous_sent_total: number | null;
};

export type InvoiceItem = {
  created_at: Date;
  description: string;
  id: string;
  index: number;
  invoice: string;
  quantity: number;
  price_single: number;
  price_total: number;
  taxes_amount: number;
};

export type Notification = {
  created_at: Date;
  id: string;
  message: string;
  read: boolean;
  ref: string;
  recipient: string | number;
  title: string;
  type: string;
};

export type Subscription = {
  amount_net: number;
  amount_tax: number;
  amount_total: number;
  created_at: Date;
  id: string;
  name: string;
  stripe_id: string;
};

export type SubscriptionItem = {
  amount_net: number;
  amount_tax: number;
  amount_total: number;
  created_at: Date;
  date_end: Date;
  date_start: Date;
  name: string;
  status: string;
  user: number | string;
};

export type Task = {
  assignee: string | null;
  category: string;
  created_at: Date;
  created_by: string;
  description: string;
  due_date: Date | null;
  id: string;
  priority: string;
  status: string;
  title: string;
  user: string | number | null;
};

export type TaskUpdate = {
  body: string;
  created_at: Date;
  created_by: string;
  creator: string;
  id: string;
  task: string;
};

export type Ticket = {
  assignee: string | number;
  category: string;
  created_at: Date;
  created_by: string;
  description: string;
  id: string;
  name: string;
  status: string;
};

export type TicketEntry = {
  content: string;
  created_at: Date;
  created_by: string;
  id: string;
  media: string;
  ticket: string;
};

export type User = {
  anschrift: string;
  avatar: string | null;
  bearbeiter: string | null;
  certificate: string;
  city: string;
  client_profile: string;
  created_at: Date;
  dob: string | null;
  email: string;
  family_status: string;
  firma: string;
  id: string;
  instagram: string;
  job: string;
  job_status: string;
  iban: string;
  kinder: number;
  linkedin: string;
  notizen: string;
  permission_notifications_email: boolean;
  permission_notifications_push: boolean;
  plz: string;
  setup_complete: boolean;
  status: string;
  steuer_id?: string;
  stripe_customer_id: string;
  telefon: string;
  user_name_first: string;
  user_name_last: string;
  user_role: string;
  user_uuid: string;
  website: string;
};

export type UserUpdate = {
  body: string;
  created_at: Date;
  created_by: string;
  id: string;
  user: string;
};
