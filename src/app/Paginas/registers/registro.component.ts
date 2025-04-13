import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  mostrarModal = true;

  usuario = {
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    active: true,
    password: '',
  };
  
  //variable de roles
  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Customer', value: 'customer' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService,
    private noti:NotificacionService
  ) { }
  
  registrarse(form: NgForm) {
    if (form.invalid) {
      return; // 👈 Salir si el formulario no es válido
    }
  
    this.authService.registrarse(this.usuario).subscribe({
      next: () => {
        this.noti.success('¡Registro completo!', 'Ahora podés iniciar sesión');
        alert('✅ Registro exitoso');
        this.router.navigate(['/ingreso']);
      },
      error: (err) => {
        this.noti.error('Error', 'No se pudo registrar');
        alert('No se pudo registrar');
      }
    });
  }
  

}
