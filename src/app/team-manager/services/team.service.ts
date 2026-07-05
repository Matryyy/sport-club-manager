import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, take } from 'rxjs/operators'; // Import take
import { TeamMember, TeamMemberRole } from '../../member.model';
import { Team } from '../../team.model'; // Import Team interface
import { MemberService } from './member.service';
@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly STORAGE_KEY = 'sport-club-teams';
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$: Observable<Team[]> = this.teamsSubject.asObservable();
  
  constructor(private memberService: MemberService) {
    this.loadTeamsFromStorage();
  }
  
  private loadTeamsFromStorage(): void {
    try{
      const storedTeams = localStorage.getItem(this.STORAGE_KEY); // Explicitly type 'teams'
      const teams: Team[] = storedTeams ? JSON.parse(storedTeams) : [];
      this.teamsSubject.next(teams);
    } catch (e) {
      console.error('Chyba při načítání týmu z localStorage')
      this.teamsSubject.next([]);
    }

  }

  getTeamById(id: string): Observable<Team | undefined> {
    return this.teams$.pipe(
      map(teams => teams.find(team => team.id === id))
    );
  }

  private saveTeamsToStorage(): void {
    try{
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.teamsSubject.value));
    } catch (e) {
      console.error('Chyba při ukládání týmu do localStorage', e);
    }
  }

  addTeam(name: string): Observable<Team> {
    const currentTeams = this.teamsSubject.getValue();
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      roster: []
    };
    this.teamsSubject.next([...currentTeams, newTeam]);
    this.saveTeamsToStorage();
    return of(newTeam);
  }

  updateTeam(id: string, updates: { name: string }): Observable<Team | undefined> {
    const currentTeams = this.teamsSubject.getValue();
    const teamIndex = currentTeams.findIndex(team => team.id === id);

    if (teamIndex > -1) {
      const updatedTeams = [...currentTeams];
      updatedTeams[teamIndex] = { ...updatedTeams[teamIndex], ...updates };
      this.teamsSubject.next(updatedTeams);
      this.saveTeamsToStorage();
      return of(updatedTeams[teamIndex]);
    }

    return of(undefined);
  }

  addMemberToTeam(teamId: string, memberId: string, role: TeamMemberRole, position: string): Observable<Team | undefined> {
    const currentTeams = this.teamsSubject.getValue();
    const member = this.memberService.getMemberById(memberId);

    if (!member) {
      return throwError(() => new Error('Člen nebyl nalezen.'));
    }

    // Zkontrolujeme, zda člen již není v nějakém týmu
    const isAlreadyInATeam = currentTeams.some((team: Team) => // Explicitly type 'team'
      team.roster.some(m => m.member.id === memberId)
    );

    if (isAlreadyInATeam) {
      console.error('Tento člen je již v jiném týmu a nemůže být přidán znovu.');
      return throwError(() => new Error('Člen je již v jiném týmu.'));
    }
    
    const newTeamMember: TeamMember = { member, role, position };
    const teamIndex = currentTeams.findIndex(t => t.id === teamId);

    if (teamIndex > -1) {
      const updatedTeams = [...currentTeams];
      const teamToUpdate = { ...updatedTeams[teamIndex] };

      teamToUpdate.roster = [...teamToUpdate.roster, newTeamMember];
      updatedTeams[teamIndex] = teamToUpdate;
      this.teamsSubject.next(updatedTeams);
      this.saveTeamsToStorage();
      return of(teamToUpdate);
    }
    return of(undefined);
  }

  updateTeamMember(teamId: string, memberId: string, updates: { role: TeamMemberRole; position: string }): Observable<Team | undefined> {
    const currentTeams = this.teamsSubject.getValue();
    const teamIndex = currentTeams.findIndex(team => team.id === teamId);

    if (teamIndex > -1) {
      const updatedTeams = [...currentTeams];
      const teamToUpdate = { ...updatedTeams[teamIndex] };
      const memberIndex = teamToUpdate.roster.findIndex((tm: TeamMember) => tm.member.id === memberId); // Explicitly type 'tm'

      if (memberIndex > -1) {
        const updatedRoster = [...teamToUpdate.roster];
        updatedRoster[memberIndex] = { ...updatedRoster[memberIndex], ...updates };
        teamToUpdate.roster = updatedRoster;
        updatedTeams[teamIndex] = teamToUpdate;

        this.teamsSubject.next(updatedTeams);
        this.saveTeamsToStorage();
        return of(teamToUpdate);
      }
    }
    return of(undefined);
  }

  removeMemberFromTeam(teamId: string, memberId: string): Observable<void> {
    const currentTeams = this.teamsSubject.getValue();
    const teamIndex = currentTeams.findIndex(team => team.id === teamId);

    if (teamIndex > -1) {
      const updatedTeams = [...currentTeams];
      const teamToUpdate = { ...updatedTeams[teamIndex] };
      teamToUpdate.roster = teamToUpdate.roster.filter((tm: TeamMember) => tm.member.id !== memberId); // Explicitly type 'tm'
      updatedTeams[teamIndex] = teamToUpdate;
      this.teamsSubject.next(updatedTeams);
      this.saveTeamsToStorage();
    }
    return of(undefined);
  }

  deleteTeam(id: string): Observable<void> {
    const currentTeams = this.teamsSubject.getValue();
    const updatedTeams = currentTeams.filter(team => team.id !== id);
    this.teamsSubject.next(updatedTeams);
    this.saveTeamsToStorage();
    return of(undefined);
  }
}
