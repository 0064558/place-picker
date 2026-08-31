import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';


bootstrapApplication(AppComponent, {
    providers: [provideHttpClient()] // Adicionando o provedor do HttpClient para permitir requisições HTTP na aplicação.
}).catch((err) => console.error(err));
