export type Dokument = {
    created_at: Date;
    file: string;
    id: number;
    name: string;
    ordner: string | number;
    type: string;
    user: string | number;
}

export type DokumentOrdner = {
    created_at: Date;
    id: number;
    name: string;
    parent: string | number | null;
    user: string | number;
}