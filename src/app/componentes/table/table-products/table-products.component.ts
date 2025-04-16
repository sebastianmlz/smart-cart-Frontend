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
import { Inventory } from '../../../models/inventario.model';
import { ProductWithInventory } from '../../../models/producto-inventario.model';
import { Brand } from '../../../models/brand.model';
import { Category } from '../../../models/category.model';
import { Warranty } from '../../../models/warranty.model';
import { CreateProduct } from '../../../models/create-product.model';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

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
    DialogModule,          // <--- para p-dialog
    DropdownModule,        // <--- para p-dropdown
    InputTextModule,       // <--- para pInputText
    InputTextModule,   // <--- para pInputTextarea
    ButtonModule,          // <--- para p-button
  ],
  templateUrl: './table-products.component.html',
  styleUrl: './table-products.component.css'
})
export class TableProductsComponent {

  //variables para obtener y cargar productos
  products: Product[] = [];
  inventarios: Inventory[] = [];
  productosCompletos: ProductWithInventory[] = [];


  // productosCompletos: ProductWithInventory[] = [];
  productoEditable: any = {};
  editarProductoModalVisible = false;


  //variables para registrar un producto
  brands: Brand[] = [];
  categories: Category[] = [];
  warranties: Warranty[] = [];

  nuevoProducto: CreateProduct = {
    brand_id: 0,
    category_id: 0,
    // warranty_id: 0,
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




  constructor(public productos: ProductosService,
    private authService: AuthService,
    private noti: NotificacionService,
  ) { }

  ngOnInit() {
    // this.cargarDatosCompletos();
    // this.cargarProductos();
    // this.cargarInventario();
    this.cargarDatosCompletos()
    this.cargarFormOpciones();
    
  }

  cargarProductos() {
    this.productos.obtenerProductos().subscribe({
      next: (res) => {
        this.products = res.items;
        console.log("productos:", this.products);
      },
      error: (err) => console.error('Error al cargar los productos', err),
    });
  }

  cargarInventario(): void {
    this.productos.getInventarioCompleto().subscribe({
      next: (res) => {
        this.inventarios = res.items;
      },
      error: (err) => console.error('Error al obtener inventario', err),
    });
  }

  cargarDatosCompletos(): void {
    this.productos.obtenerProductos().subscribe({
      next: (resProd) => {
        const productos = resProd.items;
        console.log("productos cargados:", resProd.items);

  
        this.productos.getInventarioCompleto().subscribe({
          next: (resInv) => {
            const inventarios = resInv.items;
            console.log("inventarios: ", resInv.items);
            this.productosCompletos = productos.map(producto => {
              const inventario = inventarios.find(i => i.product === producto.id);
              

            
              return {
                id: producto.id,
                name: producto.name,
                active: producto.active,
                image_url: producto.image_url,
                category: producto.category,
                technical_specifications: producto.technical_specifications || '',
                description: producto.description || '',
                price_usd: producto.price_usd || 0,
                stock: inventario?.stock || 0
              } as ProductWithInventory; // 👈 CAST EXPLÍCITO
            });
            
          },
          error: (err) => console.error("Error al obtener inventario", err),
        });
      },
      error: (err) => console.error("Error al obtener productos", err),
    });    
  }
  


  cargarFormOpciones(): void {
    this.productos.getBrands().subscribe({
      next: (res) =>{
        console.log("brands: ",res.items);
        this.brands = res.items;
      } ,
      error: (err) => console.error('Error al cargar brands', err)
    });

    this.productos.getCategories().subscribe({
      next: (res) => this.categories = res.items,
      error: (err) => console.error('Error al cargar categories', err)
    });

    this.productos.getWarranties().subscribe({
      next: (res) => this.warranties = res.items,
      error: (err) => console.error('Error al cargar warranties', err)
    });
  }

  abrirModalNuevoProducto(): void {
    this.nuevoProducto = {
      brand_id: 0,
      category_id: 0,
      // warranty_id: 0,
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
    if (file) {
      this.nuevoProducto.image_url = file;
    }
  }

  registrarProducto(): void {
    const formData = new FormData();

    formData.append('brand', this.nuevoProducto.brand_id.toString());
    formData.append('category', this.nuevoProducto.category_id.toString());
    // formData.append('warranty', this.nuevoProducto.warranty_id.toString());
    formData.append('name', this.nuevoProducto.name);
    formData.append('description', this.nuevoProducto.description);
    formData.append('active', this.nuevoProducto.active ? 'true' : 'false');
    formData.append('technical_specifications', this.nuevoProducto.technical_specifications);
    formData.append('image', this.nuevoProducto.image_url); // importante
    formData.append('price_usd', this.nuevoProducto.price_usd.toString());
    formData.append('created_at', this.nuevoProducto.created_at);
    formData.append('stock', this.nuevoProducto.stock.toString());

    this.productos.createProduct(formData).subscribe({
      next: (productoCreado) => {
        const product_id = productoCreado.id;
    
        setTimeout(() => {
          const inventario = {
            product: product_id,
            stock: this.nuevoProducto.stock
          };          
          console.log("Inventario a enviar:", inventario);


          this.productos.createInventory(inventario).subscribe({
            next: (res) => {
              console.log('Respuesta del backend:', res);
              this.noti.success('Inventario creado', '¡Todo bien!');
              this.cargarDatosCompletos();
            },
            error: (err) => {
              console.error('Error al crear inventario', err);
              this.noti.error('Fallo', 'No se creó el inventario');
            }
          });
          
        }, 300); // ⏱️ Espera 300ms para asegurar que el producto ya esté listo
      },
      error: (err) => {
        console.error('Error al registrar producto', err);
        this.noti.error('No se pudo regitrar producto', 'Hubo un error al registrar el producto');
      }
    });
    
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productos.eliminarProducto(id).subscribe({
        next: () => {
          this.noti.success('Producto eliminado', 'El producto fue eliminado correctamente');
          this.cargarDatosCompletos(); // mejor usar cargarDatosCompletos si usás inventario también
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
      brand: producto.brand,
      category: producto.category,
      created_at: producto.created_at,
      active: producto.active,
      price_usd: producto.price_usd,
    };
  
    this.editarProductoModalVisible = true;
  }
  
  
  onEditFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.productoEditable.image = file;
  }

  /*Funcion para abrir el modal con los datos cargados*/
  editarProducto(): void {
    const formData = new FormData();
    formData.append('name', this.productoEditable.name);
    formData.append('description', this.productoEditable.description);
    formData.append('technical_specifications', this.productoEditable.technical_specifications);
    formData.append('brand_id', this.productoEditable.brand_id.toString());
    formData.append('category_id', this.productoEditable.category_id.toString());
    // formData.append('warranty_id', this.productoEditable.warranty_id.toString());
    // formData.append('model_3d_url', this.productoEditable.model_3d_url || '');
    // formData.append('ar_url', this.productoEditable.ar_url || '');
    if (this.productoEditable.image) formData.append('image', this.productoEditable.image);
  
    this.productos.editarProducto(this.productoEditable.id, formData).subscribe({
      next: () => {
        this.noti.success('Producto actualizado', 'Los datos han sido actualizados correctamente');
        this.editarProductoModalVisible = false;
        this.cargarDatosCompletos();
      },
      error: (err) => {
        console.error('Error al actualizar producto', err);
        this.noti.error('Error', 'No se pudo actualizar el producto');
      }
    });
  }

  // agregarProducto(newProduct: Product): void {
  //   this.productos.agregarProductos(newProduct).subscribe({
  //     next: () => this.cargarProductos(),
  //     error: (err) => console.error('Error al agregar el producto', err),
  //   });
  // }
}
