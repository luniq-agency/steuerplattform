interface Props {
  label: string;
  value: string;
}

export default function DetailField({ label, value }: Props) {
  return (
    <div className="column width-100 gap-xs">
      <div className="row align-center gap-xs">
        <label>{label}</label>
      </div>
      <span>{value}</span>
    </div>
  );
}
