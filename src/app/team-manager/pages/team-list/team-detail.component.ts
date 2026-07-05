import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Důležité pro standalone komponenty, pokud používáš *ngIf, *ngFor atd.
import { FormsModule } from '@angular/forms'; // Pro [(ngModel)]
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Pro práci s routami
import { Observable, of, combineLatest } from 'rxjs'; // Pro simulaci asynchronních dat
import { delay, finalize, map, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddMemberFormComponent } from '../../../add-member-form.component'; // Předpokládám, že tato komponenta existuje
import { Team } from '../../../team.model'; // Import Team interface
import { Member, TeamMember, TeamMemberRole } from '../../../member.model'; // Import Member and TeamMember interfaces
import { TeamService } from '../../services/team.service'; // Přidáno TeamService
import { MemberService } from '../../services/member.service'; // Přidáno MemberService


@Component({
  selector: 'app-team-detail', // Zvol si vhodný selektor pro tuto komponentu
  standalone: true,
  imports: [CommonModule, FormsModule, AddMemberFormComponent, RouterModule], // Přidáno FormsModule a AddMemberFormComponent
  template: `
    @if (team$ | async; as team) {
      <div class="team-detail-container">
        <a routerLink="/teams" class="back-link">&larr; Zpět na seznam týmů</a>
        <div class="team-header">
          @if (isEditing) {
            <input type="text" [(ngModel)]="editedTeamName" class="team-name-input" (keyup.enter)="onSave(team.id)" (keyup.escape)="cancelEdit()">
            <div class="header-actions">
              <button (click)="onSave(team.id)" class="btn btn-success" [disabled]="isProcessing">Uložit</button>
              <button (click)="cancelEdit()" class="btn btn-secondary" [disabled]="isProcessing">Zrušit</button>
            </div>
          } @else {
            <h1>{{ team.name }}</h1>
            <div class="header-actions">
              <button (click)="startEdit(team.name)" class="btn btn-secondary">Upravit název</button>
              <button (click)="onDelete()" class="btn btn-danger" [disabled]="isProcessing">Smazat tým</button>
            </div>
          }
        </div>

        <div class="roster-section">
          <div class="roster-header">
            <h2>Soupiska ({{ team.roster.length }} členů)</h2>
            <button (click)="showAddMemberModal = true" class="btn btn-primary">Přidat člena</button>
          </div>

          @if (team.roster.length > 0) {
            <table class="roster-table">
              <thead>
                <tr>
                  <th>Jméno</th>
                  <th>Role</th>
                  <th>Pozice</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
              @for (rosterMember of team.roster; track rosterMember.member.id) {
                <tr>
                  @if (editingMemberId === rosterMember.member.id) {
                    <td colspan="4">
                      <div class="edit-member-form-row">
                        <span class="member-name-display">{{ rosterMember.member.name }}</span>
                        <select [(ngModel)]="editedMemberRole">
                          @for(role of roles; track role) {
                            <option [value]="role">{{ role }}</option>
                          }
                        </select>
                        <input type="text" [(ngModel)]="editedMemberPosition" placeholder="Pozice">
                        <div class="item-actions">
                          <button (click)="onSaveMember(team.id, rosterMember.member.id)" class="btn-icon" [disabled]="actionInProgressMemberId === rosterMember.member.id">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-save"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                          </button>
                          <button (click)="cancelMemberEdit()" class="btn-icon" [disabled]="actionInProgressMemberId === rosterMember.member.id">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-cancel"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    </td>
                  } @else {
                    <td><span class="member-name">{{ rosterMember.member.name }}</span></td>
                    <td><span class="member-role">{{ rosterMember.role }}</span></td>
                    <td>
                      <span class="member-position">{{ rosterMember.position }}</span>
                      @if (!rosterMember.position) {
                        <span class="member-position-placeholder">(Nezadáno)</span>
                      }
                    </td>
                    <td>
                      <div class="item-actions">
                        <button (click)="startMemberEdit(rosterMember)" class="btn-icon" [disabled]="actionInProgressMemberId === rosterMember.member.id">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-edit"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                        </button>
                        <button (click)="onRemoveMember(rosterMember.member.id)" class="btn-icon" [disabled]="actionInProgressMemberId === rosterMember.member.id">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-delete"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  }
                </tr>
              }
              </tbody>
            </table>
          } @else {
            <div class="empty-state">
              <p>Tento tým zatím nemá žádné členy.</p>
            </div>
          }
        </div>
      </div>
    } @else {
      <div class="loading-state">Načítám detail týmu...</div>
    }

    @if (showAddMemberModal) {
      <app-add-member-form
        [availableMembers]="availableMembers$ | async"
        [isSubmitting]="isSubmittingMember"
        [error]="addMemberError"
        (add)="onAddMember($event)"
        (close)="showAddMemberModal = false"
      ></app-add-member-form>
    }
  `,
  styles: [`
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      padding: 0.5rem 1rem;
      background-color: #6c757d; /* Barva jako btn-secondary */
      color: white;
      text-decoration: none;
      border-radius: 0.25rem;
      transition: background-color 0.15s ease-in-out;
    }
    .back-link:hover {
      background-color: #5a6268;
    }

    :host {
      display: block;
    }

    .team-detail-container {
      max-width: 900px;
      margin: 2rem auto;
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .team-header, .roster-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .team-header h1 {
      margin: 0;
      font-size: 2.25rem;
      color: #343a40;
      font-weight: 700;
    }

    .roster-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #495057;
    }

    .header-actions, .item-actions {
      display: flex;
      gap: 0.75rem;
    }

    .team-name-input {
      font-size: 2.25rem;
      font-weight: 700;
      padding: 0.5rem;
      border: 2px solid #007bff;
      border-radius: 4px;
      flex-grow: 1;
      margin-right: 1rem;
    }

    .roster-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .roster-table th, .roster-table td {
      text-align: left;
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .roster-table th {
      background-color: #f8f9fa;
      color: #495057;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.5px;
    }

    .roster-table tbody tr:hover {
      background-color: #f1f3f5;
    }

    .edit-member-form-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding: 0.5rem 0;
    }

    .edit-member-form-row .member-name-display {
      flex-grow: 1;
      font-weight: 500;
    }

    .edit-member-form-row select, .edit-member-form-row input {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      min-width: 150px;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      color: #6c757d;
      transition: color 0.15s ease-in-out;
    }

    .btn-icon:hover { color: #343a40; }
    .btn-icon:disabled { color: #ced4da; cursor: not-allowed; }
    .icon-edit, .icon-delete, .icon-save, .icon-cancel { width: 1.6rem; height: 1.6rem; }
    .icon-save { color: #28a745; }
    .icon-save:hover { color: #218838; }
    .icon-delete { color: #dc3545; }
    .icon-delete:hover { color: #c82333; }
  `]
})
export class TeamDetailComponent implements OnInit {
  team$: Observable<Team | undefined> = of(undefined); // Using imported Team interface
  availableMembers$: Observable<Member[]> = of([]); // Placeholder pro dostupné členy

