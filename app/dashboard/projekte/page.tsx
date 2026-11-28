import { Metadata } from "next";
import Projekte from "./Projekte";

export const metadata: Metadata = {
    title: 'Projekte | ADVACT',
    description: '',
};

export default function Page() {

    return (
        <Projekte />
    )
}