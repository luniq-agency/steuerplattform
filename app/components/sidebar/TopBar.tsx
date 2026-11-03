import { useRouter } from "next/navigation";
import { UserAvatar } from "../UserAvatar";
import styles from "./Sidebar.module.css"
import NotificationButton from "../notifications/NotificationButton";
import { useAuth } from "@/app/context/AuthContext";
import Row from "../layout/Row";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import { ContextButton } from "../buttons/Buttons";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export default function Topbar() {
    const { logout, userProfile } = useAuth();

    const op = useRef<OverlayPanel | null>(null);

    if (!userProfile) return;

    return (
        <div className={styles.topbar}>
            <OverlayPanel ref={op}>
                <ContextButton icon={User} label="Mein Profil" onClick={logout} />
                <ContextButton icon={LogOut} label="Abmelden" onClick={logout} />
            </OverlayPanel>
            <Row justifyContent="space-between">
                <Link href="/admin" style={{margin: 'auto 0px'}}>
                    <img alt="ADVACT Logo" src="/advact-logo-black.png" style={{ objectFit: 'contain' }} width={80} />
                </Link>
                <Row gap={8} width="fit-content">
                    <NotificationButton user={userProfile} />
                    <div onClick={op.current?.toggle} style={{ cursor: 'pointer' }}>
                        <UserAvatar fontSize={16} height={32} width={32} />
                    </div>
                </Row>
            </Row>
        </div>
    )
}