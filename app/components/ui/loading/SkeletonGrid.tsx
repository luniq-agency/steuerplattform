import { Skeleton } from 'primereact/skeleton';

interface Props {
  columns: string;
  count: number;
  gap: number;
  height: string;
  width: string;
}

export default function SkeletonGrid({ columns, count, gap, height, width }: Props) {
  return (
    <div className="grid" style={{ gridTemplateColumns: columns, gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton height={height} key={i} width={width} />
      ))}
    </div>
  );
}
