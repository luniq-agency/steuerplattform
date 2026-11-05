interface Props {
  height: number;
}

export default function DividerBlock({ height }: Props) {
  return <div style={{ flexShrink: 0, height: `${height}rem` }} />;
}
