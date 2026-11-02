import { Id } from './common';

export type Vorgang = {
  bearbeiter: number;
  beschreibung: string;
  created_at: Date;
  created_by: number | null;
  dokumente: Id[] | null;
  due_date: Date;
  id: number;
  kategorie: string;
  last_updated: Date;
  opened_advact: boolean;
  opened_client: boolean;
  status: string;
  titel: string;
  user: number;
};

export type Vorgangupdate = {
  body: string;
  created_at: Date;
  created_by: number;
  dokumente: Id[] | null;
  id: number;
  vorgang: number;
};
