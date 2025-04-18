import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductosService } from '../../../services/productos.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { NotificacionService } from '../../../services/notificacion.service';



@Component({
  selector: 'app-recomendaciones',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './recomendaciones.component.html',
  styleUrl: './recomendaciones.component.css'
})
export class ProductosRecomendacionesComponent implements OnInit {
  recomendaciones: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private noti: NotificacionService
  ) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap.get('q') || '';
    this.productosService.getRecomendaciones(query).subscribe({
      next: (res) => {
        this.recomendaciones = res; // Asegúrate que se asigna bien
console.log("Recomendaciones recibidas:", this.recomendaciones);

      },
      error: (err) => {
        console.error('Error al obtener recomendaciones:', err);
      }
    });
  }

  modalVerMasVisible = false;
  productoSeleccionado: any = null;

  agregarAlCarrito(producto: any): void {
    const carritoGuardado = localStorage.getItem('carrito');
    let carrito: any[] = carritoGuardado ? JSON.parse(carritoGuardado) : [];
  
    // Verificamos si ya está en el carrito
    const existe = carrito.find((item) => item.id === producto.id);
  
    if (!existe) {
      // Agregamos el producto con cantidad por defecto
      carrito.push({ ...producto, quantity: 1 });
      localStorage.setItem('carrito', JSON.stringify(carrito));
      this.noti.success('Producto añadido', 'El producto fue añadido al carrito');
    } else {
      this.noti.warn('No se puede añadir', 'El producto ya fue añadido al carrito');
    }
  }

  verMasInfo(producto: any): void {
    this.productoSeleccionado = producto;
    this.modalVerMasVisible = true;
  }

  cerrarModales(): void {
    this.modalVerMasVisible = false;
    this.productoSeleccionado = null;
  }

}
