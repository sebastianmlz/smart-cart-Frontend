import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ⬅️ Esto es clave
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { NotificacionService } from '../../services/notificacion.service';
import { environment } from '../../../environments/environments';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'app-configuracion',
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
  imports: [
    CommonModule,        // ✅ Asegúrate de tener esto
    FormsModule,
    ButtonModule,
    InputTextModule
  ]
})
export class ConfiguracionComponent implements OnInit {
  usuario: any;
  modoEdicion = false;
  mostrarCambioPassword = false;
  private baseUrl = environment.apiUrl;

  cambioPassword = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient,
    private noti: NotificacionService
  ) { }

  ngOnInit() {
    // this.usuario = this.authService.getUser();
  }

  guardarCambios() {
    const userId = this.usuario?.id; // Asegúrate de tener el id del usuario
    this.http.put(`${this.baseUrl}/update/${userId}`, this.usuario).subscribe({
      next: () => {
        this.noti.success('Datos Actualizados', 'Actualizacion de datos correctamente');
        localStorage.setItem('user', JSON.stringify(this.usuario)); // actualiza localmente
        this.modoEdicion = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar los datos');
      }
    });
  }

  guardarNuevaPassword() {
    const datos = {
      old_password: this.cambioPassword.actual,
      new_password: this.cambioPassword.nueva,
      confirm_password: this.cambioPassword.confirmar
    };
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(`${this.baseUrl}/auth/change-password`, datos, { headers }).subscribe({
      next: () => {
        this.noti.success('Actualizada', 'Contraseña correctamente actualizada');
        this.cambioPassword = { actual: '', nueva: '', confirmar: '' };
        this.mostrarCambioPassword = false;
      },
      error: (err) => {
        console.error(err);
        alert('No se pudo cambiar la contraseña');
      }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.usuario = this.authService.getUser(); // Vuelve a cargar los datos guardados
    this.noti.warn('Cancelada', 'Edicion de informacion cancelada');
  }

  cancelarCambioPassword() {
    this.mostrarCambioPassword = false;
    this.cambioPassword = { actual: '', nueva: '', confirmar: '' };
    this.noti.warn('Cancelado', 'Cambio de contraseña cancelado');
  }
}
