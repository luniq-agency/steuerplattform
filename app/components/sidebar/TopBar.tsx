import { useRouter } from "next/navigation";
import { UserAvatar } from "../UserAvatar";
import styles from "./Sidebar.module.css"
import NotificationButton from "../notifications/NotificationButton";
import { useAuth } from "@/app/context/AuthContext";
import Row from "../layout/Row";

export default function Topbar() {
    const { userProfile } = useAuth();
    const router = useRouter();

    if (!userProfile) return;

    return (
        <div className={styles.topbar}>
            <Row gap={8} width="fit-content">
                <NotificationButton user={userProfile} />
                <UserAvatar fontSize={16} height={32} width={32} />
            </Row>
        </div>
    )
}