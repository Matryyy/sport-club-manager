import { Routes } from '@angular/router';

import { TeamListComponent } from './team-manager/pages/team-list/team-list.component';
import { TeamDetailComponent } from './team-manager/pages/team-list/team-detail.component';

export const routes: Routes = [
  {
    // Cesta pro zobrazení seznamu týmů
    path: 'teams', component: TeamListComponent
  },
  {
    path: 'teams/:id', component: TeamDetailComponent
  },
  { path: '', redirectTo: '/teams', pathMatch: 'full' }
];
