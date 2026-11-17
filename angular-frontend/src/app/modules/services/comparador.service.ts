import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
// ProductoSeleccionado contiene el id y la cantidad elegida en la cesta temporal.
import { SeleccionService, ProductoSeleccionado } from './seleccion.service';

export type PestanaComparador = 'productos' | 'categorias' | 'supermercados';

// indica que mostrará de cada producto seleccionado
export interface ProductoElegido {
  id: number;
  nombre: string;
  // Cantidad que el usuario ha indicado para este producto.
  cantidad: number;
  categoria: string;
  precioMinimo: number;
  supermercadoMasBarato: string;
}

export interface DatosComparador {
  categorias: string[];
  supermercados: string[];
  // Lista de productos de la cesta, incluyendo sus unidades para calcular totales.
  productos: { id: number; nombre: string; cantidad: number }[];
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
    // Se actualiza automáticamente cuando cambia la cesta, incluidas las cantidades.
    this.datos$ = this.seleccionService.productosSeleccionados$.pipe(
      switchMap(productosSeleccionados =>
        // Volvemos a organizar los precios cada vez que se suma o resta una unidad.
        this.http.get<any[]>(this.preciosUrl).pipe(
          map(precios =>
            this.organizarDatos(precios, productosSeleccionados)
          )
        )
      ),
      shareReplay(1)
    );
  }

  /*
   * Recibe todos los precios de la API y la cesta actual.
   * A partir de ambos datos prepara las tablas y los totales que muestra el frontend.
   */
  private organizarDatos(precios: any[], productosSeleccionados: ProductoSeleccionado[]): DatosComparador {
    // Extraemos solo los IDs para reutilizar el filtro que ya seleccionaba los precios correctos.
    const idsSeleccionados = productosSeleccionados.map(
      producto => producto.id
    );

    /*
     * Creamos un mapa rápido de consulta: id del producto -> cantidad elegida.
     * Ejemplo: 7 -> 3 significa que el producto cuyo id es 7 tiene tres unidades.
     */
    const cantidadPorId = new Map(
      productosSeleccionados.map(producto => [producto.id, producto.cantidad])
    );
    const seleccionados = precios.filter(precio => idsSeleccionados.includes(precio.producto_id));
    const categorias: string[] = [];
    const supermercados: string[] = [];
    const productos: { id: number; nombre: string; cantidad: number }[] = [];
    /*
     * Las tablas actuales usan el nombre como clave, por eso guardamos también
     * una relación nombre -> cantidad para los cálculos por categoría.
     */
    const cantidadPorNombre: Record<string, number> = {};
    const tabla: Record<string, Record<string, number>> = {};
    const productosPorCategoria: Record<string, Record<string, Record<string, number>>> = {};

    for (const item of seleccionados) {
      const categoria = item.categoria ?? 'Sin categoría';
      const producto = item.producto_nombre;
      const supermercado = item.supermercado_nombre;
      const precio = Number(item.precio);

      // Si no existiera cantidad por alguna razón, usamos una unidad como valor seguro.
      const cantidad = cantidadPorId.get(item.producto_id) ?? 1;
      cantidadPorNombre[producto] = cantidad;

      if (!categorias.includes(categoria)) categorias.push(categoria);
      if (!supermercados.includes(supermercado)) supermercados.push(supermercado);

      if (!tabla[producto]) {
        tabla[producto] = {};
        productos.push({
          id: item.producto_id,
          nombre: producto,
          // Guardamos la cantidad junto al producto para usarla en los totales generales.
          cantidad
        });
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
        /*
         * Sumamos los productos de esta categoría en este supermercado.
         * Cada precio unitario se multiplica por la cantidad de la cesta.
         */
        sumaPorCategoria[categoria][supermercado] = Object.entries(
          productosPorCategoria[categoria]
        ).reduce(
          (total, [nombreProducto, preciosProducto]) =>
            total +
            (preciosProducto[supermercado] ?? 0) *
              (cantidadPorNombre[nombreProducto] ?? 1),
          0
        );
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
        cantidad: producto.cantidad,
        categoria,
        // El resumen muestra el coste mínimo de todas las unidades elegidas.
        precioMinimo: precioMinimo * producto.cantidad,
        supermercadoMasBarato
      };
    });


    const totalesPorSupermercado: Record<string, number> = {};
    for (const supermercado of supermercados) {
      // Coste de la cesta completa: precio unitario por las unidades de cada producto.
      totalesPorSupermercado[supermercado] = productos.reduce(
        (total, producto) => total + (tabla[producto.nombre][supermercado] ?? 0) * producto.cantidad,
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
