import Link from 'next/link';
import DividerBlock from '../DividerBlock';
import styles from './Cards.module.css';

interface Props {
  background: string;
  body: string;
  headline: string;
  target: string;
  textColor: string;
}

export default function LinkBlock({ background, body, headline, target, textColor }: Props) {
  return (
    <Link href={target}>
      <div className={styles.card} style={{ background }}>
        <h4 style={{ color: textColor }}>{headline}</h4>
        <DividerBlock height={0.5} />
        <span style={{ color: textColor }}>{body}</span>
      </div>
    </Link>
  );
}
