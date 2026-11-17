import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

/* Cada producto de la cesta necesita conocer su identificador y cuántas unidades hay. */
export interface ProductoSeleccionado {
  id: number;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class SeleccionService {
  /*
   * La cesta deja de ser una lista de números.
   * Ahora cada elemento tiene forma: { id: 4, cantidad: 2 }.
   */
  private productosSeleccionadosSubject =
    new BehaviorSubject<ProductoSeleccionado[]>([]);

  /*
   * Observable completo: lo usarán las comparativas para leer también
   * la cantidad de cada producto.
   */
  productosSeleccionados$ =
    this.productosSeleccionadosSubject.asObservable();

  /*
   * Conservamos esta versión solo con IDs para no romper todavía
   * el código que ya depende de ella.
   */
  idsSeleccionados$ = this.productosSeleccionados$.pipe(
    map(productos => productos.map(producto => producto.id))
  );

  /* Obtiene la cesta actual antes de crear una nueva versión de ella. */
  private get productosSeleccionados(): ProductoSeleccionado[] {
    return this.productosSeleccionadosSubject.getValue();
  }

  /* Añade un producto nuevo con una cantidad inicial de una unidad. */
  agregarId(id: number): void {
    const productoYaExiste = this.productosSeleccionados.some(
      producto => producto.id === id
    );

    if (!productoYaExiste) {
      this.productosSeleccionadosSubject.next([
        ...this.productosSeleccionados,
        { id, cantidad: 1 }
      ]);
    }
  }

  /* Suma una unidad al producto indicado. */
  aumentarCantidad(id: number): void {
    const cestaActualizada = this.productosSeleccionados.map(producto =>
      producto.id === id
        ? { ...producto, cantidad: producto.cantidad + 1 }
        : producto
    );

    this.productosSeleccionadosSubject.next(cestaActualizada);
  }

  /*
   * Resta una unidad, sin permitir que la cantidad llegue a cero.
   * La papelera seguirá siendo la acción específica para eliminarlo.
   */
  disminuirCantidad(id: number): void {
    const cestaActualizada = this.productosSeleccionados.map(producto =>
      producto.id === id && producto.cantidad > 1
        ? { ...producto, cantidad: producto.cantidad - 1 }
        : producto
    );

    this.productosSeleccionadosSubject.next(cestaActualizada);
  }

  /* Elimina por completo un producto de la cesta. */
  quitarId(id: number): void {
    const cestaActualizada = this.productosSeleccionados.filter(
      producto => producto.id !== id
    );

    this.productosSeleccionadosSubject.next(cestaActualizada);
  }
}