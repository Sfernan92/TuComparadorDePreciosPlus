import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ToastComponent } from '../toast/toast.component';
import { HttpClient } from '@angular/common/http';
import { SeleccionService } from '../services/seleccion.service';
import { Subscription } from 'rxjs';
import { BuscadorComponent } from '../shared/buscador/buscador.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ToastComponent, BuscadorComponent],
  templateUrl: './landing.component.html',
  // styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  precios: any[] = [];
  categorias: string[] = [];
  supermercados: string[] = [];
  productos: { id: number; nombre: string }[] = [];
  
  productosElegidos: {
  id: number;
  nombre: string;
  categoria: string;
  precioMinimo: number;
  supermercadoMasBarato: string;
 }[] = [];

  totalesPorSupermercado: {
  [supermercado: string]: number;
} = {};

  totalMasAlto = 0;

  idsSeleccionados: number[] = [];
  private sub!: Subscription;

  tabla: {
    [producto: string]: {
      [supermercado: string]: number;
    };
  } = {};

  productosPorCategoria: {
    [categoria: string]: {
      [producto: string]: {
        [supermercado: string]: number;
      };
    };
  } = {};

  sumaPorCategoria: {
    [categoria: string]: {
      [supermercado: string]: number;
    };
  } = {};

  constructor(
    private http: HttpClient,
    private seleccionService: SeleccionService
  ) {}

ngOnInit(): void {
  this.sub = this.seleccionService.idsSeleccionados$.subscribe(ids => {
    this.idsSeleccionados = ids;
    this.http.get<any[]>('http://localhost:8000/precios/').subscribe((data) => {
      this.precios = data.filter(precio =>
        this.idsSeleccionados.includes(precio.producto_id)
      );
      this.organizarDatos();
    });
  });
}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  organizarDatos() {
  this.categorias = [];
  this.supermercados = [];
  this.productos = [];
  this.tabla = {};
  this.productosPorCategoria = {};
  this.sumaPorCategoria = {};

  for (const item of this.precios) {
    const categoria = item.categoria || item.categoria_nombre || item.categoria;
    const producto = item.producto_nombre;
    const supermercado = item.supermercado_nombre;
    const precio = Number(item.precio);

    if (!this.categorias.includes(categoria)) this.categorias.push(categoria);
    if (!this.supermercados.includes(supermercado)) this.supermercados.push(supermercado);

    // Tabla producto-supermercado
if (!this.tabla[producto]) {
  this.tabla[producto] = {};
  // Buscá el id asociado en this.precios para ese producto
  const prodObj = this.precios.find(p => p.producto_nombre === producto);
  if (prodObj) {
    this.productos.push({ id: prodObj.producto_id, nombre: producto });
  }
}
    this.tabla[producto][supermercado] = precio;

    // Productos por categoria
    if (!this.productosPorCategoria[categoria]) this.productosPorCategoria[categoria] = {};
    if (!this.productosPorCategoria[categoria][producto]) this.productosPorCategoria[categoria][producto] = {};
    this.productosPorCategoria[categoria][producto][supermercado] = precio;
  }

  // Sumamos los precios por categoria y supermercado
  for (const cat of this.categorias) {
    this.sumaPorCategoria[cat] = {};
    for (const sup of this.supermercados) {
      let suma = 0;
      for (const prod in this.productosPorCategoria[cat]) {
        if (this.productosPorCategoria[cat][prod][sup]) suma += this.productosPorCategoria[cat][prod][sup];
      }
      this.sumaPorCategoria[cat][sup] = suma;
    }
  }

    this.productosElegidos = this.productos.map(producto => {
    const preciosProducto =
      Object.entries(this.tabla[producto.nombre]) as [string, number][];

    const [supermercadoMasBarato, precioMinimo] = preciosProducto.reduce(
      (mejorPrecio, precioActual) =>
        precioActual[1] < mejorPrecio[1] ? precioActual : mejorPrecio
    );

    const categoria = this.categorias.find(
      categoria => this.productosPorCategoria[categoria][producto.nombre]
    ) ?? 'Sin categoría';

    return {
      id: producto.id,
      nombre: producto.nombre,
      categoria,
      precioMinimo,
      supermercadoMasBarato
    };
  });

    this.totalesPorSupermercado = {};

  for (const supermercado of this.supermercados) {
    this.totalesPorSupermercado[supermercado] = this.productos.reduce(
      (total, producto) =>
        total + (this.tabla[producto.nombre][supermercado] ?? 0),
      0
    );
  }

  this.totalMasAlto = Math.max(
  0,
  ...Object.values(this.totalesPorSupermercado)
  );

}

getAhorro(supermercado: string): number {
  const total = this.totalesPorSupermercado[supermercado] ?? 0;

  return Math.max(0, this.totalMasAlto - total);
}

getPorcentajeTotal(supermercado: string): number {
  const total = this.totalesPorSupermercado[supermercado] ?? 0;

  if (this.totalMasAlto === 0) {
    return 0;
  }

  return (total / this.totalMasAlto) * 100;
}

  // La API guarda las categorías con un emoji delante (por ejemplo, "🍓 Frutas").
  // En la tabla nueva solo queremos mostrar el nombre, sin alterar el dato original.
  getNombreCategoria(categoria: string): string {
    return categoria.replace(/^[^\p{L}\p{N}]+/u, '').trim();
  }

  // Esta clase identifica el color visual de cada categoría.
  // Si más adelante creas otra categoría, usará el color neutro por defecto.
  getClaseCategoria(categoria: string): string {
    const nombre = this.getNombreCategoria(categoria).toLocaleLowerCase('es-ES');

    const clases: { [nombre: string]: string } = {
      'verduras': 'categoria-verduras',
      'frutas': 'categoria-frutas',
      'lácteos': 'categoria-lacteos',
      'congelados': 'categoria-congelados',
      'frutos secos': 'categoria-frutos-secos',
      'bebidas': 'categoria-bebidas',
      'despensa': 'categoria-despensa',
      'huevos': 'categoria-huevos'
    };

    return clases[nombre] ?? 'categoria-neutra';
  }

get gridColsClass(): string {
  return `md:grid-cols-${this.supermercados.length + 1}`;
  }

  quitarProducto(id: number) {
  // Remover producto del array local (si querés que desaparezca de la lista)
  this.productos = this.productos.filter(p => p.id !== id);
  
  // Quitar id de seleccionados en el servicio
  this.seleccionService.quitarId(id);
}

}
