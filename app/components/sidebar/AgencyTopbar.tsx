"use client"

import Link from "next/link";
import styles from "./Sidebar.module.css";
import { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { LogOut, Menu } from "lucide-react";
import { ContextButton } from "../buttons/Buttons";
import { useAuth } from "@/app/context/AuthContext";

export default function AgencyTopbar() {
    const { logout } = useAuth();

    // STATES
    const [visible, setVisible] = useState(false);

    return (
        <div className={styles.agencyTopbar}>
            <Sidebar header={() => <img src="/advact-logo-black.png" style={{ objectFit: 'contain' }} width={80} />} onHide={() => setVisible(false)} position="right" visible={visible}>
                <ContextButton icon={LogOut} label="Abmelden" onClick={logout} />
            </Sidebar>
            <Link href="/agentur" style={{ margin: 'auto 0px' }}>
                <img alt="ADVACT Logo" src="/advact-logo-black.png" style={{ objectFit: 'contain' }} width={80} />
            </Link>
            <div onClick={() => setVisible(true)}>
                <Menu />
            </div>
        </div>
    )
}