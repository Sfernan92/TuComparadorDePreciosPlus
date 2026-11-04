import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { AuthService } from '../services/auth.service';

type PestanaAdmin = 'resumen' | 'categorias' | 'supermercados' | 'productos' | 'precios';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './admin.component.html',
})

export class AdminComponent implements OnInit {
    // Controla qué sección del administrador se muestra en pantalla.
  pestanaActiva: PestanaAdmin = 'resumen';

  // Recibe una pestaña y la convierte en la sección visible.
  seleccionarPestana(pestana: PestanaAdmin): void {
    this.pestanaActiva = pestana;
  }
  
  categorias: any[] = []; 
  nuevoProducto = { nombre: '', marca: '' , categoria_id: -1};
  errorProducto = false;
  supermercados: any[] = [];
  nuevoSupermercado = { nombre: '' };
  errorSupermercado = false;
  supermercadoEditando: any = null;
  nuevaCategoria = { nombre: '' };

  
  private supermercadoApiUrl = 'http://localhost:8000/supermercados';
  categoriaEditando: any = null;
  productos: any[] = [];
  productoEditando: any = null;
  
  nuevoPrecioProducto = {
    producto_id: null,
    supermercado_id: null,
    precio: null
  };
  productoPrecioEditando: any = null;
  productosConPrecio: any[] = [];

  private productosApiUrl = 'http://localhost:8000/productos';
  // URL base de la API Symfony
  private apiUrl = 'http://localhost:8000/categorias';
  private productosPrecioApiUrl = 'http://localhost:8000/productos';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // El cierre de sesión se mantiene dentro del área privada.
  cerrarSesion(): void {
    this.authService.cerrarSesion();
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarSupermercados(); 
    this.cargarProductos();
    setTimeout(() => {
    this.cargarProductosConPrecio();
  }, 500); 
  }

agregarCategoria() {
  if (!this.nuevaCategoria.nombre.trim()) {
    this.errorProducto = true;
    return;
  }

  this.http.post(this.apiUrl + '/new', this.nuevaCategoria).subscribe({
    next: () => {
      this.nuevaCategoria.nombre = '';
      this.errorProducto = false;
      this.cargarCategorias();
    },
    error: () => {
      this.errorProducto = true;
    }
  });
}

  cargarCategorias() {
    this.http.get<any[]>(this.apiUrl + '/').subscribe({
      next: (data) => {
        this.categorias = data;
        this.errorProducto = false;
      },
      error: () => {
        this.errorProducto = true;
      },
    });
  }

