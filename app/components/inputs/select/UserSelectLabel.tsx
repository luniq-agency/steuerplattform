import { Dropdown } from 'primereact/dropdown';
import Column from '../../layout/Column';
import { SelectItemOptionsType } from 'primereact/selectitem';
import { User } from '@/app/types/Database';
import Row from '../../layout/Row';
import { fehlendeStammdaten } from '@/app/utils/stammdaten';
import { OctagonAlert } from 'lucide-react';
import Tag from '../../tag/Tag';

interface UserProps {
    label?: string;
    onChange: (value: User) => void;
    options?: User[];
    optionLabel?: string;
    value: User | null;
}

type UserOption = User & { fullName: string; fehlend: string[] };

function UnvollstaendigTag({ fehlend }: { fehlend: string[] }) {
    if (!fehlend.length) return null;
    return (
        <Tag icon={OctagonAlert} label="Profil unvollständig" />
    );
}

export function UserSelectLabel({ label, onChange, options, value }: UserProps) {
    if (!options) return null;

    const userOptions: UserOption[] = options
        .map((u) => ({
            ...u,
            fullName: `${u.nachname ?? ''}, ${u.vorname ?? ''}`,
            fehlend: fehlendeStammdaten(u),
        }))
        .sort((a, b) => (a.nachname ?? '').localeCompare(b.nachname ?? ''));

    const matchedValue = userOptions.find((o) => o.id === value?.id) ?? null;

    // Eintrag in der aufgeklappten Liste
    const userTemplate = (option: UserOption) => (
        <Row alignItems="center" gap={8} justifyContent="space-between">
            <span>{option.fullName}</span>
            <UnvollstaendigTag fehlend={option.fehlend} />
        </Row>
    );

    // Anzeige des ausgewählten Users im geschlossenen Feld
    const valueTemplate = (option: UserOption | null, props: { placeholder?: string }) =>
        option ? (
            <Row alignItems="center" gap={8} width="fit-content">
                <span>{option.fullName}</span>
                <UnvollstaendigTag fehlend={option.fehlend} />
            </Row>
        ) : (
            <span>{props.placeholder ?? 'Bitte wählen'}</span>
        );

    return (
        <Column gap={4}>
            {label && <label>{label}</label>}
            <Dropdown
                filter
                filterBy="fullName"
                filterPlaceholder="Suchen"
                itemTemplate={userTemplate}
                onChange={(e) => onChange(e.value)}
                options={userOptions}
                optionLabel="fullName"
                placeholder="Bitte wählen"
                value={matchedValue}
                valueTemplate={valueTemplate}
            />
        </Column>
    );
}