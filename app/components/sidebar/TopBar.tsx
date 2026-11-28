'use client';

import { useRouter } from "next/navigation";
import { UserAvatar } from "../UserAvatar";
import styles from "./Sidebar.module.css";
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
    const router = useRouter();
    const op = useRef<OverlayPanel>(null);

    if (!userProfile) return null;

    return (
        <div className={styles.topbar}>
            <OverlayPanel ref={op}>
                <ContextButton
                    icon={User}
                    label="Mein Profil"
                    onClick={() => {
                        op.current?.hide();
                        router.push("/profil");
                    }}
                />
                <ContextButton
                    icon={LogOut}
                    label="Abmelden"
                    onClick={() => {
                        op.current?.hide();
                        logout();
                    }}
                />
            </OverlayPanel>

            <Row justifyContent="space-between">
                <Link href="/admin" style={{ margin: "auto 0px" }}>
                    <img alt="ADVACT Logo" src="/advact-logo-black.png" style={{ objectFit: "contain" }} width={80} />
                </Link>
                <Row gap={8} width="fit-content">
                    <NotificationButton user={userProfile} />
                    <button
                        type="button"
                        onClick={(e) => op.current?.toggle(e)}
                        aria-label="Profilmenü öffnen"
                        aria-haspopup="menu"
                        style={{ background: "none", border: 0, padding: 0, cursor: "pointer", borderRadius: "50%" }}
                    >
                        <UserAvatar fontSize={16} height={32} width={32} />
                    </button>
                </Row>
            </Row>
        </div>
    );
}