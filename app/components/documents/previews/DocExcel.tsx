interface Props {
  src: string;
}

export default function DocXLS({ src }: Props) {
  return (
    <iframe
      height="100%"
      src={`https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`}
      width="100%"
    />
  );
}
