import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SeleccionService } from '../../services/seleccion.service';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './buscador.component.html',
})

export class BuscadorComponent {
  terminoBusqueda: string = '';
  alimentos: { id: number, nombre	: string }[] = [];
  // Producto elegido en las sugerencias, pero aún no añadido a la lista.
  alimentoSeleccionado: { id: number, nombre: string } | null = null;

  constructor(private http: HttpClient,private seleccionService: SeleccionService) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8000/productos/').subscribe((data) => {
      this.alimentos = data.map(item => ({
        nombre	: item.nombre	 || 'Sin nombre',
        id: item.id,
      }));
    });
  }

  // Prepara un texto para compararlo sin distinguir mayúsculas, tildes ni diéresis.
  normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es-ES');
  }

// Devuelve solo los alimentos cuyo nombre contiene el texto buscado.
obtenerAlimentosFiltrados() {
  const terminoNormalizado = this.normalizarTexto(this.terminoBusqueda);

  return this.alimentos.filter(alimento => {
    const nombreNormalizado = this.normalizarTexto(alimento.nombre);

    return nombreNormalizado.includes(terminoNormalizado);
  });
}

  // Guarda el producto elegido temporalmente, sin añadirlo aún a la lista.
  prepararAlimento(alimento: { id: number, nombre: string }): void {
    this.alimentoSeleccionado = alimento;
    this.terminoBusqueda = alimento.nombre;
  }

  // Añade a la lista el producto que se había elegido previamente.
  anadirAlimentoSeleccionado(): void {
    // Si no se ha escogido ninguna sugerencia, no hacemos nada.
    if (this.alimentoSeleccionado === null) {
      return;
    }

    // Reutilizamos el servicio que ya gestionaba la lista de productos.
    this.seleccionService.agregarId(this.alimentoSeleccionado.id);

    // Dejamos el buscador listo para una nueva búsqueda.
    this.terminoBusqueda = '';
    this.alimentoSeleccionado = null;
  }
}
