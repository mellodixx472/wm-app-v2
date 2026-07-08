export interface Goal {
  name: string;
  minute: string;
  penalty?: boolean;
  owngoal?: boolean;
}

/** Spielstand: ht = Halbzeit, ft = reguläre Spielzeit, et = nach Verlängerung, p = Elfmeterschießen */
export interface Score {
  ht?: [number, number];
  ft: [number, number];
  et?: [number, number];
  p?: [number, number];
}

export interface Match {
  round: string;
  /** Spielnummer, nur bei K.o.-Spielen vorhanden */
  num?: number;
  date: string;
  time?: string;
  /** Teamname oder Platzhalter wie "W95" (Sieger Spiel 95) / "L101" (Verlierer Spiel 101) */
  team1: string;
  team2: string;
  /** Fehlt bei noch nicht gespielten Partien */
  score?: Score;
  goals1?: Goal[];
  goals2?: Goal[];
  /** Nur bei Gruppenspielen, z. B. "Group A" */
  group?: string;
  ground?: string;
}

export interface Tournament {
  name: string;
  matches: Match[];
}

export type DataSource = "live" | "snapshot";
