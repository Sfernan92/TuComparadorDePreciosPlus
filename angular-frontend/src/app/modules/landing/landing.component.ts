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
  // Indica que el panel sigue visible, pero está reproduciendo su animación de salida.
  cerrandoPanelCesta = false;
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

  // Muestra el panel y prepara su animación de entrada.
  abrirPanelCesta(): void {
      this.cerrandoPanelCesta = false;
     this.panelCestaAbierto = true;
    }

  // Inicia la animación de salida, pero todavía no elimina el panel.
  cerrarPanelCesta(): void {
    this.cerrandoPanelCesta = true;
  }

  // Se ejecutará al terminar la animación de salida.
  terminarCierrePanel(): void {
    // Si ha terminado la animación de entrada, no hacemos nada.
    if (!this.cerrandoPanelCesta) {
      return;
    }

    // Cuando termina la salida, Angular ya puede eliminar el panel.
    this.panelCestaAbierto = false;
    this.cerrandoPanelCesta = false;
  }

}
