import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.model';
import { Inventory } from '../models/inventario.model';
import { PaginatedResponse } from '../models/paginated-response.model';
import { Brand } from '../models/brand.model';
import { Category } from '../models/category.model';
import { Warranty } from '../models/warranty.model';
import { CreateProduct } from '../models/create-product.model';

@Injectable({
  providedIn: 'root'
})

export class ProductosService {

  baseUrl = environment.apiUrl + '/products/';

  constructor(private http: HttpClient) { }

  // agregarProductos(product: Product): Observable<Product> {
  //   return this.http.post<Product>(this.baseUrl, product);
  // }

  createProduct(data: FormData): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.baseUrl}`, data, { headers });
  }

  createInventory(data: { product: number; stock: number }): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json'); // <-- asegúrate de esto
  
    return this.http.post(`${this.baseUrl}inventory/`, data, { headers });
  }
  

  // obtenerProductos(page: number = 1, pageSize: number = 20): Observable<{ items: Product[] }> {
  //   const token = localStorage.getItem('access');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  //   return this.http.get<{ items: Product[] }>(`${this.baseUrl}?page=${page}&page_size=${pageSize}`, { headers });
  // }

  obtenerProductos(): Observable<PaginatedResponse<Product>> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}`, { headers });
  }

  editarProducto(product_id: number, data: FormData): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch(`${this.baseUrl}${product_id}`, data, { headers });
  }

  eliminarProducto(id: number): Observable<any> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}${id}`, { headers });
  }
  


  getInventarioCompleto(): Observable<PaginatedResponse<Inventory>> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<PaginatedResponse<Inventory>>(`${this.baseUrl}inventory`, { headers });
  }


  getBrands(): Observable<PaginatedResponse<Brand>> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<PaginatedResponse<Brand>>(`${this.baseUrl}brands/`, { headers });
  }
  
  getCategories(): Observable<PaginatedResponse<Category>> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<PaginatedResponse<Category>>(`${this.baseUrl}categories/`, { headers });
  }
  
  getWarranties(): Observable<PaginatedResponse<Warranty>> {
    const token = localStorage.getItem('access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<PaginatedResponse<Warranty>>(`${this.baseUrl}warranty/`, { headers });
  }


}