  isEditing: boolean = false;
  editedTeamName: string = '';
  isProcessing: boolean = false; // Pro akce s týmem (uložit/smazat)

  showAddMemberModal: boolean = false;
  editingMemberId: string | null = null;
  editedMemberRole: TeamMemberRole | null = null; // Corrected type
  editedMemberPosition: string = '';
  actionInProgressMemberId: string | null = null; // Pro akce s členy (editovat/smazat)
  addMemberError: string | null = null;
  isSubmittingMember: boolean = false;

  roles: TeamMemberRole[] = ['Hráč', 'Trenér', 'Hráč i trenér']; // Příklad rolí

  private destroyRef = inject(DestroyRef);

  constructor(private route: ActivatedRoute,
              private router: Router,
              private teamService: TeamService, // Injektováno TeamService
              private memberService: MemberService, // Injektováno MemberService
              private cdr: ChangeDetectorRef, // Injektováno pro manuální detekci změn
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntilDestroyed(this.destroyRef) // Automaticky se odhlásí při zničení komponenty
    ).subscribe(params => {
      const teamId = params.get('id');
      if (teamId) {
        // Simulace načítání dat týmu
        this.team$ = this.teamService.getTeamById(teamId); // Načítání dat týmu ze služby

        // Načítání dostupných členů, kteří ještě nejsou v žádném týmu
        this.availableMembers$ = combineLatest([
          this.memberService.getAvailableMembers(),
          this.teamService.teams$
        ]).pipe(
          map(([allMembers, allTeams]) => {
            const assignedMemberIds = new Set<string>();
            allTeams.forEach(team => {
              team.roster.forEach(rosterMember => {
                assignedMemberIds.add(rosterMember.member.id);
              });
            });
            return allMembers.filter(member => !assignedMemberIds.has(member.id));
          })
        );
      }
    });
  }

  startEdit(teamName: string): void {
    this.isEditing = true;
    this.editedTeamName = teamName;
  }

  onSave(teamId: string): void {
    this.isProcessing = true;
    this.teamService.updateTeam(teamId, { name: this.editedTeamName }).pipe( // Použití služby pro aktualizaci
      finalize(() => {
        this.isProcessing = false;
        this.isEditing = false;
      }),
      switchMap(() => this.teamService.getTeamById(teamId)) // Znovu načíst data pro aktuální stav
    ).subscribe({
      next: (updatedTeam) => {
        this.team$ = of(updatedTeam); // Aktualizovat observable s novými daty
      },
      error: (err: any) => console.error('Chyba při aktualizaci týmu:', err)
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editedTeamName = '';
  }

  onDelete(): void {
    if (confirm('Opravdu chcete smazat tento tým?')) {
      this.isProcessing = true;
      this.team$.pipe(
        take(1),
        switchMap(team => {
          if (team) {
            return this.teamService.deleteTeam(team.id); // Použití služby pro smazání
          }
          return of(undefined);
        }),
        finalize(() => {
          this.isProcessing = false;
          this.router.navigate(['/teams']); // Navigace zpět na seznam týmů
        })
      ).subscribe({
        error: (err: any) => console.error('Chyba při mazání týmu:', err)
      });
    }
  }

  startMemberEdit(member: TeamMember): void {
    this.editingMemberId = member.member.id;
    this.editedMemberRole = member.role; // Now correctly typed as TeamMemberRole
    this.editedMemberPosition = member.position;
  }

  onSaveMember(teamId: string, memberId: string): void {
    this.actionInProgressMemberId = memberId;
    console.log(`Saving member ${memberId} for team ${teamId} with role: ${this.editedMemberRole}, position: ${this.editedMemberPosition}`);
    if (this.editedMemberRole === null) {
      console.error('Role člena nemůže být prázdná.');
      this.actionInProgressMemberId = null;
      return;
    }
    this.teamService.updateTeamMember(teamId, memberId, { role: this.editedMemberRole!, position: this.editedMemberPosition }).pipe( // Použití služby pro aktualizaci člena
      finalize(() => {
        this.actionInProgressMemberId = null;
        this.editingMemberId = null;
      }),
      switchMap(() => this.teamService.getTeamById(teamId)) // Znovu načíst data pro aktuální stav
    ).subscribe({
      next: (updatedTeam) => {
        this.team$ = of(updatedTeam);
      },
      error: (err: any) => console.error('Chyba při aktualizaci člena týmu:', err)
    });
  }

  cancelMemberEdit(): void {
    this.editingMemberId = null;
    this.editedMemberRole = null; // Corrected type
    this.editedMemberPosition = '';
  }

  onRemoveMember(memberId: string): void {
    if (confirm('Opravdu chcete odebrat tohoto člena ze soupisky?')) {
      this.actionInProgressMemberId = memberId;
      this.team$.pipe(
        take(1),
        switchMap(team => {
          if (team) {
            return this.teamService.removeMemberFromTeam(team.id, memberId).pipe( // Použití služby pro odebrání člena
              switchMap(() => this.teamService.getTeamById(team.id)) // Znovu načíst data pro aktuální stav
            );
          }
          return of(undefined);
        }),
        finalize(() => {
          this.actionInProgressMemberId = null;
        })
      ).subscribe({
        next: (updatedTeam) => {
          this.team$ = of(updatedTeam);
        },
        error: (err: any) => console.error('Chyba při odebírání člena týmu:', err)
      });
    }
  }

  onAddMember(event: { memberId: string; role: TeamMemberRole; position: string }): void { // Using TeamMemberRole
    this.isSubmittingMember = true;
    this.addMemberError = null;
    this.team$.pipe(
      take(1),
      delay(2000), // Přidáno 2s zpoždění PŘED akcí
      switchMap(team => {
        if (team) {
          return this.teamService.addMemberToTeam(team.id, event.memberId, event.role, event.position).pipe( // Použití služby pro přidání člena
            switchMap(() => this.teamService.getTeamById(team.id)) // Znovu načíst data pro aktuální stav
          );
        }
        return of(undefined);
      }),
    ).subscribe({
      next: (updatedTeam) => {
        if (updatedTeam) {
          this.team$ = of(updatedTeam);
        }
        this.isSubmittingMember = false;
        this.showAddMemberModal = false; // Zavře modální okno po úspěšném přidání
        this.cdr.markForCheck(); // Manuálně spustí detekci změn
      },
      error: (err: any) => {
        this.addMemberError = err.message || 'Nepodařilo se přidat člena.';
        console.error('Chyba při přidávání člena:', err);
        this.isSubmittingMember = false; // Zastaví načítání v případě chyby
        this.cdr.markForCheck(); // Manuálně spustí detekci změn
      }
    });
  }
}