  eliminarCategoria(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.cargarCategorias();
      },
      error: () => {
        alert('Error al eliminar la categoría');
      },
    });
  }

  // --- MÉTODOS PARA EDITAR ---

  abrirPopupEditar(categoria: any) {
    this.categoriaEditando = { ...categoria };
  }

  guardarEdicion() {
    if (!this.categoriaEditando.nombre.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    this.http.put(`${this.apiUrl}/${this.categoriaEditando.id}/edit`, { nombre: this.categoriaEditando.nombre })
      .subscribe({
        next: () => {
          // Actualizar la lista local sin recargar todo
          const index = this.categorias.findIndex(c => c.id === this.categoriaEditando.id);
          if (index > -1) {
            this.categorias[index].nombre = this.categoriaEditando.nombre;
          }
          this.categoriaEditando = null; // cerrar popup
        },
        error: (err) => {
          alert('Error al guardar la categoría');
          console.error(err);
        }
      });
  }

  cancelarEdicion() {
    this.categoriaEditando = null; // cerrar popup sin cambios
  }

  cargarSupermercados() {
  this.http.get<any[]>(this.supermercadoApiUrl + '/').subscribe({
    next: (data) => {
      this.supermercados = data;
      this.errorSupermercado = false;
    },
    error: () => {
      this.errorSupermercado = true;
    },
  });
}

agregarSupermercado() {
  if (!this.nuevoSupermercado.nombre.trim()) {
    this.errorSupermercado = true;
    return;
  }
  this.http.post(this.supermercadoApiUrl + '/new', this.nuevoSupermercado).subscribe({
    next: () => {
      this.nuevoSupermercado.nombre = '';
      this.errorSupermercado = false;
      this.cargarSupermercados();
    },
    error: () => {
      this.errorSupermercado = true;
    },
  });
}

eliminarSupermercado(id: number) {
  this.http.delete(`${this.supermercadoApiUrl}/${id}`).subscribe({
    next: () => this.cargarSupermercados(),
    error: () => alert('Error al eliminar el supermercado'),
  });
}

abrirPopupEditarSupermercado(supermercado: any) {
  this.supermercadoEditando = { ...supermercado };
}

guardarEdicionSupermercado() {
  if (!this.supermercadoEditando.nombre.trim()) {
    alert('El nombre no puede estar vacío');
    return;
  }

  this.http
    .put(`${this.supermercadoApiUrl}/${this.supermercadoEditando.id}/edit`, {
      nombre: this.supermercadoEditando.nombre,
    })
    .subscribe({
      next: () => {
        const index = this.supermercados.findIndex((s) => s.id === this.supermercadoEditando.id);
        if (index > -1) {
          this.supermercados[index].nombre = this.supermercadoEditando.nombre;
        }
        this.supermercadoEditando = null;
      },
      error: () => alert('Error al guardar el supermercado'),
    });
}

cancelarEdicionSupermercado() {
  this.supermercadoEditando = null;
}

cargarProductos() {
  this.http.get<any[]>(this.productosApiUrl).subscribe({
    next: (data) => {
      this.productos = data;
    },
    error: () => alert('Error al cargar productos'),
  });
}

agregarProducto() {
  const { nombre, marca, categoria_id } = this.nuevoProducto;
  if (!nombre.trim() || !marca.trim() || !categoria_id) {
    this.errorProducto = true;
    return;
  }

  this.http.post(this.productosApiUrl + '/new', this.nuevoProducto).subscribe({
    next: () => {
      this.nuevoProducto = { nombre: '', marca: '', categoria_id: -1 };
      this.errorProducto = false;
      this.cargarProductos();
    },
    error: () => {
      this.errorProducto = true;
    },
  });
}


guardarEdicionProducto() {
  if (!this.productoEditando.nombre.trim() || !this.productoEditando.marca.trim() || !this.productoEditando.categoria_id) {
    alert('Complete todos los campos correctamente');
    return;
  }

  this.http
    .put(`${this.productosApiUrl}/${this.productoEditando.id}/edit`, {
      nombre: this.productoEditando.nombre,
      marca: this.productoEditando.marca,
      categoria_id: this.productoEditando.categoria_id,
    })
    .subscribe({
      next: () => {
        this.cargarProductos(); // 🔄 Recarga los productos desde el backend
        this.productoEditando = null;
      },
      error: () => alert('Error al guardar el producto'),
    });
}

eliminarProducto(id: number) {
  this.http.delete(`${this.productosApiUrl}/${id}`).subscribe({
    next: () => this.cargarProductos(),
    error: () => alert('Error al eliminar el producto'),
  });
}

abrirPopupEditarProducto(producto: any) {
  this.productoEditando = { ...producto };
}

cancelarEdicionProducto() {
  this.productoEditando = null;
}

getNombreCategoria(idCategoria: number): string {
  const categoria = this.categorias.find(cat => cat.id === idCategoria);
  return categoria ? categoria.nombre : 'Sin categoría';
}

  // Datos de apoyo para la vista de resumen; no modifican ningún registro.
  getProductosRecientes(): any[] {
    return this.productos.slice(0, 3);
  }

  contarPreciosProducto(productoId: number): number {
    return this.productosConPrecio.filter(precio => precio.producto_id === productoId).length;
  }

cargarProductosConPrecio() {
  this.http.get<any[]>('http://localhost:8000/precios').subscribe({
    next: (data) => {
      this.productosConPrecio = data; 
    },
    error: () => alert('Error al cargar precios'),
  });
}

agregarProductoConPrecio() {
  const { producto_id, supermercado_id, precio } = this.nuevoPrecioProducto;
  if (!producto_id || !supermercado_id || precio == null) {
    this.errorProducto = true;
    return;
  }

  this.http.post('http://localhost:8000/precios/new', this.nuevoPrecioProducto).subscribe({
    next: () => {
      this.nuevoPrecioProducto = { producto_id: null, supermercado_id: null, precio: null };
      this.errorProducto = false;
      this.cargarProductosConPrecio();
    },
    error: () => this.errorProducto = true,
  });
}

eliminarProductoConPrecio(id: number) {
  this.http.delete(`http://localhost:8000/precios/${id}`).subscribe({
    next: () => this.cargarProductosConPrecio(),
    error: () => alert('Error al eliminar el producto con precio'),
  });
}

abrirPopupEditarPrecio(producto: any) {
  this.productoPrecioEditando = { ...producto };
}

guardarEdicionPrecio() {
  if (this.productoPrecioEditando.precio == null) {
    alert('El precio no puede estar vacío');
    return;
  }

  this.http.put(`http://localhost:8000/precios/${this.productoPrecioEditando.id}/edit`, {
    precio: this.productoPrecioEditando.precio
  }).subscribe({
    next: () => {
      this.cargarProductosConPrecio();
      this.productoPrecioEditando = null;
    },
    error: (err) => {
      console.error('Error al guardar el precio:', err);
      alert('Error al guardar el precio');
    }
  });
}

cancelarEdicionPrecio() {
  this.productoPrecioEditando = null;
}

}
