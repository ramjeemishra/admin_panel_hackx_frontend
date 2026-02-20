export interface Team {
  _id: string;
  teamName: string;
  teamCode: string;

  lead: {
    name: string;
    email: string;
    phone?: string;
    gender?: string;
  };

  members?: any[];
  totalMembers?: number;
  attendance?: boolean;
  foodStatus?: any;

  qrUrl?: string;

  mailStatus?: "PENDING" | "SENT" | "FAILED";
  mailAttempts?: number;
  mailLastAttemptAt?: string | null;
}


export const fetchTeams = async (): Promise<Team[]> => {
  const res = await fetch("https://admin-panel-hackx-backend.onrender.com/api/teams");
  // const res = await fetch("http://localhost:5000/api/teams");
  return res.json();
};
