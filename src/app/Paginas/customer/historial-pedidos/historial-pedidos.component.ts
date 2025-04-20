import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../../../services/orders.service';
import { AuthService } from '../../../services/auth.service';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-historial-pedidos',
  imports: [CommonModule, TableModule,ButtonModule],
  templateUrl: './historial-pedidos.component.html',
  styleUrl: './historial-pedidos.component.css'
})
export class HistorialPedidosComponent  implements OnInit {
  ventas: any[] = [];
  usuarios: { [key: number]: any } = {}; // Mapeo de usuarios por ID

  constructor(
    private ordersService: OrdersService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
    console.log("ordenes realizadas: ",this.ventas);
  }

  obtenerVentas(): void {
    this.ordersService.getVentas().subscribe({
      next: (res: any) => {
        // 🔍 Solo incluir las ventas pagadas
        
        this.ventas = res.items.filter(
          (venta: any) => venta.payment?.payment_status === 'completed'
        );
  
        // 🔄 Obtener los usuarios asociados a cada venta
        this.ventas.forEach((venta: any) => {
          const userId = venta.user;
          if (!this.usuarios[userId]) {
            this.authService.getUserById(userId).subscribe({
              next: (userData) => {
                this.usuarios[userId] = userData;
              },
              error: (err) => {
                console.error('Error al obtener usuario:', err);
              }
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar ventas:', err);
      }
    });
  }
  

  getNombreUsuario(id: number): string {
    const usuario = this.usuarios[id];
    return usuario ? `${usuario.first_name} ${usuario.last_name}` : 'Cargando...';
  }

  eliminarVenta(id: number): void {
    console.log(`Eliminar venta con ID: ${id}`);
    // Aquí luego puedes agregar confirmación y delete real
  }
}
