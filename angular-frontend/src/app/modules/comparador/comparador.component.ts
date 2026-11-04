import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FooterComponent } from '../shared/footer/footer.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { ComparadorService, DatosComparador, PestanaComparador } from '../services/comparador.service';

@Component({
  selector: 'app-comparador',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './comparador.component.html'
})
export class ComparadorComponent implements OnInit, OnDestroy {
  datos: DatosComparador | null = null;
  pestanaActiva: PestanaComparador = 'productos';
  private sub!: Subscription;

  constructor(private comparadorService: ComparadorService) {}

  ngOnInit(): void {
    this.sub = this.comparadorService.datos$.subscribe(datos => this.datos = datos);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  seleccionarPestana(pestana: PestanaComparador): void {
    this.pestanaActiva = pestana;
  }

  getAhorro(supermercado: string): number {
    if (!this.datos) return 0;
    return Math.max(0, this.datos.totalMasAlto - (this.datos.totalesPorSupermercado[supermercado] ?? 0));
  }

  getPorcentajeTotal(supermercado: string): number {
    if (!this.datos || this.datos.totalMasAlto === 0) return 0;
    return ((this.datos.totalesPorSupermercado[supermercado] ?? 0) / this.datos.totalMasAlto) * 100;
  }
}
