import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  // El valor inicial se calcula desde localStorage para conservar la sesión al recargar.
  private sesionIniciadaSubject = new BehaviorSubject<boolean>(this.estaAutenticado());

  // Los componentes pueden escuchar este observable, pero solo este servicio puede modificarlo.
  sesionIniciada$ = this.sesionIniciadaSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Devuelve true cuando el navegador conserva el token de una sesión anterior.
  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  // Centraliza el guardado de datos tras un login correcto y avisa a toda la aplicación.
  guardarSesion(respuesta: any): void {
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('user', JSON.stringify(respuesta.user));
    this.sesionIniciadaSubject.next(true);
  }

  // Elimina solo los datos de autenticación, actualiza el navbar y vuelve al inicio.
  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.sesionIniciadaSubject.next(false);
    this.router.navigate(['/']);
  }
}
