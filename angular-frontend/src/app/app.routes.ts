import { Routes } from '@angular/router';
import { LandingComponent } from './modules/landing/landing.component';
import { LoginComponent } from './modules/login/login.component';
import { AdminComponent } from './modules/admin/admin.component';
import { ComparadorComponent } from './modules/comparador/comparador.component';
import { authGuard } from './modules/services/auth.guard';


export const routes: Routes = [{ path:'', component:LandingComponent}
    ,{path:'comparar', component:ComparadorComponent}
    ,{path:'login', component:LoginComponent},
    // Impide entrar a /admin desde la URL cuando no hay una sesión iniciada.
    {path:'admin', component:AdminComponent, canActivate: [authGuard]}
    
];
