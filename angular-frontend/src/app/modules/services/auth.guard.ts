import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Angular ejecuta esta función antes de cargar una ruta que use canActivate.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si no hay token, devuelve una redirección al login en lugar de mostrar el administrador.
  return authService.estaAutenticado() ? true : router.createUrlTree(['/login']);
};
