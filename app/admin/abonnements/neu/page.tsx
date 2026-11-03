import { Metadata } from 'next';
import SubscriptionEditor from "@/app/components/subscriptions/SubscriptionEditor";

export const metadata: Metadata = {
    title: 'Abo anlegen | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <div className="page-content column" style={{ padding: 0 }}>
            <SubscriptionEditor />
        </div>
    )
}