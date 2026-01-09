export interface Team {
  _id: string;
  teamName: string;
  lead: {
    name: string;
    email: string;
    phone: string;
    gender: string;
  };
  members: {
    fullName: string;
    email: string;
    phone: string;
  }[];
}

export const fetchTeams = async (): Promise<Team[]> => {
  const res = await fetch("https://admin-panel-hackx-backend.onrender.com/api/teams");
  return res.json();
};
