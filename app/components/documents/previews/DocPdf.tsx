interface Props {
  src: string;
}

export default function DocPDF({ src }: Props) {
  return <iframe height="100%" src={src} width="100%" />;
}
