import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { ToastComponent } from '../toast/toast.component';
import { HttpClient } from '@angular/common/http';
import { SeleccionService } from '../services/seleccion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: './landing.component.html',
  // styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit, OnDestroy {
  precios: any[] = [];
  categorias: string[] = [];
  supermercados: string[] = [];
  productos: { id: number; nombre: string }[] = [];
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
