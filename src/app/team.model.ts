import { TeamMember } from './member.model';
 
export interface Team {
  id: string;
  name: string;
  roster: TeamMember[];
}
