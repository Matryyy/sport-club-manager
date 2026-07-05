export interface Member {
  id: string;
  name: string;
}

export type TeamMemberRole = 'Hráč' | 'Trenér' | 'Hráč i trenér';

export interface TeamMember {
  member: Member;
  role: TeamMemberRole;
  position: string;
}
