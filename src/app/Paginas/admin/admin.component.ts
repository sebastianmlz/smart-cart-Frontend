import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OnInit } from '@angular/core';
import { NotificacionService } from '../../services/notificacion.service';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  usuario: any;

  constructor(public authService:AuthService, 
    private noti: NotificacionService,)
  {}

  ngOnInit() {
    this.usuario = this.authService.getUser();
    this.noti.success(`Bienvenido ${this.usuario.first_name} ${this.usuario.last_name}`, 'Sesion iniciada con exito');
  }
}
