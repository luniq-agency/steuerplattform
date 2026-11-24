interface Props {
    hidden?: boolean;
    label: string;
}

export default function SidebarLabel({ hidden = false, label }: Props) {

    if (hidden) return;

    return (
        <label><strong>{label}</strong></label>
    );
}
