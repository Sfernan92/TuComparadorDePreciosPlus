import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ToastComponent } from '../toast/toast.component';
import { BuscadorComponent } from '../shared/buscador/buscador.component';
import { SeleccionService } from '../services/seleccion.service';
import { ComparadorService, DatosComparador } from '../services/comparador.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent, ToastComponent, BuscadorComponent],
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit, OnDestroy {
  datos: DatosComparador | null = null;
  // Controla si el panel lateral de edición de la cesta está visible.
  panelCestaAbierto = false;
  private sub!: Subscription;

  constructor(
    private seleccionService: SeleccionService,
    private comparadorService: ComparadorService
  ) {}

  ngOnInit(): void {
    this.sub = this.comparadorService.datos$.subscribe(datos => this.datos = datos);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  quitarProducto(id: number): void {
    this.seleccionService.quitarId(id);
  }

  // Muestra el panel lateral de edición.
  abrirPanelCesta(): void {
    this.panelCestaAbierto = true;
  }

  // Oculta el panel lateral de edición.
  cerrarPanelCesta(): void {
    this.panelCestaAbierto = false;
  }

}
