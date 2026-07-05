import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable, finalize, combineLatest, map, startWith, debounceTime } from 'rxjs';
import { Team } from '../../../team.model';
import { TeamService } from '../../services/team.service';
import { AddTeamFormComponent } from '../../components/add-team-form/add-team-form.component';
import { TeamCardComponent } from '../../components/team-card/team-card.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.html',
  styleUrls: ['./team-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterModule, AddTeamFormComponent, TeamCardComponent, ReactiveFormsModule],
})
export class TeamListComponent implements OnInit {
  teams$!: Observable<Team[]>;
  showAddTeamModal = false;
  isAddingTeam = false;
  searchControl = new FormControl<string>('');
  filteredTeams$!: Observable<Team[]>;

  constructor(
    private teamService: TeamService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.teams$ = this.teamService.teams$;

    this.filteredTeams$ = combineLatest([
      this.teams$,
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300) // Zpoždění 300ms pro lepší UX při psaní
      )
    ]).pipe(
      map(([teams, searchTerm]) => {
        const lowerCaseSearchTerm = searchTerm?.toLowerCase() ?? '';
        if (!lowerCaseSearchTerm) {
          return teams;
        }
        return teams.filter(team =>
          team.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          team.roster.some(rosterMember =>
            rosterMember.member.name.toLowerCase().includes(lowerCaseSearchTerm)
          )
        );
      })
    );
  }

  onAddTeam(name: string) {
    this.isAddingTeam = true;
    this.teamService.addTeam(name).pipe(finalize(() => this.isAddingTeam = false)).subscribe({
      next: () => {
        this.showAddTeamModal = false;
      },
      error: (err) => console.error('Chyba při přidávání týmu:', err),
    });
  }

  onNavigateToTeam(teamId: string) {
    this.router.navigate(['/teams', teamId]);
  }
}
