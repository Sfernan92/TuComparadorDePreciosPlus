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
  // Listas preparadas para el podio: tres mejores y el resto, en orden de precio.
  supermercadosOrdenados: string[] = [];
  podioVisual: string[] = [];
  supermercadosRestantes: string[] = [];
  private sub!: Subscription;

  constructor(private comparadorService: ComparadorService) {}

  ngOnInit(): void {
    this.sub = this.comparadorService.datos$.subscribe(datos => {
      this.datos = datos;

      // Copiamos el array antes de ordenar para no alterar los datos originales del servicio.
      this.supermercadosOrdenados = [...datos.supermercados].sort(
        (primero, segundo) =>
          (datos.totalesPorSupermercado[primero] ?? 0) -
          (datos.totalesPorSupermercado[segundo] ?? 0)
      );

      // En el podio el segundo se dibuja a la izquierda, el primero al centro y el tercero a la derecha.
      this.podioVisual = [
        this.supermercadosOrdenados[1],
        this.supermercadosOrdenados[0],
        this.supermercadosOrdenados[2]
      ].filter((supermercado): supermercado is string => supermercado !== undefined);

      this.supermercadosRestantes = this.supermercadosOrdenados.slice(3);
    });
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

  // Convierte la posición dentro del array ordenado en un puesto visible: 1, 2, 3...
  getPuesto(supermercado: string): number {
    return this.supermercadosOrdenados.indexOf(supermercado) + 1;
  }

  // Calcula cuánto cuesta una opción respecto a la más barata, para mostrar +X €.
  getDiferencia(supermercado: string): number {
    if (!this.datos) return 0;
    return Math.max(0, (this.datos.totalesPorSupermercado[supermercado] ?? 0) - this.datos.totalMasBajo);
  }

  // Devuelve una clase según la posición, para dar una altura distinta a cada escalón del podio.
  getClasePodio(supermercado: string): string {
    return `comparador-podio-puesto-${this.getPuesto(supermercado)}`;
  }

  // Los iconos son solo decorativos: los productos siguen llegando de la API con id y nombre.
  // Normalizamos el texto para que "Plátanos" y "platanos" encuentren el mismo icono.
  obtenerIconoProducto(nombre: string): string {
    const nombreNormalizado = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const iconos: [string, string][] = [
      ['tomate', '🍅'], ['lech', '🥛'], ['platano', '🍌'], ['banana', '🍌'],
      ['manzana', '🍎'], ['pera', '🍐'], ['naranja', '🍊'], ['fresa', '🍓'],
      ['uva', '🍇'], ['limon', '🍋'], ['sandia', '🍉'], ['melon', '🍈'],
      ['patata', '🥔'], ['papa', '🥔'], ['zanahoria', '🥕'], ['cebolla', '🧅'],
      ['pimiento', '🫑'], ['brocoli', '🥦'], ['lechuga', '🥬'], ['pollo', '🍗'],
      ['carne', '🥩'], ['pescado', '🐟'], ['atun', '🐟'], ['huevo', '🥚'],
      ['pan', '🍞'], ['pasta', '🍝'], ['arroz', '🍚'], ['pizza', '🍕'],
      ['queso', '🧀'], ['yogur', '🥣'], ['cafe', '☕'], ['aceite', '🫒'],
      ['chocolate', '🍫'], ['helado', '🍦'], ['galleta', '🍪']
    ];

    return iconos.find(([texto]) => nombreNormalizado.includes(texto))?.[1] ?? '🛍️';
  }
}
