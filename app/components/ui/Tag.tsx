import styles from './UI.module.css';

interface Props {
  bgColor: string;
  color: string;
  text: string;
}

export default function Tag({ bgColor, color, text }: Props) {
  return (
    <div className={styles.tag} style={{ backgroundColor: bgColor, color }}>
      {text}
    </div>
  );
}
