import RechnungEditor from "@/app/components/shared/rechnungen/RechnungEditor";
import { User } from "@/app/types/Database";

interface Props {
    user?: User
}

export default function RechnungNeu({ user }: Props) {
    return (
        <RechnungEditor admin mandant={user} />
    )
}