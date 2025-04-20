import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductosService } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { OrdersService } from '../../services/orders.service';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    CardModule,
    InputTextModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: Product[] = [];
  isAdmin: boolean = false;

  productoSeleccionado: Product | null = null;
  productoEditable: any = {};
  modalVerMasVisible = false;
  modalEditarVisible = false;

  //info del carrito
  carrito: any[] = [];

  //recomendacion por texto
  recomendacionTexto: string = '';


  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService,
    private ordersService: OrdersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerProductos();
    this.verificarRol();
  }

  obtenerProductos(): void {
    this.productosService.obtenerProductos().subscribe({
      next: (res) => {
        this.products = res.items;
      },
      error: (err) => console.error('Error al obtener productos', err)
    });
  }

  verificarRol(): void {
    const user = this.authService.getUser();
    this.isAdmin = user?.role === 'admin';
  }

  verMasInfo(producto: Product): void {
    this.productoSeleccionado = producto;
    this.modalVerMasVisible = true;
  }

  abrirModalEditar(producto: Product): void {
    this.productoEditable = {
      id: producto.id,
      name: producto.name,
      description: producto.description,
      technical_specifications: producto.technical_specifications,
      brand_id: producto.brand?.id || 0,
      category_id: producto.category?.id || 0,
      warranty_id: producto.warranty?.id || 0,
      price_usd: producto.price_usd,
      active: producto.active,
    };
    this.modalEditarVisible = true;
  }

  guardarEdicion(): void {
    const formData = new FormData();
    formData.append('name', this.productoEditable.name);
    formData.append('description', this.productoEditable.description);
    formData.append('technical_specifications', this.productoEditable.technical_specifications);
    formData.append('brand', this.productoEditable.brand_id.toString());
    formData.append('category', this.productoEditable.category_id.toString());
    formData.append('warranty', this.productoEditable.warranty_id.toString());
    formData.append('price_usd', this.productoEditable.price_usd.toString());
    formData.append('active', this.productoEditable.active ? 'true' : 'false');

    this.productosService.editarProducto(this.productoEditable.id, formData).subscribe({
      next: () => {
        this.noti.success('Producto editado', 'Cambios guardados');
        this.modalEditarVisible = false;
        this.obtenerProductos();
      },
      error: (err) => {
        console.error('Error al editar', err);
        this.noti.error('Error', 'No se pudo editar el producto');
      }
    });
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Deseas eliminar este producto?')) {
      this.productosService.eliminarProducto(id).subscribe({
        next: () => {
          this.noti.success('Producto eliminado', 'Se eliminó correctamente');
          this.obtenerProductos();
        },
        error: (err) => {
          console.error('Error al eliminar', err);
          this.noti.error('Error', 'No se pudo eliminar el producto');
        }
      });
    }
  }

  cerrarModales(): void {
    this.modalVerMasVisible = false;
    this.modalEditarVisible = false;
    this.productoSeleccionado = null;
  }


  agregarAlCarrito(producto: any): void {
    this.ordersService.getVentas().subscribe({
      next: (res: any) => {
        const ultimaOrden = res.items?.[0];
  
        if (!ultimaOrden || ultimaOrden.payment?.payment_status === 'completed') {
          // Si no hay orden activa o ya fue completada, se crea una nueva orden
          const dataFinance = {
            currency: 'USD',
            items: [{ product_id: producto.id, quantity: 1 }]
          };
          console.log("dataFinance: ",dataFinance);
          this.ordersService.createFinance(dataFinance).subscribe({
            next: (ordenCreada) => {
              this.noti.success('Nuevo carrito creado', 'Producto añadido al carrito');
            },
            error: (err) => {
              console.error('Error al crear nueva orden', err);
              this.noti.error('Error', 'No se pudo crear una nueva orden');
            }
          });
        } else {
          // Si la última orden aún está activa, solo se añade el item
          const dataItem = {
            order_id: ultimaOrden.id,
            product_id: producto.id,
            quantity: 1
          };
          console.log("nuevo producto al carrito: ",dataItem);
          this.ordersService.createOrderItem(dataItem).subscribe({
            next: () => {
              this.noti.success('Producto añadido', 'El producto fue añadido al carrito');
            },
            error: (err) => {
              console.error('Error al agregar producto a la orden activa', err);
              this.noti.error('Error', 'No se pudo agregar el producto al carrito');
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener órdenes', err);
        this.noti.error('Error', 'No se pudo verificar el estado del carrito');
      }
    });
  }
  

  verRecomendaciones(nombre: string, categoria: string, marca: string): void {
    const query = `${nombre} ${categoria} ${marca}`;
    this.router.navigate(['customer/recomendaciones'], {
      queryParams: { q: query }
    });
  }

  verRecomendacionPorTexto(): void {
    if (!this.recomendacionTexto.trim()) {
      this.noti.warn('Texto vacío', 'Ingresa una descripción para recomendar');
      return;
    }
  
    const query = this.recomendacionTexto.trim();
    this.router.navigate(['/customer/recomendaciones'], {
      queryParams: { q: query }
    });
  }
  
  
}


