import styles from './UI.module.css';

interface Props {
  message: string;
}

export default function ErrorMessage({ message }: Props) {
  return <span className={styles.errorMessage}>{message}</span>;
}
