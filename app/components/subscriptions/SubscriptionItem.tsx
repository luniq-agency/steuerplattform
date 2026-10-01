import { formatCurrency, formatDateMonthYear } from '@/app/utils/formats';
import Row from '../layout/Row';
import { SubscriptionItem } from '@/app/types/Database';
import { invoice_status } from '@/app/constants/Constants';
import Tag from '../ui/Tag';

interface Props {
  item: SubscriptionItem;
}

export default function SubscriptionItems({ item }: Props) {
  const status = invoice_status.find((i) => i.value === item.status);

  return (
    <Row justifyContent="space-between">
      <span style={{flexGrow:1}}>{formatDateMonthYear(item.date_end)}</span>
      <Tag bgColor={status?.bg || 'grey'} color={status?.color || 'black'} text={status?.label || ''} />
      <span>{formatCurrency(item.amount_total)}</span>
    </Row>
  );
}
