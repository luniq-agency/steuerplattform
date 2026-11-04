'use client';

import DividerBlock from '@/app/components/DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import SkeletonGrid from '../../components/ui/loading/SkeletonGrid';
import LayoutColumn from "@/app/components/layout/Column";
import Link from 'next/link';
import Button from '@/app/components/buttons/Button';
import { CircleCheck, Clock, Euro, Plus } from 'lucide-react';
import Row from '@/app/components/layout/Row';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { User } from '@/app/types/Database';
import { fetchTeamMembers, putTeamMember } from '@/app/actions/clients/team/team';
import { Teammitglied } from '@/app/types/teams';
import { Dialog } from 'primereact/dialog';
import { TextInputLabel } from '@/app/components/forms/FormElements';
import { SelectLabel } from '@/app/components/inputs/Select';
import { userCreate } from '@/app/actions/users';
import StatCard from '@/app/components/cards/StatCard';

type TeamRolle = Teammitglied['rolle'];

const options: { label: string; value: TeamRolle }[] = [
    { label: 'Admin', value: 'Admin' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Buchhaltung', value: 'Buchhaltung' },
    { label: 'Mitglied', value: 'Mitglied' },
];

export default function Mitarbeiter() {
    const { team, userProfile } = useAuth();

    // STATES
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    // DATA
    const [members, setMembers] = useState<Teammitglied[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // INPUTS
    const [memberLastName, setMemberLastName] = useState('');
    const [memberName, setMemberName] = useState('');
    const [memberRole, setMemberRole] = useState<TeamRolle>('Admin');

    // INIT
    useEffect(() => {
        if (!team) return;
        const fetchData = async () => {
            setLoading(true);
            const res = await fetchTeamMembers(team.id);
            setMembers(res.members);
            setUsers(res.users);
            console.log("Users:", res.users)
        };
        fetchData();
        setLoading(false);
    }, [team]);

    // ACTIONS
    const createTeammember = async () => {
        if (!team) return;
        const userPayload = {
            nachname: memberLastName,
            vorname: memberName
        };
        const res = await userCreate(userPayload)
        const payload = {
            rolle: memberRole,
            team: team?.id,
            user: res.id,
        };
        await putTeamMember(payload)
        setVisible(false);
        const teamRes = await fetchTeamMembers(team.id);
        setMembers(teamRes.members);
        setUsers(teamRes.users);
        setMemberLastName('');
        setMemberName('');
        setMemberRole('Admin');
    }

    // TEMPLATES
    const userTemplate = (rowData: Teammitglied) => {
        const user = users.find((u) => u.id == rowData.user);
        if (!user) return
        return <span>{user.nachname}, {user.vorname}</span>
    }

    if (loading || !userProfile) return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Mitarbeiter</h1>
                <Row alignItems="center" gap={8} width="fit-content">
                    <Link href="/dashboard/mitarbeiter/neu">
                        <Button icon={Plus} label="Neuer Mitarbeiter" mode="secondary" size="small" />
                    </Link>
                </Row>
            </Row>
            <DividerBlock height={2} />
            <SkeletonGrid columns="1fr 1fr 1fr" count={3} gap={16} height="94.73px" width="100%" />
        </div>
    );

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Dialog header="Neues Teammitglied anlegen" onHide={() => setVisible(false)} style={{ maxWidth: 400 }} visible={visible}>
                <LayoutColumn gap={16}>
                    <TextInputLabel label="Vorname" onChange={setMemberName} value={memberName} />
                    <TextInputLabel label="Nachname" onChange={setMemberLastName} value={memberLastName} />
                    <SelectLabel label="Rolle" onChange={(v: string) => setMemberRole(v as TeamRolle)} optionLabel='label' optionValue='label' options={options} value={memberRole} />
                    <Button disabled={!memberName || !memberLastName} label="Teammitglied anlegen" onClick={createTeammember} />
                </LayoutColumn>
            </Dialog>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Mitarbeiter</h1>
                <Button icon={Plus} label="Neuer Mitarbeiter" mode="secondary" onClick={() => setVisible(true)} size="small" />
            </Row>
            <DividerBlock height={2} />
            <Row gap={16} style={{ opacity: statsLoading ? 0.5 : 1 }}>
                <StatCard header="Aktive Teammitglieder" value={members.length} />
                <StatCard header="Einladungen versendet" value={members.length} />
            </Row>
            <DividerBlock height={2} />
            <DataTable value={members}>
                <Column body={userTemplate} header="Name" />
                <Column field="rolle" header="Rolle" />
            </DataTable>
        </div>
    );
}