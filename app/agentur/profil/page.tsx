import DividerBlock from "@/app/components/DividerBlock";
import Row from "@/app/components/layout/Row";
import ProfileEditor from "@/app/components/shared/profil/ProfilEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Profil bearbeiten | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Mein Profil</h1>
            </Row>
            <DividerBlock height={1} />
            <ProfileEditor />
        </div>
    )
}