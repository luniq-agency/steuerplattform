export type Team = {
    created_at: Date;
    created_by: string | number;
    id: number;
    team_logo: string;
    team_name: string;
}

export type Teammitglied = {
    created_at: Date;
    id: number;
    rolle: 'Admin' | 'Manager' | 'Buchhaltung' | 'Mitglied';
    team: string | number;
    user: string | number;
}