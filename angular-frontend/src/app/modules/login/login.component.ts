import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './login.component.html'
})

export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  showPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
  if (!this.email.trim() || !this.password.trim()) {
    this.errorMessage = 'Debe completar todos los campos.';
    return;
  }

  this.authService.login(this.email, this.password).subscribe({
    next: (response) => {
      // AuthService se encarga de guardar los datos y de avisar al navbar.
      this.authService.guardarSesion(response);
      this.router.navigate(['/admin']);
    },
    error: (error) => {
      console.error('Error de login:', error);
      this.errorMessage = 'Correo o contraseña incorrectos';
    }
    });
  }
 }
