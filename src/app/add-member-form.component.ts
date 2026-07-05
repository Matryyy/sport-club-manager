import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member, TeamMemberRole } from './member.model'; // Import Member and TeamMemberRole interfaces

@Component({
  selector: 'app-add-member-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Přidat nového člena týmu</h3>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="member">Vyberte člena:</label>
            <select id="member" [(ngModel)]="selectedMemberId" name="selectedMemberId" required>
              <option [value]="null" disabled>-- Vyberte člena --</option>
              @for (member of availableMembers; track member.id) {
                <option [value]="member.id">{{ member.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="role">Role:</label>
            <select id="role" [(ngModel)]="memberRole" name="memberRole" required>
              <option [value]="null" disabled>-- Vyberte roli --</option>
              @for (role of roles; track role) {
                <option [value]="role">{{ role }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="position">Pozice:</label>
            <input type="text" id="position" [(ngModel)]="memberPosition" name="memberPosition" placeholder="Např. Útočník, Brankář" required>
          </div>

          @if (error) {
            <p class="error-message">{{ error }}</p>
          }

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting || !selectedMemberId || !memberRole || !memberPosition">
              {{ isSubmitting ? 'Přidávám...' : 'Přidat' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="close.emit()" [disabled]="isSubmitting">Zrušit</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./add-member-form.component.css']
})
export class AddMemberFormComponent {
  @Input() availableMembers: Member[] | null = [];
  @Input() isSubmitting: boolean = false;
  @Input() error: string | null = null;

  @Output() add = new EventEmitter<{ memberId: string; role: TeamMemberRole; position: string }>();
  @Output() close = new EventEmitter<void>();

  selectedMemberId: string | null = null;
  memberRole: TeamMemberRole | null = null;
  memberPosition: string = '';

  roles: TeamMemberRole[] = ['Hráč', 'Trenér', 'Hráč i trenér']; // Use TeamMemberRole type

  onSubmit(): void {
    if (this.selectedMemberId && this.memberRole && this.memberPosition) {
      this.add.emit({
        memberId: this.selectedMemberId,
        role: this.memberRole,
        position: this.memberPosition
      });
    }
  }
}