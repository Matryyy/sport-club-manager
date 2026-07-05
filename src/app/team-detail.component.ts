import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Důležité pro standalone komponenty, pokud používáš *ngIf, *ngFor atd.

@Component({
  selector: 'app-team-detail', // Zvol si vhodný selektor pro tuto komponentu
  standalone: true,
  imports: [CommonModule], // Přidej CommonModule, pokud budeš používat běžné Angular direktivy
  template: `
    <h2>Detail týmu</h2>
    <p>Zde se zobrazí podrobnosti o týmu.</p>
    <!-- Zde můžeš později přidat další obsah komponenty -->
  `,
  styleUrls: ['./team-detail.component.css'] // Předpokládá se, že tento soubor existuje nebo ho vytvoříš
})
export class TeamDetailComponent {
  // Zde bude logika komponenty
}