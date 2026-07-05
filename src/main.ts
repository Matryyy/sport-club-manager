import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // Zaregistruje routy pro celou aplikaci
    provideRouter(routes)
  ]
}).catch(err => console.error(err));