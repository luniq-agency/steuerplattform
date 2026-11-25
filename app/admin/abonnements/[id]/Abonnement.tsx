import SubscriptionEditor from "@/app/components/subscriptions/SubscriptionEditor";
import { Abonnement as Abo } from "@/app/types/abos";

interface Props {
    abo: Abo
}

export default function Abonnement({ abo }: Props) {
    return (
        <SubscriptionEditor abo={abo} />
    )
}