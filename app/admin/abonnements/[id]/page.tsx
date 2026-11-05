import Abonnement from "./Abonnement";
import { fetchAboById } from "@/app/actions/finance/abos";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Abonnement | ADVACT',
    description: '',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const abo = await fetchAboById(Number(id));
    if (!abo) return;

    return (
        <Abonnement abo={abo} />
    )
}