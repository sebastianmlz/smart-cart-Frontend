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

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService
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

  agregarAlCarrito(producto: Product): void {
    // Aquí puedes integrar tu lógica de carrito
    console.log('Agregado al carrito:', producto);
    this.noti.success('Agregado al carrito', producto.name);
  }
}
