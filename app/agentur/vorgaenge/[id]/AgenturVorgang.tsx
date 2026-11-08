"use client"

import { uploadLinkSenden } from "@/app/actions/uploadLink";
import TaskEditor from "@/app/components/admin/tasks/TaskEditor";
import Button from "@/app/components/buttons/Button";
import { ContextButton } from "@/app/components/buttons/Buttons";
import DividerBlock from "@/app/components/DividerBlock";
import { TextAreaLabel } from "@/app/components/forms/FormElements";
import Column from "@/app/components/layout/Column";
import Row from "@/app/components/layout/Row";
import { Vorgang } from "@/app/types/vorgang";
import { Files } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "primereact/dialog";
import { OverlayPanel } from "primereact/overlaypanel";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

interface Props {
    vorgang: Vorgang;
}

export default function AgenturVorgang({ vorgang }: Props) {
    const router = useRouter();
    const op = useRef<OverlayPanel | null>(null);
    const toast = useRef<Toast | null>(null);

    // STATES
    const [requesting, setRequesting] = useState(false);
    const [sending, setSending] = useState(false);

    // INPUTS
    const [nachricht, setNachricht] = useState('');

    // Verknüpfter Mandant, sonst der Ersteller
    const mandantId = Number(vorgang.user ?? vorgang.created_by);

    // ACTIONS
    const dialogOeffnen = () => {
        op.current?.hide();
        setRequesting(true);
    };

    const dialogSchliessen = () => {
        if (sending) return;
        setRequesting(false);
        setNachricht('');
    };

    const requestDocs = async () => {
        setSending(true);
        const res = await uploadLinkSenden(mandantId, Number(vorgang.id), nachricht);
        setSending(false);

        if (res.error) {
            toast.current?.show({ severity: 'error', summary: 'Nicht gesendet', detail: res.error });
            return;
        }

        toast.current?.show({ severity: 'success', summary: 'Upload-Link gesendet', detail: `an ${res.gesendetAn}` });
        setRequesting(false);
        setNachricht('');
        router.refresh(); // Verlaufseintrag im TaskEditor anzeigen
    };

    return (
        <div style={{ height: '100%' }}>
            <Toast ref={toast} />
            <Dialog
                draggable={false}
                header="Dokumente anfordern"
                onHide={dialogSchliessen}
                style={{ maxWidth: 480, width: '100%' }}
                visible={requesting}
            >
                <Column gap={16}>
                    <span>
                        Der Mandant erhält per E-Mail einen sicheren Link, über den er Dokumente zu diesem Vorgang hochladen kann.
                    </span>
                    <TextAreaLabel
                        label="Nachricht an den Mandanten (optional)"
                        onChange={setNachricht}
                        rows={5}
                        value={nachricht}
                    />
                    <span className="text-meta" style={{ textAlign: 'right' }}>{nachricht.length} / 2000</span>
                    <Row gap={8} justifyContent="end">
                        <Button disabled={sending} label="Abbrechen" mode="tertiary" onClick={dialogSchliessen} />
                        <Button
                            disabled={sending || nachricht.length > 2000}
                            label={sending ? 'Wird gesendet …' : 'Link senden'}
                            mode="primary"
                            onClick={requestDocs}
                        />
                    </Row>
                </Column>
            </Dialog>
            <OverlayPanel ref={op}>
                <ContextButton icon={Files} label="Dokumente anfordern" onClick={dialogOeffnen} />
            </OverlayPanel>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Vorgang</h1>
                <Button label="Aktionen" mode="secondary" onClick={(e) => op.current?.toggle(e)} size="small" />
            </Row>
            <DividerBlock height={1} />
            <TaskEditor task={vorgang} />
        </div>
    );
}