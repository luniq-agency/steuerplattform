import Image from 'next/image';
import DividerBlock from './DividerBlock';
import { ProgressSpinner } from 'primereact/progressspinner';

interface Props {
  text?: string;
}

export default function Loader({ text }: Props) {
  return (
    <div className="loader-wrapper">
      <Image alt="CONEK Logo" height={30} src="/conek-logo-weiss.svg" width={150} />
      <DividerBlock height={1} />
      {text && <span style={{ color: 'black' }}>{text}</span>}
      <ProgressSpinner strokeWidth="4" />
    </div>
  );
}
