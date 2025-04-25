import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ProductosService } from '../../../services/productos.service';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { Product } from '../../../models/product.model';
import { Brand } from '../../../models/brand.model';
import { Category } from '../../../models/category.model';
import { Warranty } from '../../../models/warranty.model';
import { CreateProduct } from '../../../models/create-product.model';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-table-products',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    PaginatorModule, // Añadido para la paginación
  ],
  templateUrl: './table-products.component.html',
  styleUrl: './table-products.component.css'
})
export class TableProductsComponent {
  products: Product[] = [];
  productoEditable: any = {};
  editarProductoModalVisible = false;

  brands: Brand[] = [];
  categories: Category[] = [];
  warranties: Warranty[] = [];

  nuevoProducto: CreateProduct = {
    brand_id: 0,
    category_id: 0,
    warranty_id: 0,
    name: '',
    description: '',
    active: true,
    image_url: {} as File,
    technical_specifications: '',
    price_usd: 0,
    created_at: '',
    stock: 0
  };
  nuevoProductoModalVisible = false;
  
  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;

  constructor(
    public productos: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService,
  ) {}

  ngOnInit() {
    this.cargarProductos(this.currentPage, this.pageSize);
    this.cargarFormOpciones();
  }

  // Nuevo método para manejar el cambio de página
  onPageChange(event: any): void {
    // Si usas p-paginator de PrimeNG
    if (event.page !== undefined) {
      // PrimeNG paginator usa base 0 (primera página = 0)
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } 
    // Si usas p-table con paginación integrada
    else if (event.first !== undefined) {
      // Calcular página basado en first y rows
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    
    console.log(`Cambiando a página ${this.currentPage}, tamaño: ${this.pageSize}`);
    this.cargarProductos(this.currentPage, this.pageSize);
  }

  cargarProductos(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.productos.obtenerProductos(page, pageSize).subscribe({
      next: (res) => {
        this.products = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
        
        console.log("Productos con stock:", this.products);
        console.log("respuesta del backend:", res);
  
        // 🔔 Notificar productos con stock bajo
        this.products.forEach((product: any) => {
          const stock = product.inventory?.stock;
          if (stock !== undefined && stock <= 5) {
            this.noti.warn(
              'Stock bajo',
              `El producto ID ${product.id} tiene stock crítico (${stock} unidades)`
            );
          }
        });
      },
      error: (err) => {
        console.error("Error al cargar productos", err);
        this.loading = false;
      },
    });
  }
  
  cargarFormOpciones(): void {
    this.productos.getBrands().subscribe({
      next: (res) => this.brands = res.items,
      error: (err) => console.error('Error al cargar brands', err)
    });

    this.productos.getCategories().subscribe({
      next: (res) => this.categories = res.items,
      error: (err) => console.error('Error al cargar categories', err)
    });

    this.productos.getWarranties().subscribe({
      next: (res) => {
        this.warranties = res.items;
        console.log("garantias:", this.warranties);
        console.log("respuesta del backend:", res);
      } ,
      error: (err) => console.error('Error al cargar warranties', err)
    });
  }

  abrirModalNuevoProducto(): void {
    this.nuevoProducto = {
      brand_id: 0,
      category_id: 0,
      warranty_id: 0,
      name: '',
      description: '',
      active: true,
      image_url: {} as File,
      technical_specifications: '',
      price_usd: 0,
      created_at: new Date().toISOString(),
      stock: 0
    };
    this.nuevoProductoModalVisible = true;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    console.log("Archivo seleccionado:", file); // 👈 asegúrate que esto no sea undefined
    if (file) {
      this.nuevoProducto.image_url = file;
    }
  }
  
  registrarProducto(): void {
    const formData = new FormData();
  
    formData.append('name', this.nuevoProducto.name);
    formData.append('description', this.nuevoProducto.description);
    formData.append('technical_specifications', this.nuevoProducto.technical_specifications);
    formData.append('brand_id', this.nuevoProducto.brand_id.toString());
    formData.append('category_id', this.nuevoProducto.category_id.toString());
    formData.append('warranty_id', this.nuevoProducto.warranty_id.toString());
    formData.append('price_usd', this.nuevoProducto.price_usd.toString());
    formData.append('stock', this.nuevoProducto.stock.toString());
    formData.append('active', this.nuevoProducto.active ? 'true' : 'false');
    formData.append('created_at', this.nuevoProducto.created_at); // opcional
  
    if (this.nuevoProducto.image_url) {
      formData.append('image_url', this.nuevoProducto.image_url);
    }
  
    // Verifica en consola lo que se está enviando
    for (const pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
    console.log('¿Archivo es tipo File?', this.nuevoProducto.image_url instanceof File);

    this.productos.createProduct(formData).subscribe({
      next: () => {
        this.noti.success('Producto registrado', '¡Registro exitoso!');
        this.nuevoProductoModalVisible = false;
        this.cargarProductos(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error al registrar producto', err);
        this.noti.error('Error', 'No se pudo registrar el producto');
      }
    });
  }
  
  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productos.eliminarProducto(id).subscribe({
        next: () => {
          this.noti.success('Producto eliminado', 'El producto fue eliminado correctamente');
          this.cargarProductos(this.currentPage, this.pageSize);
        },
        error: (err) => {
          console.error('Error al eliminar el producto', err);
          this.noti.error('Error', 'No se pudo eliminar el producto');
        }
      });
    }
  }

  abrirModalEditarProducto(productId: number): void {
    const producto = this.products.find(p => p.id === productId);
  
    if (!producto) {
      console.error('Producto no encontrado para editar');
      return;
    }
  
    this.productoEditable = {
      id: producto.id,
      name: producto.name,
      description: producto.description,
      technical_specifications: producto.technical_specifications,
      brand_id: producto.brand?.id || 0,
      category_id: producto.category?.id || 0,
      warranty_id: producto.warranty?.id || 0,
      created_at: producto.created_at,
      active: producto.active,
      price_usd: producto.price_usd,
      stock: producto.inventory?.stock || 0,
      image_url: producto.image_url,
    };
  
    this.editarProductoModalVisible = true;
  }
  
  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.productoEditable.image_url = file;
    } else {
      this.noti.error('Archivo inválido', 'Debes seleccionar una imagen válida (JPG, PNG, etc).');
    }
  }
  
  editarProducto(): void {
    const formData = new FormData();
    formData.append('name', this.productoEditable.name);
    formData.append('description', this.productoEditable.description);
    formData.append('technical_specifications', this.productoEditable.technical_specifications);
    formData.append('brand_id', this.productoEditable.brand_id.toString());
    formData.append('category_id', this.productoEditable.category_id.toString());
    formData.append('warranty_id', this.productoEditable.warranty_id.toString());
    formData.append('price_usd', this.productoEditable.price_usd.toString());
    formData.append('stock', this.productoEditable.stock.toString());
    formData.append('active', this.productoEditable.active ? 'true' : 'false');
    if (this.productoEditable.image_url instanceof File) {
      formData.append('image_url', this.productoEditable.image_url);
    }

    this.productos.editarProducto(this.productoEditable.id, formData).subscribe({
      next: () => {
        this.noti.success('Producto actualizado', 'Los datos han sido actualizados correctamente');
        this.editarProductoModalVisible = false;
        this.cargarProductos(this.currentPage, this.pageSize);
      },
      error: (err) => {
        console.error('Error al actualizar producto', err);
        this.noti.error('Error', 'No se pudo actualizar el producto');
      }
    });
  }
}