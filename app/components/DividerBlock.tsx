interface Props {
  height: number;
}

export default function DividerBlock({ height }: Props) {
  return <div style={{ height: `${height}rem` }} />;
}
