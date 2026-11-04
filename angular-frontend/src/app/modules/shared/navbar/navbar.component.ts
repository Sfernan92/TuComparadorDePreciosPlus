import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscadorComponent } from '../buscador/buscador.component'; 
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, BuscadorComponent, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  // El símbolo $ indica que el valor cambia con el tiempo y se lee con | async en el HTML.
  readonly sesionIniciada$: Observable<boolean>;

  constructor(private authService: AuthService) {
    // El servicio ya existe dentro del constructor, así que la asignación es segura.
    this.sesionIniciada$ = this.authService.sesionIniciada$;
  }

}
