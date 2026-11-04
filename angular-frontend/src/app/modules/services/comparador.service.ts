import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { SeleccionService } from './seleccion.service';

export type PestanaComparador = 'productos' | 'categorias' | 'supermercados';

// indica que mostrará de cada producto seleccionado
export interface ProductoElegido {
  id: number;
  nombre: string;
  categoria: string;
  precioMinimo: number;
  supermercadoMasBarato: string;
}

export interface DatosComparador {
  categorias: string[];
  supermercados: string[];
  productos: { id: number; nombre: string }[];
  productosElegidos: ProductoElegido[];
  tabla: Record<string, Record<string, number>>;
  sumaPorCategoria: Record<string, Record<string, number>>;
  totalesPorSupermercado: Record<string, number>;
  totalMasAlto: number;
  supermercadoMasBarato: string | null;
  totalMasBajo: number;
}

@Injectable({ providedIn: 'root' })
export class ComparadorService {
  private readonly preciosUrl = 'http://localhost:8000/precios/';

  // Se inicializa en el constructor, cuando los servicios ya están disponibles.
  readonly datos$: Observable<DatosComparador>;

  constructor(
    private http: HttpClient,
    private seleccionService: SeleccionService
  ) {
    // Se actualiza automáticamente cuando cambia la selección de productos.
    this.datos$ = this.seleccionService.idsSeleccionados$.pipe(
      switchMap(idsSeleccionados =>
        this.http.get<any[]>(this.preciosUrl).pipe(
          map(precios => this.organizarDatos(precios, idsSeleccionados))
        )
      ),
      // Inicio y Comparador comparten el resultado sin pedir dos veces los mismos datos.
      shareReplay(1)
    );
  }

  private organizarDatos(precios: any[], idsSeleccionados: number[]): DatosComparador {
    const seleccionados = precios.filter(precio => idsSeleccionados.includes(precio.producto_id));
    const categorias: string[] = [];
    const supermercados: string[] = [];
    const productos: { id: number; nombre: string }[] = [];
    const tabla: Record<string, Record<string, number>> = {};
    const productosPorCategoria: Record<string, Record<string, Record<string, number>>> = {};

    for (const item of seleccionados) {
      const categoria = item.categoria ?? 'Sin categoría';
      const producto = item.producto_nombre;
      const supermercado = item.supermercado_nombre;
      const precio = Number(item.precio);

      if (!categorias.includes(categoria)) categorias.push(categoria);
      if (!supermercados.includes(supermercado)) supermercados.push(supermercado);

      if (!tabla[producto]) {
        tabla[producto] = {};
        productos.push({ id: item.producto_id, nombre: producto });
      }

      tabla[producto][supermercado] = precio;
      productosPorCategoria[categoria] ??= {};
      productosPorCategoria[categoria][producto] ??= {};
      productosPorCategoria[categoria][producto][supermercado] = precio;
    }

    const sumaPorCategoria: Record<string, Record<string, number>> = {};
    for (const categoria of categorias) {
      sumaPorCategoria[categoria] = {};
      for (const supermercado of supermercados) {
        sumaPorCategoria[categoria][supermercado] = Object.values(productosPorCategoria[categoria])
          .reduce((total, preciosProducto) => total + (preciosProducto[supermercado] ?? 0), 0);
      }
    }

        const productosElegidos: ProductoElegido[] = productos.map(producto => {
      const preciosProducto = Object.entries(tabla[producto.nombre]) as [string, number][];

      const [supermercadoMasBarato, precioMinimo] = preciosProducto.reduce(
        (mejorPrecio, precioActual) =>
          precioActual[1] < mejorPrecio[1] ? precioActual : mejorPrecio
      );

      const categoria = categorias.find(categoriaActual =>
        productosPorCategoria[categoriaActual][producto.nombre]
      ) ?? 'Sin categoría';

      return {
        id: producto.id,
        nombre: producto.nombre,
        categoria,
        precioMinimo,
        supermercadoMasBarato
      };
    });


    const totalesPorSupermercado: Record<string, number> = {};
    for (const supermercado of supermercados) {
      totalesPorSupermercado[supermercado] = productos.reduce(
        (total, producto) => total + (tabla[producto.nombre][supermercado] ?? 0),
        0
      );
    }

    const totalMasAlto = Math.max(0, ...Object.values(totalesPorSupermercado));
    const entradasTotales = Object.entries(totalesPorSupermercado);
    let supermercadoMasBarato: string | null = null;
    let totalMasBajo = 0;

    if (entradasTotales.length > 0) {
      const mejorOpcion = entradasTotales.reduce(
        (mejor, actual) => actual[1] < mejor[1] ? actual : mejor
      );
      supermercadoMasBarato = mejorOpcion[0];
      totalMasBajo = mejorOpcion[1];
    }

    return {
      categorias,
      supermercados,
      productos,
      productosElegidos,
      tabla,
      sumaPorCategoria,
      totalesPorSupermercado,
      totalMasAlto,
      supermercadoMasBarato,
      totalMasBajo
    };
  }
}
