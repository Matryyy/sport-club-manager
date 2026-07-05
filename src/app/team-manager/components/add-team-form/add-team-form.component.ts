import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-team-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-team-form.component.html',
  styleUrls: ['./add-team-form.component.css']
})
export class AddTeamFormComponent {
  @Input() isSubmitting = false;
  @Output() add = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  teamName: string = '';
  error: string | null = null; // Přidáno pro zobrazení chyby

  onSubmit(): void {
    if (!this.teamName.trim()) {
      this.error = 'Název týmu nesmí být prázdný.';
      return;
    }
    this.error = null; // Vyčistíme chybu, pokud je formulář platný
    this.add.emit(this.teamName);
  }

  onClose(): void {
    this.teamName = '';
    this.error = null; // Vyčistíme chybu při zavření
    this.close.emit();
  }
}
